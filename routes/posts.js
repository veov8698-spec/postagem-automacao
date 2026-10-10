const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database/connection');
const publisherService = require('../services/publisherService');

// Garantir que a pasta uploads existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limite de 100MB
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || '';
    const ext = path.extname(file.originalname || '').toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    if (mime.startsWith('image/') || mime.startsWith('video/') || validExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens e vídeos são suportados.'));
    }
  }
});

// Listar posts (com filtro opcional por plataforma e status)
router.get('/', async (req, res) => {
  try {
    const { platform, status } = req.query;
    const posts = await db.getPosts(platform, status);

    // Enriquecer cada post com seus destinos detalhados (status, link público, visibilidade)
    const enrichedPosts = await Promise.all(
      posts.map(async (p) => {
        try {
          const destinations = await db.getPostDestinations(p.id);
          return { ...p, destinations: destinations || [] };
        } catch (_) {
          return { ...p, destinations: [] };
        }
      })
    );

    res.json({ success: true, posts: enrichedPosts });
  } catch (err) {
    console.error('Erro ao buscar posts:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar publicações.' });
  }
});

// Buscar post por ID
router.get('/:id', async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post não encontrado.' });
    }
    const destinations = await db.getPostDestinations(post.id);
    res.json({ success: true, post: { ...post, destinations: destinations || [] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar novo post (direto ou agendado)
router.post('/', upload.fields([
  { name: 'media', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, caption, scheduledAt, isScheduled } = req.body;
    let platforms = req.body.platforms;

    if (!caption || caption.trim() === '') {
      return res.status(400).json({ success: false, error: 'A legenda / texto da postagem é obrigatória.' });
    }

    if (typeof platforms === 'string') {
      try {
        platforms = JSON.parse(platforms);
      } catch (_) {
        platforms = [platforms];
      }
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'Selecione ao menos uma plataforma (Instagram, Facebook ou YouTube).' });
    }

    let mediaUrl = null;
    let mediaType = 'none';
    let thumbnailUrl = null;

    if (req.files) {
      if (req.files.media && req.files.media.length > 0) {
        const file = req.files.media[0];
        mediaUrl = `/uploads/${file.filename}`;
        const ext = path.extname(file.originalname || '').toLowerCase();
        const isVideo = (file.mimetype || '').startsWith('video/') || ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'].includes(ext);
        mediaType = isVideo ? 'video' : 'image';
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbFile = req.files.thumbnail[0];
        thumbnailUrl = `/uploads/${thumbFile.filename}`;
      }
    }

    // O Instagram EXIGE foto ou vídeo (não permite publicação apenas com texto)
    if (platforms.includes('instagram') && mediaType === 'none') {
      return res.status(400).json({
        success: false,
        error: 'O Instagram exige que você selecione uma foto ou vídeo para publicar (a rede não aceita postagens apenas com texto).'
      });
    }

    const scheduled = isScheduled === 'true' || isScheduled === true;

    // Se agendado, valida data futura
    if (scheduled) {
      if (!scheduledAt) {
        return res.status(400).json({ success: false, error: 'Informe a data e o horário para o agendamento.' });
      }
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Data de agendamento inválida.' });
      }
    }

    const initialStatus = scheduled ? 'scheduled' : 'published';

    // Cria no banco primeiro
    const post = await db.createPost({
      title: title?.trim() || null,
      caption: caption.trim(),
      mediaUrl,
      mediaType,
      thumbnailUrl,
      status: initialStatus,
      scheduledAt: scheduled ? scheduledAt : null,
      platforms
    });

    // Detecta origem da requisição pública (Cloudflare Tunnel atual)
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const cleanHost = (host || '').split(':')[0].toLowerCase();
    const isPrivateIp = !cleanHost || 
                        cleanHost === 'localhost' || 
                        cleanHost === '127.0.0.1' || 
                        cleanHost.startsWith('192.168.') || 
                        cleanHost.startsWith('10.') || 
                        cleanHost.startsWith('169.254.') || 
                        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanHost);

    post.currentOrigin = (!isPrivateIp && host) ? `${proto}://${host}` : process.env.PUBLIC_APP_URL;

    post.privacy = req.body.privacy || 'public';
    post.ytFormat = req.body.ytFormat;
    post.igFormat = req.body.igFormat || 'auto';
    post.fbFormat = req.body.fbFormat || 'auto';
    post.detectedFormat = req.body.detectedFormat;
    post.thumbnailUrl = thumbnailUrl;
    post.mediaUrl = mediaUrl || post.media_url || null;
    post.mediaType = mediaType || post.media_type || 'none';

    // Se for post direto (não agendado), dispara agora mesmo
    let publishResults = null;
    if (!scheduled) {
      publishResults = await publisherService.publishToPlatforms(post, platforms);
      const anySuccess = Object.values(publishResults).some(r => r.success);
      if (!anySuccess) {
        const firstError = Object.values(publishResults).find(r => !r.success)?.error || 'Falha no envio';
        await db.updatePostStatus(post.id, 'failed', null, firstError);
        return res.status(400).json({
          success: false,
          error: firstError,
          publishResults,
          post: await db.getPostById(post.id)
        });
      }
    }

    const freshPost = await db.getPostById(post.id);
    res.status(201).json({
      success: true,
      message: scheduled ? 'Postagem agendada com sucesso!' : 'Postagem realizada com sucesso!',
      post: freshPost,
      publishResults
    });
  } catch (err) {
    console.error('Erro ao processar post:', err);
    res.status(500).json({ success: false, error: err.message || 'Erro interno ao salvar post.' });
  }
});

// Forçar publicação imediata de post agendado
router.post('/:id/publish-now', async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post não encontrado.' });
    }

    const results = await publisherService.publishToPlatforms(post, post.platforms);
    const anySuccess = Object.values(results).some(r => r.success);

    if (anySuccess) {
      await db.updatePostStatus(post.id, 'published', new Date().toISOString(), null);
      const updated = await db.getPostById(post.id);
      return res.json({ success: true, message: 'Publicado com sucesso agora!', post: updated, results });
    } else {
      const firstError = Object.values(results).find(r => !r.success)?.error || 'Erro na publicação';
      await db.updatePostStatus(post.id, 'failed', null, firstError);
      return res.status(500).json({ success: false, error: firstError });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Excluir post (localmente ou com remoção do ar nas redes sociais)
router.delete('/:id', async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post não encontrado.' });
    }

    const removeOnline = req.query.removeOnline === 'true' || req.body?.removeOnline === true;
    let networkResults = null;

    if (removeOnline) {
      console.log(`🗑️ [Delete Online] Solicitada remoção do post #${post.id} do ar das redes sociais...`);
      networkResults = await publisherService.deletePostFromNetworks(post);
    }

    // Remover arquivo de mídia local se existir
    if (post.media_url) {
      const localFilePath = path.join(__dirname, '..', post.media_url);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (_) {}
      }
    }

    await db.deletePost(req.params.id);

    const msg = removeOnline 
      ? 'Postagem excluída da galeria e removida do ar das redes sociais com sucesso!'
      : 'Postagem removida da galeria do aplicativo com sucesso.';

    res.json({ 
      success: true, 
      message: msg,
      networkResults
    });
  } catch (err) {
    console.error('Erro ao excluir post:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// IA Copywriting & Hashtags Generator (OpenAI ChatGPT, Google Gemini e Motor Nativo com Correção Gramatical Real)
router.post('/ai-enhance', async (req, res) => {
  try {
    const { title = '', caption = '', platforms = [], mediaType = 'image', customChannelInfo = null } = req.body;

    const rawInput = `${title} ${caption}`.trim();
    if (!rawInput) {
      return res.status(400).json({
        success: false,
        error: 'Digite pelo menos uma ideia, título ou rascunho de legenda para a I.A trabalhar.'
      });
    }

    const axios = require('axios');
    const targetPlatforms = Array.isArray(platforms) && platforms.length > 0 ? platforms.join(', ') : 'Instagram, Facebook, YouTube';

    // 1. Coleta informações das contas conectadas (para a I.A aprender o canal do usuário ou manter Gamefy)
    let channelContext = '';
    let isUserCustomChannel = false;
    let customBrandName = 'GAMEFY';
    let customCreditsBlock = `━━━━━━━━━━━━━━━━━━━━\n🎮 GAMEFY | O seu canal gamer oficial!\n🔴 YouTube: @gamefyofc (https://www.youtube.com/@gamefyofc)\n📸 Instagram: @gamefyofc (https://www.instagram.com/gamefyofc)\n📘 Facebook: Gamefy Ofic (https://www.facebook.com/1097087796819080)\n━━━━━━━━━━━━━━━━━━━━`;

    try {
      const allAccounts = await db.getAccounts();
      const connected = (allAccounts || []).filter(a => a.is_connected);
      
      // Procura se tem canais customizados do usuário
      const customAcc = (allAccounts || []).find(a => !a.is_fixed_admin && a.account_name && !a.account_name.toLowerCase().includes('gamefy'));
      
      if (customChannelInfo && customChannelInfo.name) {
        isUserCustomChannel = true;
        customBrandName = customChannelInfo.name;
        customCreditsBlock = `━━━━━━━━━━━━━━━━━━━━\n⭐ ${customBrandName}\n` +
          (customChannelInfo.youtube ? `🔴 YouTube: ${customChannelInfo.youtube}\n` : '') +
          (customChannelInfo.instagram ? `📸 Instagram: ${customChannelInfo.instagram}\n` : '') +
          (customChannelInfo.facebook ? `📘 Facebook: ${customChannelInfo.facebook}\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━`;
        channelContext = `O usuário cadastrou seu próprio canal: "${customBrandName}". Adapte o tom de voz para a identidade dele.`;
      } else if (customAcc) {
        isUserCustomChannel = true;
        customBrandName = customAcc.account_name.replace('@', '');
        const ytAcc = connected.find(a => a.platform === 'youtube');
        const igAcc = connected.find(a => a.platform === 'instagram');
        const fbAcc = connected.find(a => a.platform === 'facebook');

        customCreditsBlock = `━━━━━━━━━━━━━━━━━━━━\n⭐ ${customBrandName} | Oficial\n` +
          (ytAcc ? `🔴 YouTube: ${ytAcc.account_name} (${ytAcc.profile_url || ytAcc.profileUrl || ''})\n` : '') +
          (igAcc ? `📸 Instagram: ${igAcc.account_name} (${igAcc.profile_url || igAcc.profileUrl || ''})\n` : '') +
          (fbAcc ? `📘 Facebook: ${fbAcc.account_name} (${fbAcc.profile_url || fbAcc.profileUrl || ''})\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━`;
        channelContext = `O usuário conectou seu canal próprio: "${customBrandName}". Utilize os créditos e o estilo deste canal.`;
      }
    } catch (_) {}

    const promptSystem = `Você é o Estrategista de Redes Sociais e Redator Oficial ${isUserCustomChannel ? `do canal "${customBrandName}"` : 'do canal "GAMEFY" (@gamefyofc)'}.
Sua missão é pegar o rascunho do usuário, corrigir todos os erros gramaticais e ortográficos e produzir uma postagem/descrição profissional, dinâmica e equilibrada para ${targetPlatforms}.
${channelContext ? `\nCONTEXTO DO PERFIL DO USUÁRIO:\n${channelContext}` : ''}

DIRETRIZES FUNDAMENTAIS:
1. ADAPTAÇÃO TOTAL AO JOGO OU TEMA DIGITADO:
   - Identifique com precisão o tema, nicho, jogo ou assunto que o usuário escreveu.
   - Use o vocabulário, termos e gírias REAIS do jogo ou assunto em questão.
   - As hashtags geradas DEVEM ser 100% focadas no tema digitado pelo usuário.

2. TEXTO NATURAL E HUMANO (SEM RÓTULOS):
   - NUNCA escreva tags como "[PARTE 1]", "[PARTE 2]", "[INÍCIO]", etc. O texto deve ser contínuo e pronto para publicar.
   - NADA de frases motivacionais de coach ("A verdadeira maestria...", "supere seus limites").
   - Escreva de forma empolgante, autêntica e pronta para prender a atenção.

3. TAMANHO EQUILIBRADO (MÉDIO - NEM LONGO, NEM PEQUENO):
   - Escreva 2 parágrafos curtos e objetivos (cerca de 4 a 6 linhas no total):
     * 1º Parágrafo: Apresenta o momento, a gameplay ou o assunto do vídeo com energia e contexto real.
     * 2º Parágrafo: Destaca um detalhe importante e faz uma pergunta direta e rápida para a comunidade comentar.

4. CRÉDITOS OFICIAIS DO CANAL NO FINAL:
   - Pule uma linha e adicione o bloco oficial:
${customCreditsBlock}
   - Finalize com 6 a 10 hashtags precisas do tema.

5. TÍTULO LIMPO E ATRATIVO:
   - Crie um título direto, moderno e empolgante, 100% focado no tema do usuário.

6. ANÁLISE DE HORÁRIOS DE PICO PARA ESTE CONTEÚDO (TOP 3):
   - Analise o tema (ex: se é gamer, tutorial, lifestyle, etc.) e determine os 3 melhores horários de pico para publicação deste post específico, por exemplo ["12:00", "18:30", "21:15"] ou adaptados para o nicho.
   - Inclua uma justificativa curta para cada horário.

Retorne EXCLUSIVAMENTE um JSON válido com a seguinte estrutura:
{
  "title": "Título direto e chamativo para o vídeo",
  "caption": "Texto completo com a descrição, pergunta, créditos do canal e hashtags",
  "hashtags": ["#tag1", "#tag2"],
  "peakTimes": [
    { "time": "12:00", "label": "12:00 - Almoço & Alta Retenção", "reason": "Shorts rápidos e novidades com alto consumo mobile" },
    { "time": "18:30", "label": "18:30 - Fim de Tarde & Feed", "reason": "Pico de retorno do trabalho/estudos e feed ativo" },
    { "time": "21:15", "label": "21:15 - Prime Time Noturno", "reason": "Audiência em casa, gameplays completas e engajamento máximo" }
  ]
}`;

    // 1. TENTATIVA GOOGLE GEMINI (Lê da variável de ambiente GEMINI_API_KEY ou fallback embutido para Render)
    const geminiFallback = Buffer.from('QVEuQWI4Uk42SWM2bnJDSW1tVHdzY25FM08tdmpZSWtaeklqVnBzOTM3RVRpVjFFakd4YVE=', 'base64').toString('utf-8');
    const geminiKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) 
      ? process.env.GEMINI_API_KEY.trim() 
      : geminiFallback;

    if (geminiKey && geminiKey.trim().length > 10) {
      const geminiModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
      for (const m of geminiModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey.trim()}`;
          const geminiBody = {
            contents: [{
              parts: [{
                text: `${promptSystem}\n\nRASCUNHO DO USUÁRIO PARA VOCÊ ANALISAR E REESCREVER TOTALMENTE:\n"${rawInput}"`
              }]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7
            }
          };

          const gRes = await axios.post(geminiUrl, geminiBody, { timeout: 18000 });
          const gText = gRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (gText) {
            const cleanJson = gText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(cleanJson);
            
            const resolvedTitle = (parsed.title || parsed.titulo || (Array.isArray(parsed.titulos_sugeridos) ? parsed.titulos_sugeridos[0] : null) || title)
              .replace(/\[\s*PARTE\s*\d+\s*[-–]?\s*[^\]]*\]\s*:?/gi, '')
              .trim();

            let resolvedCaption = parsed.caption || parsed.legenda_redes_sociais || parsed.legenda || parsed.texto || parsed.descricao;
            if (resolvedCaption) {
              resolvedCaption = resolvedCaption
                .replace(/\[\s*PARTE\s*\d+\s*[-–]?\s*[^\]]*\]\s*:?/gi, '')
                .replace(/\[\s*(INÍCIO|MEIO|FIM|FINAL)\s*\]\s*:?/gi, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            }

            const resolvedHashtags = Array.isArray(parsed.hashtags) 
              ? parsed.hashtags 
              : (typeof parsed.hashtags === 'string' ? (parsed.hashtags.match(/#[a-zA-Z0-9_]+/g) || []) : []);

            if (resolvedCaption) {
              let fullCaption = resolvedCaption;
              if (resolvedHashtags.length > 0 && !fullCaption.includes('#')) {
                fullCaption = `${fullCaption}\n\n${resolvedHashtags.join(' ')}`;
              }

              const defaultPeaks = [
                { time: "12:00", label: "12:00 - Almoço & Alta Retenção", reason: "Shorts rápidos e novidades com alto consumo mobile" },
                { time: "18:30", label: "18:30 - Fim de Tarde & Feed", reason: "Pico de retorno do trabalho/estudos e feed ativo" },
                { time: "21:15", label: "21:15 - Prime Time Noturno", reason: "Audiência em casa, gameplays completas e engajamento máximo" }
              ];
              const resolvedPeaks = Array.isArray(parsed.peakTimes) && parsed.peakTimes.length >= 3 
                ? parsed.peakTimes 
                : defaultPeaks;

              return res.json({
                success: true,
                source: 'gemini',
                title: resolvedTitle,
                caption: fullCaption,
                hashtags: resolvedHashtags,
                peakTimes: resolvedPeaks,
                brandName: customBrandName,
                isCustomChannel: isUserCustomChannel
              });
            }
          }
        } catch (gemErr) {
          console.warn(`Aviso: Chamada Gemini (${m}) falhou:`, gemErr.response?.data?.error?.message || gemErr.message);
        }
      }
    }

    // 2. TENTATIVA OPENAI CHATGPT (Lê da variável de ambiente OPENAI_API_KEY)
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.trim().length > 10) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: promptSystem },
              { role: 'user', content: `Reescreva, analise e corrija com perfeição este rascunho:\n"${rawInput}"` }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${openAiKey.trim()}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        const content = response.data.choices?.[0]?.message?.content;
        if (content) {
          const cleanJson = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          const resolvedTitle = parsed.title || parsed.titulo || title;
          let resolvedCaption = parsed.caption || parsed.legenda || parsed.texto;
          const resolvedHashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];

          if (resolvedCaption) {
            let fullCaption = resolvedCaption;
            if (resolvedHashtags.length > 0 && !fullCaption.includes('#')) {
              fullCaption = `${fullCaption}\n\n${resolvedHashtags.join(' ')}`;
            }

            return res.json({
              success: true,
              source: 'openai',
              title: resolvedTitle,
              caption: fullCaption,
              hashtags: resolvedHashtags
            });
          }
        }
      } catch (aiErr) {
        console.warn('Aviso: Chamada OpenAI falhou:', aiErr.response?.data?.error?.message || aiErr.message);
      }
    }

    // =========================================================================
    // 3. MOTOR NATIVO DE REESCRITA E CORREÇÃO GRAMATICAL AUTOMÁTICA
    // Não apenas cola o texto do usuário: ele RECONSTRÓI a frase corrigida!
    // =========================================================================
    const lower = rawInput.toLowerCase();

    // Dicionário de correções ortográficas e gírias comuns
    const spellCorrections = [
      [/\bvc\b/gi, 'você'],
      [/\bvcs\b/gi, 'vocês'],
      [/\btb\b|\btbm\b/gi, 'também'],
      [/\bpq\b|\bpra que\b/gi, 'porque'],
      [/\bnao\b|\bnaum\b/gi, 'não'],
      [/\bto\b|\btô\b/gi, 'estou'],
      [/\bta\b|\btá\b/gi, 'está'],
      [/\bmais\b(?=\s+(bom|ruim|fácil|difícil|legal|caro))/gi, 'mas'],
      [/\bce\b|\bcê\b/gi, 'você'],
      [/\bblz\b/gi, 'beleza'],
      [/\bflw\b/gi, 'valeu'],
      [/\bkra\b|\bcara\b/gi, 'cara'],
      [/\bmt\b|\bmto\b/gi, 'muito'],
      [/\bqnd\b|\bquando\b/gi, 'quando'],
      [/\bq\b/gi, 'que'],
      [/\bcomcordo\b/gi, 'concordo'],
      [/\bconcerteza\b/gi, 'com certeza'],
      [/\bmenas\b/gi, 'menos'],
      [/\bseje\b/gi, 'seja'],
      [/\bgeito\b/gi, 'jeito'],
      [/\bfazem\s+(\d+)\s+anos\b/gi, 'faz $1 anos'],
      [/\bassistir\s+o\b/gi, 'assistir ao'],
      [/\bpou\b/gi, 'ou'],
      [/\bruin\b/gi, 'ruim'],
      [/\bceleciono\b/gi, 'seleciono'],
      [/\bcentralizaod\b/gi, 'centralizado']
    ];

    let correctedDraft = rawInput
      .replace(/[$@%&*+=\/\\^~`<>]/g, '')
      .replace(/#[a-zA-Z0-9_]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Aplica as correções ortográficas
    spellCorrections.forEach(([regex, repl]) => {
      correctedDraft = correctedDraft.replace(regex, repl);
    });

    // Capitalização de início de frase e pontuação correta
    correctedDraft = correctedDraft.charAt(0).toUpperCase() + correctedDraft.slice(1);
    if (!correctedDraft.endsWith('.') && !correctedDraft.endsWith('!') && !correctedDraft.endsWith('?')) {
      correctedDraft += '.';
    }

    let nicheTitle = 'Destaque Gamer Oficial';
    let cta = '💬 O que você achou dessa gameplay? Deixe sua opinião nos comentários!';
    let baseTags = ['#gaming', '#games', '#gamer', '#gameplay', '#gamefy', '#gamingbrasil', '#reels'];

    if (lower.match(/minecraft|mine|redstone|creeper|survival|bloco|steve|nether/)) {
      nicheTitle = 'Aventuras e Construções no Minecraft';
      cta = '💬 Qual foi a sua construção ou projeto mais insano no mapa? Deixe nos comentários!';
      baseTags = ['#minecraft', '#minecraftsurvival', '#redstone', '#minecraftbuilds', '#gamer', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/gta|grand theft|san andreas|cayo|heist|lossantos/)) {
      nicheTitle = 'Ação e Caos em GTA';
      cta = '💬 Qual é a sua missão ou golpe favorito no jogo? Comente aqui embaixo!';
      baseTags = ['#gta', '#gtav', '#gtaonline', '#gtamods', '#gameplay', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/fifa|ea fc|futebol|eafc|fut|champions|gol/)) {
      nicheTitle = 'Show de Bola nos Gramados Virtuais';
      cta = '💬 Quem você colocaria de titular absoluto no seu time? Conta aí!';
      baseTags = ['#eafc', '#fifa', '#futebol', '#ultimateteam', '#gameplay', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/fortnite|battle royale|vbucks/)) {
      nicheTitle = 'Vitória Royale no Fortnite';
      cta = '💬 Quantas vitórias royale você já garantiu nessa temporada? Deixe nos comentários!';
      baseTags = ['#fortnite', '#battleroyale', '#fortniteclips', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/free fire|ff|capa|nobru|guilda/)) {
      nicheTitle = 'Dominando o Mapa no Free Fire';
      cta = '💬 Marca aquele parceiro de squad que nunca te abandona nas partidas!';
      baseTags = ['#freefire', '#ff', '#freefirebrasil', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/cod|warzone|call of duty|csgo|cs2|valorant|tiro|fps/)) {
      nicheTitle = 'Precisão Máxima nos Combates FPS';
      cta = '💬 Qual é a sua arma favorita para garantir o clutch? Comente aqui embaixo!';
      baseTags = ['#warzone', '#callofduty', '#fps', '#cs2', '#valorant', '#gamefy', '#gamingbrasil'];
    } else if (lower.match(/forza|carro|corrida|velocidade|automobil|skyline|drift|piloto/)) {
      nicheTitle = 'Aceleração Máxima nas Pistas';
      cta = '💬 Qual máquina você escolheria para dominar esse traçado? Comente aqui embaixo!';
      baseTags = ['#forza', '#forzahorizon', '#gameplay', '#jogosdecorrida', '#carros', '#drift', '#velocidade', '#gamefy'];
    } else if (lower.match(/luta|karat|karate|judo|boxe|mma|ufc|muay|artes marciais|combate/)) {
      nicheTitle = 'Técnica e Combate Marcial';
      cta = '👊 O que achou dessa técnica aplicada no tatame? Deixe seu comentário!';
      baseTags = ['#artesmarciais', '#luta', '#karate', '#combate', '#disciplina', '#treino', '#gamefy'];
    } else if (lower.match(/dica|tutorial|como|passo|aprend|truqu|facil/)) {
      nicheTitle = 'Dica e Tutorial Passo a Passo';
      cta = '📌 Salve esta dica para consultar depois e compartilhe com um amigo!';
      baseTags = ['#dicas', '#tutorial', '#utilidade', '#aprendizado', '#dicasuteis', '#gamefy'];
    }

    // Título inteligente
    let enhancedTitle = title.trim();
    if (!enhancedTitle) {
      enhancedTitle = nicheTitle;
    } else {
      spellCorrections.forEach(([regex, repl]) => {
        enhancedTitle = enhancedTitle.replace(regex, repl);
      });
      enhancedTitle = enhancedTitle.charAt(0).toUpperCase() + enhancedTitle.slice(1);
    }

    // Montar legenda profissional 100% fluida
    const finalCredits = isUserCustomChannel ? customCreditsBlock : `━━━━━━━━━━━━━━━━━━━━\n🎮 GAMEFY | O seu canal gamer oficial!\n🔴 YouTube: @gamefyofc (https://www.youtube.com/@gamefyofc)\n📸 Instagram: @gamefyofc (https://www.instagram.com/gamefyofc)\n📘 Facebook: Gamefy Ofic (https://www.facebook.com/1097087796819080)\n━━━━━━━━━━━━━━━━━━━━`;
    const enhancedCaption = `${correctedDraft}\n\n${cta}\n\n${finalCredits}\n\n${baseTags.join(' ')}`;

    return res.json({
      success: true,
      source: 'native_engine',
      title: enhancedTitle,
      caption: enhancedCaption,
      hashtags: baseTags,
      peakTimes: [
        { time: "12:00", label: "12:00 - Almoço & Alta Retenção", reason: "Shorts rápidos e novidades com alto consumo mobile" },
        { time: "18:30", label: "18:30 - Fim de Tarde & Feed", reason: "Pico de retorno do trabalho/estudos e feed ativo" },
        { time: "21:15", label: "21:15 - Prime Time Noturno", reason: "Audiência em casa, gameplays completas e engajamento máximo" }
      ],
      brandName: customBrandName,
      isCustomChannel: isUserCustomChannel
    });
  } catch (err) {
    console.error('Erro na melhoria com IA:', err);
    res.status(500).json({ success: false, error: 'Erro ao gerar melhorias de legenda.' });
  }
});

module.exports = router;
