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
    const mime = file.mimetype;
    if (mime.startsWith('image/') || mime.startsWith('video/')) {
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
        mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbFile = req.files.thumbnail[0];
        thumbnailUrl = `/uploads/${thumbFile.filename}`;
      }
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
        return res.status(500).json({
          success: false,
          error: `Erro ao publicar: ${firstError}`,
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

// Excluir post
router.delete('/:id', async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post não encontrado.' });
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
    res.json({ success: true, message: 'Postagem removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
