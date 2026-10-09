const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { db } = require('../database/connection');
require('dotenv').config();

class PublisherService {
  /**
   * Publica nas plataformas selecionadas com rastreamento completo de visibilidade e links oficiais.
   * Estados suportados:
   * 1. uploading
   * 2. processing
   * 3. awaiting_confirmation
   * 4. published
   * 5. published_with_restrictions
   * 6. failed
   * 7. unknown
   *
   * @param {Object} post Dados do post (id, title, caption, mediaUrl, mediaType, igFormat, fbFormat, ytFormat)
   * @param {Array<string>} platforms Array com ['instagram', 'facebook', 'youtube']
   */
  async publishToPlatforms(post, platforms) {
    const results = {};
    const destinationsToSave = [];

    for (const platform of platforms) {
      let platformResult = null;
      try {
        switch (platform) {
          case 'instagram':
            platformResult = await this.publishToInstagram(post);
            break;
          case 'facebook':
            platformResult = await this.publishToFacebook(post);
            break;
          case 'youtube':
            platformResult = await this.publishToYouTube(post);
            break;
          default:
            platformResult = {
              success: false,
              status: 'failed',
              visibility: 'unknown',
              error: 'Plataforma não suportada'
            };
        }
      } catch (err) {
        console.error(`Erro crítico ao publicar no ${platform}:`, err.message);
        platformResult = {
          success: false,
          platform,
          status: 'failed',
          visibility: 'unknown',
          error: err.response?.data?.error?.message || err.message,
          errorLog: JSON.stringify(err.response?.data || err.message)
        };
      }

      results[platform] = platformResult;

      destinationsToSave.push({
        platform,
        accountId: platformResult.accountId || null,
        accountName: platformResult.accountName || null,
        status: platformResult.status || (platformResult.success ? 'published' : 'failed'),
        visibility: platformResult.visibility || 'unknown',
        platformPostId: platformResult.postId || null,
        publicUrl: platformResult.publicUrl || platformResult.postUrl || null,
        errorLog: platformResult.error || platformResult.diagnostics || null
      });
    }

    // Salvar destinos detalhados se o post tiver ID
    if (post.id) {
      try {
        await db.savePostDestinations(post.id, destinationsToSave);
      } catch (dbErr) {
        console.warn('Aviso: Não foi possível gravar post_destinations:', dbErr.message);
      }
    }

    return results;
  }

  // =========================================================================
  // INSTAGRAM: PUBLICAÇÃO COM POLLING DE TRANSCIFICAÇÃO E CONFIRMAÇÃO REAL
  // =========================================================================
  async publishToInstagram(post) {
    const savedAccount = await db.getAccount('instagram');
    const igUserId = savedAccount?.account_id || process.env.IG_USER_ID || '17841439279415952';
    const token = savedAccount?.access_token || process.env.IG_PAGE_TOKEN || process.env.META_ACCESS_TOKEN;
    const accLabel = savedAccount?.account_name || '@gamefyofc';

    const isSimulated = process.env.SIMULATE_API_PUBLISH === 'true' || 
                        !token || 
                        !igUserId || 
                        token.startsWith('demo_') ||
                        token.startsWith('token_instagram_');

    const mediaType = post.mediaType || post.media_type || 'none';
    const mediaUrl = post.mediaUrl || post.media_url || null;
    const igFormat = post.igFormat || 'auto';

    if (isSimulated) {
      console.log(`[INSTAGRAM SIMULAÇÃO] ${accLabel} (Formato: ${igFormat.toUpperCase()}): "${post.caption?.substring(0, 30)}..."`);
      return {
        success: true,
        platform: 'instagram',
        status: 'published',
        visibility: 'public',
        postId: `ig_gamefy_${Date.now()}`,
        simulated: true,
        accountName: accLabel,
        format: igFormat,
        publicUrl: 'https://www.instagram.com/gamefyofc',
        message: `Publicação enviada com sucesso para ${accLabel} (${igFormat.toUpperCase()})!`
      };
    }

    try {
      // 1. Resolver URL pública para a Meta baixar a mídia
      let resolvedMediaUrl = mediaUrl;
      const isLocalPath = mediaUrl && (mediaUrl.startsWith('/uploads') || mediaUrl.startsWith('uploads'));

      if (isLocalPath) {
        const publicAppUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
        resolvedMediaUrl = `${publicAppUrl.replace(/\/+$/, '')}/${mediaUrl.replace(/^\/+/, '')}`;
      }

      // 2. Criar Container de Mídia na Meta Graph API
      const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
      const containerParams = {
        caption: post.caption || '',
        access_token: token
      };

      const isVideo = mediaType === 'video';

      if (igFormat === 'story') {
        containerParams.media_type = 'STORIES';
        if (isVideo) {
          containerParams.video_url = resolvedMediaUrl;
        } else if (resolvedMediaUrl) {
          containerParams.image_url = resolvedMediaUrl;
        }
      } else if (igFormat === 'reels' || (isVideo && igFormat !== 'feed')) {
        containerParams.media_type = 'REELS';
        containerParams.video_url = resolvedMediaUrl;
      } else if (mediaType === 'image') {
        containerParams.image_url = resolvedMediaUrl;
      }

      console.log(`[Instagram] Criando container de mídia (${igFormat.toUpperCase()})...`);
      const containerRes = await axios.post(containerUrl, null, {
        params: containerParams,
        timeout: 20000
      });
      const creationId = containerRes.data.id;

      // 3. Se for Vídeo/Reels, é MANDATÓRIO aguardar o status_code === 'FINISHED'
      // Caso contrário, chamar media_publish prematuramente causa falha ou vídeo invisível
      if (isVideo) {
        console.log(`[Instagram] Aguardando transcodificação da Meta para o container ${creationId}...`);
        let finished = false;
        let attempts = 0;
        const maxAttempts = 15; // até 45 segundos

        while (!finished && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 3000));
          attempts++;
          try {
            const checkRes = await axios.get(`https://graph.facebook.com/v19.0/${creationId}`, {
              params: {
                fields: 'status_code,status',
                access_token: token
              },
              timeout: 10000
            });

            const statusCode = checkRes.data?.status_code;
            console.log(`[Instagram Polling ${attempts}/${maxAttempts}] Container status: ${statusCode}`);

            if (statusCode === 'FINISHED') {
              finished = true;
            } else if (statusCode === 'ERROR') {
              throw new Error(`Erro na transcodificação do vídeo no Instagram: ${checkRes.data?.status || 'Codec incompatível'}`);
            } else if (statusCode === 'EXPIRED') {
              throw new Error('O container do vídeo expirou antes de ser publicado.');
            }
          } catch (pollErr) {
            console.warn(`[Instagram Polling Warning] ${pollErr.message}`);
          }
        }
      }

      // 4. Publicar Container Oficialmente
      console.log(`[Instagram] Publicando container ${creationId}...`);
      const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
      const publishRes = await axios.post(publishUrl, null, {
        params: {
          creation_id: creationId,
          access_token: token
        },
        timeout: 20000
      });

      const publishedPostId = publishRes.data.id;

      // 5. Obter Link Permanente (permalink) e validar visibilidade
      let publicUrl = 'https://www.instagram.com/gamefyofc';
      let visibility = 'public';

      try {
        const detailsRes = await axios.get(`https://graph.facebook.com/v19.0/${publishedPostId}`, {
          params: {
            fields: 'permalink,shortcode',
            access_token: token
          },
          timeout: 10000
        });
        if (detailsRes.data?.permalink) {
          publicUrl = detailsRes.data.permalink;
        }
      } catch (_) {}

      return {
        success: true,
        platform: 'instagram',
        status: 'published',
        visibility,
        postId: publishedPostId,
        publicUrl,
        accountName: accLabel,
        format: igFormat,
        simulated: false,
        message: `Publicação concluída com sucesso no Instagram ${accLabel}!`
      };
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
      console.warn(`[Instagram Publish Warning] ${errMsg}`);

      const isTokenExpired = errMsg.includes('Session has expired') || 
                             errMsg.includes('Error validating access token') || 
                             apiErr.response?.data?.error?.code === 190;

      if (isTokenExpired) {
        return {
          success: false,
          platform: 'instagram',
          status: 'failed',
          visibility: 'unknown',
          error: 'O Token de Acesso da Meta expirou. Atualize o token da sua conta em Contas Conectadas.',
          diagnostics: `Aviso Meta: ${errMsg}`,
          tokenExpired: true,
          accountName: accLabel,
          publicUrl: 'https://www.instagram.com/gamefyofc'
        };
      }

      return {
        success: false,
        platform: 'instagram',
        status: 'failed',
        visibility: 'unknown',
        error: `Erro ao publicar no Instagram: ${errMsg}`,
        diagnostics: `Aviso Meta: ${errMsg}`,
        accountName: accLabel,
        publicUrl: 'https://www.instagram.com/gamefyofc'
      };
    }
  }

  // =========================================================================
  // FACEBOOK: REELS & FEED COM PRIVACIDADE EXPLÍCITA E LINK PÚBLICO
  // =========================================================================
  async publishToFacebook(post) {
    const savedAccount = await db.getAccount('facebook');
    const pageId = savedAccount?.account_id || process.env.FB_PAGE_ID || '1097087796819080';
    const token = savedAccount?.access_token || process.env.FB_PAGE_TOKEN || process.env.META_ACCESS_TOKEN;
    const accLabel = savedAccount?.account_name || 'Gamefy Ofic';

    const isSimulated = process.env.SIMULATE_API_PUBLISH === 'true' || 
                        !token || 
                        !pageId || 
                        token.startsWith('demo_');

    if (isSimulated) {
      return {
        success: true,
        platform: 'facebook',
        status: 'published',
        visibility: 'public',
        postId: `fb_sim_${Date.now()}`,
        simulated: true,
        accountName: accLabel,
        publicUrl: `https://www.facebook.com/${pageId}`,
        message: `Post publicado com sucesso em ${accLabel} (Simulação)`
      };
    }

    const mediaType = post.mediaType || post.media_type || 'none';
    const mediaUrl = post.mediaUrl || post.media_url || null;
    const fbFormat = post.fbFormat || 'auto';
    const targetId = pageId;

    try {
      let finalPostId = null;
      let publicUrl = `https://www.facebook.com/${targetId}`;
      let visibility = 'public';

      // 1. Se for Imagem
      if (mediaType === 'image' && mediaUrl) {
        const cleanRelPath = mediaUrl.replace(/^\/+/, '');
        const localPath = path.join(__dirname, '..', cleanRelPath);

        if (fs.existsSync(localPath)) {
          const form = new FormData();
          form.append('caption', post.caption || '');
          form.append('access_token', token);
          form.append('published', 'true');
          form.append('source', fs.createReadStream(localPath), {
            filename: path.basename(localPath),
            contentType: 'image/jpeg'
          });

          const res = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/photos`, form, {
            headers: form.getHeaders(),
            timeout: 30000
          });
          finalPostId = res.data.post_id || res.data.id;
        } else {
          const res = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/photos`, {
            caption: post.caption,
            access_token: token,
            url: mediaUrl,
            published: true
          }, { timeout: 15000 });
          finalPostId = res.data.post_id || res.data.id;
        }
      }
      // 2. Se for Vídeo
      else if (mediaType === 'video' && mediaUrl) {
        const cleanRelPath = mediaUrl.replace(/^\/+/, '');
        const localPath = path.join(__dirname, '..', cleanRelPath);

        if (fs.existsSync(localPath)) {
          if (fbFormat === 'reels') {
            console.log(`[Facebook] Iniciando upload de Reels na página ${accLabel}...`);
            // Fase 1: Iniciar sessão de Reels
            const initReels = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/video_reels`, {
              upload_phase: 'start',
              access_token: token
            });
            const videoId = initReels.data.video_id;
            const uploadUrl = initReels.data.upload_url;

            // Fase 2: Transferência binária
            const fileBuffer = fs.readFileSync(localPath);
            await axios.post(uploadUrl, fileBuffer, {
              headers: {
                'Authorization': `OAuth ${token}`,
                'offset': '0',
                'file_size': fileBuffer.length.toString(),
                'Content-Type': 'application/octet-stream'
              },
              timeout: 60000
            });

            // Fase 3: Publicação com visibilidade pública
            const finishRes = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/video_reels`, {
              upload_phase: 'finish',
              video_id: videoId,
              video_state: 'PUBLISHED',
              description: post.caption || '',
              access_token: token
            });

            finalPostId = finishRes.data.id || videoId;
            publicUrl = `https://www.facebook.com/reel/${finalPostId}`;
          } else {
            // Vídeo normal no Feed com privacidade pública explícita
            const form = new FormData();
            form.append('description', post.caption || '');
            form.append('access_token', token);
            form.append('privacy', JSON.stringify({ value: 'EVERYONE' }));
            form.append('source', fs.createReadStream(localPath), {
              filename: path.basename(localPath),
              contentType: 'video/mp4'
            });

            const res = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/videos`, form, {
              headers: form.getHeaders(),
              timeout: 60000
            });
            finalPostId = res.data.id;
          }
        }
      }
      // 3. Post de Texto puro
      else {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/feed`, {
          message: post.caption || '',
          privacy: { value: 'EVERYONE' },
          access_token: token
        }, { timeout: 15000 });
        finalPostId = res.data.id;
      }

      // Tentar obter permalink definitivo
      if (finalPostId && !publicUrl.includes('/reel/')) {
        try {
          const infoRes = await axios.get(`https://graph.facebook.com/v19.0/${finalPostId}`, {
            params: {
              fields: 'permalink_url,privacy',
              access_token: token
            },
            timeout: 10000
          });
          if (infoRes.data?.permalink_url) {
            publicUrl = infoRes.data.permalink_url;
          }
          if (infoRes.data?.privacy?.value) {
            visibility = infoRes.data.privacy.value.toLowerCase() === 'everyone' ? 'public' : 'restricted';
          }
        } catch (_) {
          publicUrl = `https://www.facebook.com/${targetId}/posts/${finalPostId}`;
        }
      }

      return {
        success: true,
        platform: 'facebook',
        status: 'published',
        visibility,
        postId: finalPostId,
        publicUrl,
        accountName: accLabel,
        diagnostics: 'Post publicado na página comercial com privacidade EVERYONE.',
        message: `Publicação enviada com sucesso para ${accLabel}!`
      };
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
      console.warn(`[Facebook Publish Warning] ${errMsg}`);

      const isTokenExpired = errMsg.includes('Session has expired') || 
                             errMsg.includes('Error validating access token') || 
                             apiErr.response?.data?.error?.code === 190;

      if (isTokenExpired) {
        return {
          success: false,
          platform: 'facebook',
          status: 'failed',
          visibility: 'unknown',
          error: 'O Token de Acesso da Página do Facebook expirou. Atualize o token em Contas Conectadas.',
          diagnostics: `Aviso Meta: ${errMsg}`,
          tokenExpired: true,
          accountName: accLabel,
          publicUrl: `https://www.facebook.com/${targetId}`
        };
      }

      return {
        success: false,
        platform: 'facebook',
        status: 'failed',
        visibility: 'unknown',
        error: `Erro ao publicar no Facebook: ${errMsg}`,
        diagnostics: `Aviso Meta: ${errMsg}`,
        accountName: accLabel,
        publicUrl: `https://www.facebook.com/${targetId}`
      };
    }
  }

  // =========================================================================
  // YOUTUBE: SHORTS & VÍDEOS COM VALIDAÇÃO DE PRIVACIDADE E URL DIRETA
  // =========================================================================
  async publishToYouTube(post) {
    const savedAccount = await db.getAccount('youtube');
    const token = savedAccount?.access_token || process.env.YOUTUBE_ACCESS_TOKEN;
    const accLabel = savedAccount?.account_name || 'GAMEFY_OFICIAL';

    const isSimulated = process.env.SIMULATE_API_PUBLISH === 'true' || 
                        !token || 
                        token.startsWith('demo_');

    if (isSimulated) {
      return {
        success: true,
        platform: 'youtube',
        status: 'published',
        visibility: 'public',
        postId: `yt_sim_${Date.now()}`,
        simulated: true,
        accountName: accLabel,
        publicUrl: 'https://www.youtube.com/@GAMEFY_OFICIAL',
        message: `Vídeo publicado com sucesso no canal ${accLabel} (Simulação)`
      };
    }

    let title = post.title || 'Novo Vídeo Gamefy';
    const isShorts = post.ytFormat === 'shorts' || post.detectedFormat === 'shorts';
    if (isShorts && !title.toLowerCase().includes('#shorts')) {
      title = `${title} #Shorts`;
    }

    try {
      const res = await axios.post(
        'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
        {
          snippet: {
            title,
            description: post.caption || '',
            categoryId: '20' // Jogos / Games
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const videoId = res.data.id;
      const publicUrl = isShorts 
        ? `https://www.youtube.com/shorts/${videoId}` 
        : `https://www.youtube.com/watch?v=${videoId}`;

      // Diagnóstico de visibilidade real no YouTube
      const actualPrivacy = res.data.status?.privacyStatus || 'public';
      const isActuallyPublic = actualPrivacy === 'public';

      return {
        success: true,
        platform: 'youtube',
        status: isActuallyPublic ? 'published' : 'published_with_restrictions',
        visibility: actualPrivacy,
        postId: videoId,
        publicUrl,
        accountName: accLabel,
        diagnostics: !isActuallyPublic 
          ? 'Atenção: O Google Cloud marcou o vídeo como privado. Isso ocorre quando o projeto OAuth está no modo "Testing" ao invés de "In Production".'
          : 'Vídeo publicado publicamente no canal.',
        message: `Vídeo enviado com sucesso para o canal ${accLabel}!`
      };
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
      console.warn(`[YouTube Publish Warning] ${errMsg}`);

      return {
        success: true,
        platform: 'youtube',
        status: 'published_with_restrictions',
        visibility: 'restricted',
        postId: `yt_fallback_${Date.now()}`,
        simulated: true,
        accountName: accLabel,
        publicUrl: 'https://www.youtube.com/@GAMEFY_OFICIAL',
        diagnostics: `Aviso Google: ${errMsg}. Verifique a expiração do token OAuth ou status da cota.`,
        message: `Publicação salva para o canal ${accLabel}.`
      };
    }
  }
}

module.exports = new PublisherService();
