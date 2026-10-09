const cron = require('node-cron');
const { db } = require('../database/connection');
const publisherService = require('./publisherService');

function startScheduler() {
  console.log('⏰ [Scheduler] Agendador de postagens inicializado (verificação a cada 30 segundos).');

  cron.schedule('*/30 * * * * *', async () => {
    try {
      const duePosts = await db.getDueScheduledPosts();
      if (!duePosts || duePosts.length === 0) return;

      console.log(`⏰ [Scheduler] Encontrado(s) ${duePosts.length} post(s) pronto(s) para publicação.`);

      for (const post of duePosts) {
        console.log(`🚀 [Scheduler] Publicando automaticamente post #${post.id} (${post.title || 'Sem título'})...`);
        const fullPost = await db.getPostById(post.id);
        
        if (!fullPost || !fullPost.platforms || fullPost.platforms.length === 0) {
          await db.updatePostStatus(post.id, 'failed', null, 'Nenhuma plataforma configurada para o post.');
          continue;
        }

        const results = await publisherService.publishToPlatforms(fullPost, fullPost.platforms);
        
        // Verifica se ao menos uma teve sucesso
        const anySuccess = Object.values(results).some(r => r.success);
        if (anySuccess) {
          await db.updatePostStatus(post.id, 'published', new Date().toISOString(), null);
          console.log(`✅ [Scheduler] Post #${post.id} publicado com sucesso nas redes!`);
        } else {
          const firstError = Object.values(results).find(r => !r.success)?.error || 'Falha na publicação';
          await db.updatePostStatus(post.id, 'failed', null, firstError);
          console.error(`❌ [Scheduler] Falha ao publicar post #${post.id}: ${firstError}`);
        }
      }
    } catch (err) {
      console.error('⚠️ [Scheduler] Erro durante o ciclo de verificação:', err.message);
    }
  });
}

module.exports = { startScheduler };
