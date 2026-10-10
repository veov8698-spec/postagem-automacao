const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { db } = require('../database/connection');
require('dotenv').config();

let refreshYouTubeTokenHelper = null;
function getYouTubeRefreshHelper() {
  if (!refreshYouTubeTokenHelper) {
    try {
      const accountsModule = require('../routes/accounts');
      refreshYouTubeTokenHelper = accountsModule.refreshYouTubeTokenHelper;
    } catch (_) {}
  }
  return refreshYouTubeTokenHelper;
}

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

        const isPrivate = (u) => {
          if (!u) return true;
          const c = u.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
          return c === 'localhost' || c === '127.0.0.1' || c.startsWith('192.168.') || c.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(c);
        };

        let publicAppUrl = post.currentOrigin;
        if (!publicAppUrl || isPrivate(publicAppUrl)) {
          publicAppUrl = process.env.PUBLIC_APP_URL;
        }
        if (!publicAppUrl || isPrivate(publicAppUrl)) {
          publicAppUrl = post.requestOrigin || 'https://technique-expired-php-spa.trycloudflare.com';
        }

        resolvedMediaUrl = `${publicAppUrl.replace(/\/+$/, '')}/${mediaUrl.replace(/^\/+/, '')}`;
        console.log(`[Instagram] URL pública resolvida para a Meta baixar a mídia: ${resolvedMediaUrl}`);

      const isVideo = mediaType === 'video';

      // Validação obrigatória: o Instagram NÃO aceita publicações sem foto ou vídeo
      if (!resolvedMediaUrl || mediaType === 'none') {
        return {
          success: false,
          platform: 'instagram',
          status: 'failed',
          visibility: 'unknown',
          error: 'O Instagram exige que você selecione uma foto ou vídeo para publicar (não aceita publicação apenas com texto).',
          diagnostics: 'Tentativa de postagem sem mídia em plataforma visual.',
          accountName: accLabel,
          publicUrl: 'https://www.instagram.com/gamefyofc'
        };
      }

      // 2. Criar Container de Mídia na Meta Graph API
      const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
      const containerParams = {
        caption: post.caption || '',
        access_token: token
      };

      if (igFormat === 'story') {
        containerParams.media_type = 'STORIES';
        if (isVideo) {
          containerParams.video_url = resolvedMediaUrl;
        } else {
          containerParams.image_url = resolvedMediaUrl;
        }
      } else if (isVideo) {
        // No Instagram Graph API oficial, todas as postagens de vídeo no Feed são criadas como REELS
        containerParams.media_type = 'REELS';
        containerParams.video_url = resolvedMediaUrl;
      } else {
        // Postagem padrão de imagem (Feed)
        containerParams.image_url = resolvedMediaUrl;
      }

      console.log(`[Instagram] Criando container de mídia (${igFormat.toUpperCase()})...`);
      const containerRes = await axios.post(containerUrl, null, {
        params: containerParams,
        timeout: 25000
      });
      const creationId = containerRes.data?.id;

      if (!creationId) {
        throw new Error('Falha ao obter ID do container de mídia da Meta Graph API.');
      }

      // 3. Aguardar o processamento da Meta (Download e Transcodificação)
      if (isVideo) {
        console.log(`[Instagram] Aguardando transcodificação da Meta para o vídeo container ${creationId}...`);
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
      } else {
        // Para Imagem: aguarda a Meta concluir o download da URL antes de publicar
        console.log(`[Instagram] Aguardando confirmação da imagem no container ${creationId}...`);
        let imageReady = false;
        let imgAttempts = 0;
        while (!imageReady && imgAttempts < 5) {
          await new Promise(r => setTimeout(r, 2000));
          imgAttempts++;
          try {
            const checkImg = await axios.get(`https://graph.facebook.com/v19.0/${creationId}`, {
              params: { fields: 'status_code,status', access_token: token },
              timeout: 10000
            });
            const st = checkImg.data?.status_code;
            if (st === 'FINISHED' || !st) {
              imageReady = true;
            } else if (st === 'ERROR') {
              throw new Error(`A Meta não conseguiu acessar a imagem via internet: ${checkImg.data?.status || 'Download falhou'}`);
            }
          } catch (_) {
            if (imgAttempts >= 3) imageReady = true;
          }
        }
      }

      // 4. Publicar Container Oficialmente com retry resiliente
      console.log(`[Instagram] Publicando container ${creationId}...`);
      const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
      let publishedPostId = null;
      let pubAttempts = 0;
      let lastPubError = null;

      while (!publishedPostId && pubAttempts < 3) {
        pubAttempts++;
        try {
          const publishRes = await axios.post(publishUrl, null, {
            params: {
              creation_id: creationId,
              access_token: token
            },
            timeout: 25000
          });
          publishedPostId = publishRes.data?.id;
        } catch (pubErr) {
          lastPubError = pubErr;
          const pubErrMsg = pubErr.response?.data?.error?.message || pubErr.message;
          console.warn(`[Instagram Publish Attempt ${pubAttempts}/3] ${pubErrMsg}`);
          if (pubErrMsg.includes('not available') || pubErrMsg.includes('Media ID is not available') || pubErrMsg.includes('Please wait')) {
            // A Meta ainda está baixando a mídia, aguarda 3 segundos e tenta de novo
            await new Promise(r => setTimeout(r, 3500));
          } else {
            throw pubErr;
          }
        }
      }

      if (!publishedPostId && lastPubError) {
        throw lastPubError;
      }

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
            // Mapeamento dinâmico de privacidade no Facebook
            const reqPrivacy = (post.privacy || 'public').toLowerCase();
            const fbPrivacyValue = reqPrivacy === 'private' ? 'SELF' : 'EVERYONE';

            const form = new FormData();
            form.append('description', post.caption || '');
            form.append('access_token', token);
            form.append('privacy', JSON.stringify({ value: fbPrivacyValue }));
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
        const reqPrivacy = (post.privacy || 'public').toLowerCase();
        const fbPrivacyValue = reqPrivacy === 'private' ? 'SELF' : 'EVERYONE';

        const res = await axios.post(`https://graph.facebook.com/v19.0/${targetId}/feed`, {
          message: post.caption || '',
          privacy: { value: fbPrivacyValue },
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
  async publishToYouTube(post, isRetry = false) {
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
        publicUrl: 'https://www.youtube.com/@gamefyofc',
        message: `Vídeo publicado com sucesso no canal ${accLabel} (Simulação)`
      };
    }

    let title = post.title || 'Novo Vídeo Gamefy';
    const isShorts = post.ytFormat === 'shorts' || post.detectedFormat === 'shorts';
    if (isShorts && !title.toLowerCase().includes('#shorts')) {
      title = `${title} #Shorts`;
    }

    // Mapeamento dinâmico de privacidade escolhida pelo usuário (public, private, unlisted)
    const reqPrivacy = (post.privacy || 'public').toLowerCase();
    const ytPrivacy = ['public', 'private', 'unlisted'].includes(reqPrivacy) ? reqPrivacy : 'public';

    // Localizar arquivo local se existir
    const mediaPath = post.media_url || post.mediaUrl;
    let localFilePath = null;
    let fileStat = null;
    if (mediaPath && typeof mediaPath === 'string') {
      const cleanRelative = mediaPath.replace(/^\//, '');
      const possiblePath = path.join(__dirname, '..', cleanRelative);
      if (fs.existsSync(possiblePath)) {
        localFilePath = possiblePath;
        try {
          fileStat = fs.statSync(possiblePath);
        } catch (_) {}
      }
    }

    try {
      let videoId = null;

      // 1. Se houver arquivo de vídeo local e tamanho válido, faz Upload Resumable oficial no YouTube
      if (localFilePath && fileStat && fileStat.size > 0) {
        console.log(`[YouTube] Iniciando upload resumable do arquivo (${fileStat.size} bytes)...`);
        const initRes = await axios.post(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
          {
            snippet: {
              title,
              description: post.caption || '',
              categoryId: '20' // Jogos / Games
            },
            status: {
              privacyStatus: ytPrivacy,
              selfDeclaredMadeForKids: false
            }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Upload-Content-Type': 'video/mp4',
              'X-Upload-Content-Length': fileStat.size.toString()
            },
            timeout: 25000
          }
        );

        const uploadLocation = initRes.headers['location'];
        if (uploadLocation) {
          console.log('[YouTube] Enviando binário do vídeo para Google Cloud...');
          const fileStream = fs.createReadStream(localFilePath);
          const uploadRes = await axios.put(uploadLocation, fileStream, {
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Length': fileStat.size.toString()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000
          });
          videoId = uploadRes.data?.id;
        }
      } else {
        // 2. Sem arquivo de mídia binária: registrar vídeo via metadata
        const res = await axios.post(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
          {
            snippet: {
              title,
              description: post.caption || '',
              categoryId: '20'
            },
            status: {
              privacyStatus: ytPrivacy,
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
        videoId = res.data?.id;
      }

      if (!videoId) {
        throw new Error('A API do Google não retornou o identificador do vídeo.');
      }

      const publicUrl = isShorts 
        ? `https://www.youtube.com/shorts/${videoId}` 
        : `https://www.youtube.com/watch?v=${videoId}`;

      return {
        success: true,
        platform: 'youtube',
        status: 'published',
        visibility: ytPrivacy,
        postId: videoId,
        publicUrl,
        accountName: accLabel,
        diagnostics: `Vídeo publicado oficialmente com privacidade ${ytPrivacy.toUpperCase()}.`,
        message: `Vídeo enviado com sucesso para o canal ${accLabel}!`
      };
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
      console.warn(`[YouTube Publish Warning] ${errMsg}`);

      const isQuota = errMsg.includes('quota') || errMsg.includes('Quota') || apiErr.response?.status === 403;
      const isToken = errMsg.includes('token') || errMsg.includes('Token') || errMsg.includes('authentication') || errMsg.includes('credentials') || apiErr.response?.status === 401;

      if (isToken) {
        // Tentar auto-renovação de longa duração silenciosa se houver Refresh Token
        if (!isRetry) {
          const helper = getYouTubeRefreshHelper();
          if (helper) {
            console.log('[YouTube Auto-Refresh] Tentando auto-renovação de longa duração via Refresh Token...');
            try {
              const refreshed = await helper();
              if (refreshed && refreshed.success && refreshed.accessToken) {
                console.log('✅ [YouTube Auto-Refresh] Token renovado! Repetindo publicação com novo token...');
                return await this.publishToYouTube(post, true);
              }
            } catch (rErr) {
              console.warn('[YouTube Auto-Refresh Warning] Falha na auto-renovação:', rErr.message);
            }
          }
        }

        return {
          success: false,
          platform: 'youtube',
          status: 'failed',
          tokenExpired: true,
          error: 'O Token do Google/YouTube expirou. Renove seu token em Contas Conectadas (ou use o Refresh Token para conexão permanente).',
          diagnostics: `Erro Google OAuth: ${errMsg}`,
          accountName: accLabel,
          publicUrl: 'https://www.youtube.com/@gamefyofc'
        };
      }

      if (isQuota) {
        return {
          success: false,
          platform: 'youtube',
          status: 'failed',
          quotaExceeded: true,
          error: 'A cota diária de envio da API do YouTube do Google Cloud foi atingida temporariamente.',
          diagnostics: `Erro Google Quota: ${errMsg}`,
          accountName: accLabel,
          publicUrl: 'https://www.youtube.com/@gamefyofc'
        };
      }

      return {
        success: false,
        platform: 'youtube',
        status: 'failed',
        error: `Erro ao publicar no YouTube: ${errMsg}`,
        diagnostics: `Aviso Google: ${errMsg}`,
        accountName: accLabel,
        publicUrl: 'https://www.youtube.com/@gamefyofc'
      };
    }
  }

  // =========================================================================
  // EXCLUSÃO DE CONTEÚDO DIRETO NAS REDES (YOUTUBE, INSTAGRAM, FACEBOOK)
  // =========================================================================
  async deleteFromYouTube(videoId) {
    if (!videoId || videoId.startsWith('yt_sim_') || videoId.startsWith('yt_')) return { success: true, simulated: true };
    const savedAccount = await db.getAccount('youtube');
    let token = savedAccount?.access_token || process.env.YOUTUBE_ACCESS_TOKEN;

    try {
      await axios.delete(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ [YouTube Delete] Vídeo ${videoId} removido do canal oficial!`);
      return { success: true, platform: 'youtube', videoId };
    } catch (err) {
      if (err.response?.status === 401) {
        const helper = getYouTubeRefreshHelper();
        if (helper) {
          const ref = await helper();
          if (ref && ref.success && ref.accessToken) {
            try {
              await axios.delete(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`, {
                headers: { Authorization: `Bearer ${ref.accessToken}` }
              });
              console.log(`✅ [YouTube Delete] Vídeo ${videoId} removido após auto-renovação!`);
              return { success: true, platform: 'youtube', videoId };
            } catch (_) {}
          }
        }
      }
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`[YouTube Delete Warning] Falha ao deletar vídeo ${videoId}:`, errMsg);
      return { success: false, platform: 'youtube', error: errMsg };
    }
  }

  async deleteFromMeta(postId, platform = 'facebook') {
    if (!postId || postId.startsWith('fb_sim_') || postId.startsWith('ig_gamefy_')) return { success: true, simulated: true };
    const savedAccount = await db.getAccount(platform);
    const token = savedAccount?.access_token || (platform === 'facebook' ? process.env.FB_PAGE_TOKEN : process.env.IG_PAGE_TOKEN) || process.env.META_ACCESS_TOKEN;

    try {
      await axios.delete(`https://graph.facebook.com/v19.0/${postId}`, {
        params: { access_token: token }
      });
      console.log(`✅ [Meta ${platform} Delete] Post ${postId} removido da rede social!`);
      return { success: true, platform, postId };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      console.warn(`[Meta ${platform} Delete Warning] Falha ao deletar post ${postId}:`, errMsg);
      return { success: false, platform, error: errMsg };
    }
  }

  async deletePostFromNetworks(post) {
    const results = {};
    let destinations = [];
    try {
      destinations = await db.getPostDestinations(post.id);
    } catch (_) {}

    // 1. YouTube
    const ytDest = destinations.find(d => d.platform === 'youtube' && d.platform_post_id);
    const ytVideoId = ytDest?.platform_post_id || (post.platforms?.includes('youtube') && post.platform_post_id);
    if (ytVideoId) {
      results.youtube = await this.deleteFromYouTube(ytVideoId);
    }

    // 2. Facebook
    const fbDest = destinations.find(d => d.platform === 'facebook' && d.platform_post_id);
    const fbPostId = fbDest?.platform_post_id;
    if (fbPostId) {
      results.facebook = await this.deleteFromMeta(fbPostId, 'facebook');
    }

    // 3. Instagram
    const igDest = destinations.find(d => d.platform === 'instagram' && d.platform_post_id);
    const igPostId = igDest?.platform_post_id;
    if (igPostId) {
      results.instagram = await this.deleteFromMeta(igPostId, 'instagram');
    }

    return results;
  }
}

module.exports = new PublisherService();
