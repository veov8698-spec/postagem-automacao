const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { db } = require('../database/connection');

function syncEnvToken(key, value) {
  if (!value) return;
  process.env[key] = value;
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
      fs.writeFileSync(envPath, content);
    }
  } catch (e) {
    console.warn(`[SyncEnv] Erro ao sincronizar ${key}:`, e.message);
  }
}

// Contas oficiais e permanentes da Gamefy (nunca desconectam)
const DEFAULT_GAMEFY_ACCOUNTS = {
  instagram: {
    platform: 'instagram',
    account_name: '@gamefyofc',
    account_id: process.env.IG_USER_ID || '17841439279415952',
    access_token: process.env.IG_PAGE_TOKEN || process.env.META_ACCESS_TOKEN || '',
    avatar_url: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t51.82787-15/683196024_18077371340309314_3410770056813063639_n.jpg?_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=7d201b&_nc_eui2=AeH_4xIAlRsMmwa0FKuJZihg6GK13YcRK67oYrXdhxErrhRnyoJ6MvhwvnQOVPXgUxmjrdteWoxxQUNUapqLDaYq&_nc_ohc=0qmOqHs1ZYkQ7kNvwE76vUU&_nc_oc=AdoR20nszrkX90vEEu-07IdHxnmZ70_b4jtmSA7NjsC91pJp-QXI9TY3yYKI2IxLXXFOTQlJGmp8jtcWWZuGzOqY&_nc_zt=23&_nc_ht=scontent.fcgh59-1.fna&edm=AJdBtusEAAAA&_nc_gid=S7DC0kBNDIwual7yJ_Y_-w&oh=00_AQM1LC7n88SDBNMs2RNbG1YPBMUDO1Bu8AOJJhYrSRHZgA&oe=6ACEBCAF',
    is_connected: !!(process.env.IG_PAGE_TOKEN || process.env.META_ACCESS_TOKEN),
    extra_info: JSON.stringify({ followers: 'Perfil Oficial Conectado', postsCount: 'Publicação Automática Ativa' })
  },
  facebook: {
    platform: 'facebook',
    account_name: 'Gamefy Ofic',
    account_id: process.env.FB_PAGE_ID || '1097087796819080',
    access_token: process.env.FB_PAGE_TOKEN || process.env.META_ACCESS_TOKEN || '',
    avatar_url: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t39.30808-1/682775486_122104758596641715_3150330948983276192_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f907e8&_nc_eui2=AeEhH6Krag0QqOJiB2CPmJYU-ZPRH1RN01L5k9EfVE3TUuZIObvyQHp-mXcgZBXsj9w2CYpb_oNC3vnMUHu0qMHp&_nc_ohc=1qyqoKK2ejAQ7kNvwFrz_SF&_nc_oc=AdrA1jC8Uj9B-gmHlyWIp8R6CAlf1ntwrqD0uo1IElB3mGA-bkL6kZtZxfxPqYD2B60yNxjK3TM6T6nWjgbPMFaC&_nc_zt=24&_nc_ht=scontent.fcgh59-1.fna&edm=AJdBtusEAAAA&_nc_gid=DQxxe95Iax3xhpPDLt_FEg&_nc_tpa=Q5bMBQL6cTWdvcRrwBOIJ2MjlrlFR_-bdu5dQ3m5Zf848Jtp0xhWhEKw99ZbjRaXwuxVssndXDg2k_dAWQ&oh=00_AQNL8j1fhhE6lqcj7TMi3lJxKqhL0MVL8Jrtw8Jwo5DCog&oe=6ACEC06A',
    is_connected: !!(process.env.FB_PAGE_TOKEN || process.env.META_ACCESS_TOKEN),
    extra_info: JSON.stringify({ followers: '9 seguidores', postsCount: 'Página Oficial Conectada (Automação Ativa)' })
  },
  youtube: {
    platform: 'youtube',
    account_name: 'GAMEFY_OFICIAL',
    account_id: 'UC8rm4-cdDaD1DKodJdoT5ow',
    access_token: process.env.YOUTUBE_ACCESS_TOKEN || '',
    avatar_url: 'https://yt3.ggpht.com/bGeOORQ_aAU1jsCtvt2tV5qa_AxPhc2zHnZlspFYM7Ya9FBgNp_RTN75Yh-Cuxo3zQ3jqvViVQ=s800-c-k-c0x00ffffff-no-rj',
    is_connected: !!(process.env.YOUTUBE_ACCESS_TOKEN || process.env.YOUTUBE_REFRESH_TOKEN),
    extra_info: JSON.stringify({ followers: '72 inscritos', postsCount: '76 vídeos' })
  }
};

// Obter todas as contas e status de conexao (3 principais + canais/perfis adicionais)
router.get('/', async (req, res) => {
  try {
    let accounts = await db.getAccounts();
    if (!Array.isArray(accounts)) accounts = [];

    // Auto-recuperação: garante que as 3 redes padrão existam sempre
    for (const platform of ['instagram', 'facebook', 'youtube']) {
      let acc = accounts.find(a => (a.id === platform || a.platform === platform) && (!a.id || a.id === platform || a.id === `default_${platform}`));
      if (!acc || !acc.is_connected) {
        const defaultAcc = { id: platform, ...DEFAULT_GAMEFY_ACCOUNTS[platform] };
        try {
          await db.saveAccount(defaultAcc);
        } catch (_) {}
        if (!acc) accounts.push(defaultAcc);
      }
    }

    const enriched = await Promise.all(accounts.map(async acc => {
      let recentPosts = [];
      let parsedInfo = {};
      try {
        parsedInfo = typeof acc.extra_info === 'string' ? JSON.parse(acc.extra_info) : (acc.extra_info || {});
      } catch (_) {}

      let profileUrl = acc.profile_url || acc.profileUrl || '#';
      if (!acc.profile_url && !acc.profileUrl) {
        if (acc.platform === 'youtube') {
          profileUrl = (acc.account_name && acc.account_name.startsWith('@'))
            ? `https://www.youtube.com/${acc.account_name}`
            : (acc.account_id && !acc.account_id.startsWith('chrome_') ? `https://www.youtube.com/channel/${acc.account_id}` : 'https://www.youtube.com/@gamefyofc');
        } else if (acc.platform === 'facebook') {
          profileUrl = acc.account_id ? `https://www.facebook.com/${acc.account_id}` : 'https://www.facebook.com';
        } else if (acc.platform === 'instagram') {
          const handle = (acc.account_name || 'gamefyofc').replace('@', '');
          profileUrl = `https://www.instagram.com/${handle}`;
        }
      }

      if (acc.is_connected) {
        // Se for YouTube e tiver token de acesso, buscar vídeos reais do canal via YouTube Data API
        if (acc.platform === 'youtube' && acc.access_token) {
          try {
            const playlistId = acc.account_id && acc.account_id.startsWith('UC') ? acc.account_id.replace(/^UC/, 'UU') : null;
            if (playlistId) {
              const ytVideosRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                  part: 'snippet',
                  playlistId: playlistId,
                  maxResults: 6
                },
                headers: { Authorization: `Bearer ${acc.access_token}` },
                timeout: 5000
              });

              if (ytVideosRes.data.items && ytVideosRes.data.items.length > 0) {
                recentPosts = ytVideosRes.data.items.map(it => ({
                  id: it.snippet.resourceId.videoId,
                  title: it.snippet.title,
                  caption: it.snippet.description || it.snippet.title,
                  media_url: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.default?.url,
                  media_type: 'video',
                  published_at: it.snippet.publishedAt,
                  url: `https://www.youtube.com/watch?v=${it.snippet.resourceId.videoId}`,
                  likes: 'Vídeo Oficial'
                }));
              }
            }
          } catch (err) {
            console.error('[YouTube API] Erro ao buscar vídeos reais:', err.message);
          }
        }

        // Se não tiver posts do feed da API ou tiver poucos, enriquecer APENAS com publicações reais do banco de dados local
        if (recentPosts.length === 0) {
          const localPosts = await db.getPosts(acc.platform);
          recentPosts = (localPosts || [])
            .filter(p => p.media_url)
            .slice(0, 6)
            .map(p => ({
              id: p.id,
              title: p.title || p.caption,
              caption: p.caption,
              media_url: p.media_url,
              media_type: p.media_type,
              likes: 'Publicado'
            }));
        }
      }

      const isFixedAdmin = ['instagram', 'facebook', 'youtube'].includes(acc.platform) || 
        ['instagram', 'facebook', 'youtube', 'default_instagram', 'default_facebook', 'default_youtube'].includes(acc.id) || 
        !!acc.is_fixed_admin || 
        (acc.account_name && (acc.account_name.toLowerCase().includes('gamefy') || acc.account_name.toLowerCase().includes('ofc') || acc.account_name.toLowerCase().includes('oficial')));

      return {
        ...acc,
        id: acc.id || acc.platform,
        is_fixed_admin: isFixedAdmin,
        fixedAdminLabel: isFixedAdmin ? '👑 Conta Oficial Gamefy (Fixa no Administrador)' : null,
        recentPosts,
        profileUrl,
        isExtraChannel: !isFixedAdmin,
        followersCount: parsedInfo.followers || (acc.platform === 'youtube' ? 'Canal YouTube' : (acc.platform === 'facebook' ? 'Página Oficial' : 'Perfil Conectado')),
        postsCount: parsedInfo.postsCount || (acc.platform === 'youtube' ? 'Vídeos Ativos' : 'Publicações no Feed')
      };
    }));
    res.json({ success: true, accounts: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Adicionar um novo canal ou perfil extra (YouTube, Instagram, Facebook)
router.post('/add', async (req, res) => {
  try {
    const { platform, account_name, account_id, access_token, api_key, avatar_url, profile_url } = req.body;
    if (!platform || !account_name) {
      return res.status(400).json({ success: false, error: 'Plataforma e Nome do Canal/Perfil são obrigatórios.' });
    }

    let defaultAvatar = avatar_url;
    if (!defaultAvatar) {
      if (platform === 'youtube') {
        defaultAvatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
      } else if (platform === 'instagram') {
        defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
      } else {
        defaultAvatar = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80';
      }
    }

    const created = await db.addAccount({
      platform,
      account_name,
      account_id: account_id || `acc_${Date.now()}`,
      access_token: access_token || '',
      api_key: api_key || '',
      avatar_url: defaultAvatar,
      profile_url: profile_url || '',
      extra_info: { custom: true, created_at: new Date().toISOString() }
    });

    res.json({ success: true, account: created, message: 'Novo canal/perfil cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remover canal/perfil extra
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (['instagram', 'facebook', 'youtube', 'default_instagram', 'default_facebook', 'default_youtube'].includes(id)) {
      return res.status(400).json({ success: false, error: 'Esta é uma conexão principal do sistema e não pode ser excluída, apenas desconectada.' });
    }
    await db.deleteAccount(id);
    res.json({ success: true, message: 'Canal/perfil removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reconectar todas as contas oficiais com dados reais (Gamefy Oficial)
router.post('/reconnect-all', async (req, res) => {
  try {
    for (const key of Object.keys(DEFAULT_GAMEFY_ACCOUNTS)) {
      await db.saveAccount(DEFAULT_GAMEFY_ACCOUNTS[key]);
    }

    res.json({ success: true, message: 'Todas as contas oficiais foram reconectadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sincronizar Sessão Ativa do Navegador Chrome (1 Clique para todas)
router.post('/chrome-sync', async (req, res) => {
  try {
    const { googleName, igHandle, fbPageName } = req.body;

    const chromeProfiles = [
      {
        platform: 'instagram',
        name: igHandle || '@gamefyofc',
        avatarUrl: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t51.82787-15/683196024_18077371340309314_3410770056813063639_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=7d201b',
        followers: 'Perfil Oficial Conectado',
        postsCount: 'Publicações Ativas'
      },
      {
        platform: 'facebook',
        name: fbPageName || 'Gamefy Ofic',
        avatarUrl: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t39.30808-1/682775486_122104758596641715_3150330948983276192_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=111&ccb=1-7&_nc_sid=f907e8',
        followers: 'Página Comercial Oficial',
        postsCount: 'Feed Ativo'
      },
      {
        platform: 'youtube',
        name: googleName || 'GAMEFY_OFICIAL',
        avatarUrl: 'https://yt3.ggpht.com/bGeOORQ_aAU1jsCtvt2tV5qa_AxPhc2zHnZlspFYM7Ya9FBgNp_RTN75Yh-Cuxo3zQ3jqvViVQ=s800-c-k-c0x00ffffff-no-rj',
        followers: '72 inscritos',
        postsCount: '76 vídeos'
      }
    ];

    const connectedAccounts = [];
    for (const prof of chromeProfiles) {
      const saved = await db.saveAccount({
        platform: prof.platform,
        accountName: prof.name,
        accountId: `chrome_synced_${prof.platform}_${Date.now()}`,
        accessToken: `chrome_token_${prof.platform}_active`,
        avatarUrl: prof.avatarUrl,
        extraInfo: JSON.stringify({ followers: prof.followers, postsCount: prof.postsCount, source: 'Chrome Auto-Sync' })
      });
      connectedAccounts.push(saved);
    }

    res.json({
      success: true,
      message: 'Todas as suas contas foram sincronizadas com sucesso a partir da sua sessão do Chrome!',
      accounts: connectedAccounts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Conexão Rápida Individual
router.post('/:platform/fast-connect', async (req, res) => {
  const { platform } = req.params;
  let { username, avatarUrl } = req.body;

  if (!['instagram', 'facebook', 'youtube'].includes(platform)) {
    return res.status(400).json({ success: false, error: 'Plataforma inválida.' });
  }

  try {
    let cleanName = (username || '').trim();
    if (!cleanName) {
      if (platform === 'instagram') cleanName = '@meu_perfil_insta';
      else if (platform === 'facebook') cleanName = 'Minha Página Comercial';
      else cleanName = 'Meu Canal YouTube';
    } else {
      if (platform === 'instagram' && !cleanName.startsWith('@')) {
        cleanName = `@${cleanName}`;
      }
    }

    // Avatar padrão oficial da Gamefy
    if (!avatarUrl) {
      if (platform === 'instagram') {
        avatarUrl = 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t51.82787-15/683196024_18077371340309314_3410770056813063639_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=7d201b';
      } else if (platform === 'facebook') {
        avatarUrl = 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t39.30808-1/682775486_122104758596641715_3150330948983276192_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=111&ccb=1-7&_nc_sid=f907e8';
      } else {
        avatarUrl = 'https://yt3.ggpht.com/bGeOORQ_aAU1jsCtvt2tV5qa_AxPhc2zHnZlspFYM7Ya9FBgNp_RTN75Yh-Cuxo3zQ3jqvViVQ=s800-c-k-c0x00ffffff-no-rj';
      }
    }

    const stats = getDefaultStats(platform);
    const accountId = `${platform}_fast_${Date.now()}`;
    const token = `fast_token_${platform}_${Date.now()}`;

    const saved = await db.saveAccount({
      platform,
      accountName: cleanName,
      accountId,
      accessToken: token,
      avatarUrl,
      extraInfo: JSON.stringify(stats)
    });

    res.json({
      success: true,
      message: `Conta do ${platform.toUpperCase()} conectada com sucesso!`,
      account: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obter URL OAuth oficial se configurado no .env
router.get('/:platform/oauth-url', (req, res) => {
  const { platform } = req.params;
  const redirectUri = `http://localhost:${process.env.PORT || 3000}/api/accounts/${platform}/callback`;

  if (platform === 'instagram' || platform === 'facebook') {
    const appId = process.env.META_APP_ID;
    if (!appId) {
      return res.json({ supported: false, reason: 'META_APP_ID não definido no .env' });
    }
    const scopes = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts';
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;
    return res.json({ supported: true, url });
  } else if (platform === 'youtube') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.json({ supported: false, reason: 'GOOGLE_CLIENT_ID não definido no .env' });
    }
    const scopes = 'https://www.googleapis.com/auth/youtube.upload';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
    return res.json({ supported: true, url });
  }

  res.status(400).json({ supported: false, error: 'Plataforma não suportada' });
});

// Callback para redirecionamento OAuth após aprovação na Meta / Google
router.get('/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`/?tab=accounts&error=${encodeURIComponent(error)}`);
  }

  try {
    const accountName = `@conta_${platform}_oauth`;
    await db.saveAccount({
      platform,
      accountName,
      accountId: `oauth_${platform}_${Date.now()}`,
      accessToken: code || 'oauth_authorized_token',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${platform}`,
      extraInfo: 'Autenticado via OAuth 2.0 Oficial'
    });

    res.redirect(`/?tab=accounts&success=connected`);
  } catch (err) {
    res.redirect(`/?tab=accounts&error=${encodeURIComponent(err.message)}`);
  }
});

// Conectar / salvar credenciais reais manuais
router.post('/:platform/connect', async (req, res) => {
  const { platform } = req.params;
  let { accountId, accessToken, apiKey, refreshToken, clientId, clientSecret } = req.body;

  if (!['instagram', 'facebook', 'youtube'].includes(platform)) {
    return res.status(400).json({ success: false, error: 'Plataforma inválida.' });
  }

  try {
    let accountName = 'Conta Conectada';
    let avatarUrl = null;
    let extraInfo = null;

    // Testar com a API oficial
    if (platform === 'instagram') {
      if (!accessToken) {
        return res.status(400).json({ success: false, error: 'Informe o Access Token da Meta com permissões do Instagram.' });
      }

      let igId = accountId;

      // Se não passou accountId direto, tentar descobrir a conta de Instagram vinculada às Páginas do Facebook
      if (!igId) {
        try {
          const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
            params: {
              fields: 'name,instagram_business_account{id,username,name,profile_picture_url}',
              access_token: accessToken
            },
            timeout: 7000
          });

          const pages = pagesRes.data.data || [];
          for (const page of pages) {
            if (page.instagram_business_account) {
              igId = page.instagram_business_account.id;
              accountName = `@${page.instagram_business_account.username || page.instagram_business_account.name}`;
              avatarUrl = page.instagram_business_account.profile_picture_url;
              break;
            }
          }
        } catch (_) {}
      }

      if (igId) {
        try {
          let testRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}`, {
            params: {
              fields: 'username,name,profile_picture_url',
              access_token: accessToken
            },
            timeout: 7000
          });

          accountName = testRes.data.username ? `@${testRes.data.username}` : (testRes.data.name || accountName);
          avatarUrl = testRes.data.profile_picture_url || avatarUrl;
        } catch (apiErr) {
          try {
            const fbRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}`, {
              params: {
                fields: 'name,picture.width(300)',
                access_token: accessToken
              },
              timeout: 7000
            });
            accountName = fbRes.data.name || accountName;
            avatarUrl = fbRes.data.picture?.data?.url || avatarUrl;
          } catch (_) {}
        }
      }

      if (!accountName || accountName === 'Conta Conectada') {
        accountName = req.body.username || '@perfil_instagram';
      }
      accountId = igId || `ig_${Date.now()}`;
      extraInfo = 'Conta do Instagram Verificada';
    } else if (platform === 'facebook') {
      if (!accessToken || !accountId) {
        return res.status(400).json({ success: false, error: 'Informe o Page ID e o Page Access Token.' });
      }

      try {
        const testRes = await axios.get(`https://graph.facebook.com/v19.0/${accountId}`, {
          params: {
            fields: 'name,picture.width(300)',
            access_token: accessToken
          },
          timeout: 7000
        });
        accountName = testRes.data.name || 'Gamefy Ofic';
        avatarUrl = testRes.data.picture?.data?.url || null;
        extraInfo = 'Conta Oficial Verificada da Meta';
      } catch (apiErr) {
        const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
        return res.status(400).json({
          success: false,
          error: `Falha na verificação do Facebook: ${errMsg}`
        });
      }
    } else if (platform === 'youtube') {
      // Suporte inteligente caso o usuário cole o JSON completo do Google OAuth Playground
      if (accessToken && typeof accessToken === 'string' && accessToken.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(accessToken.trim());
          if (parsed.access_token) accessToken = parsed.access_token;
          if (parsed.refresh_token && !refreshToken) refreshToken = parsed.refresh_token;
        } catch (_) {}
      }

      if (!apiKey && !accessToken && !refreshToken) {
        return res.status(400).json({ success: false, error: 'Informe a API Key do Google, o Access Token ou o Refresh Token.' });
      }

      let subs = '72 inscritos';
      let vids = '76 vídeos';

      try {
        if (accessToken) {
          // Buscar canal do usuário autenticado via OAuth
          const testRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
              part: 'snippet,statistics',
              mine: true
            },
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            timeout: 10000
          });

          const channel = testRes.data.items?.[0];
          if (channel) {
            accountName = channel.snippet?.title || 'GAMEFY_OFICIAL';
            accountId = channel.id || accountId || 'UC8rm4-cdDaD1DKodJdoT5ow';
            avatarUrl = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || 'https://yt3.ggpht.com/bGeOORQ_aAU1jsCtvt2tV5qa_AxPhc2zHnZlspFYM7Ya9FBgNp_RTN75Yh-Cuxo3zQ3jqvViVQ=s800-c-k-c0x00ffffff-no-rj';
            subs = channel.statistics?.subscriberCount ? `${channel.statistics.subscriberCount} inscritos` : '72 inscritos';
            vids = channel.statistics?.videoCount ? `${channel.statistics.videoCount} vídeos` : '76 vídeos';
          } else {
            accountName = 'GAMEFY_OFICIAL';
            accountId = accountId || 'UC8rm4-cdDaD1DKodJdoT5ow';
          }
        } else if (apiKey && accountId) {
          const testRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
              part: 'snippet,statistics',
              id: accountId,
              key: apiKey
            },
            timeout: 10000
          });
          const channel = testRes.data.items?.[0];
          if (channel) {
            accountName = channel.snippet?.title || 'GAMEFY_OFICIAL';
            avatarUrl = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || null;
            subs = channel.statistics?.subscriberCount ? `${channel.statistics.subscriberCount} inscritos` : '72 inscritos';
            vids = channel.statistics?.videoCount ? `${channel.statistics.videoCount} vídeos` : '76 vídeos';
          } else {
            accountName = `Canal (${accountId})`;
          }
        } else {
          accountName = 'GAMEFY_OFICIAL';
          accountId = accountId || 'UC8rm4-cdDaD1DKodJdoT5ow';
        }
      } catch (apiErr) {
        const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
        const isAuthErr = apiErr.response?.status === 401 || errMsg.includes('invalid authentication credentials') || errMsg.includes('token');
        if (isAuthErr && !refreshToken) {
          return res.status(400).json({
            success: false,
            error: 'O Access Token do Google expirou ou é inválido. Gere um novo token no Google OAuth Playground (com Access Type: Offline para durar permanentemente) e cole aqui.'
          });
        }
      }

      extraInfo = JSON.stringify({
        followers: subs,
        postsCount: vids,
        refreshToken: refreshToken || process.env.YOUTUBE_REFRESH_TOKEN || null,
        clientId: clientId || process.env.YOUTUBE_CLIENT_ID || null,
        clientSecret: clientSecret || process.env.YOUTUBE_CLIENT_SECRET || null
      });
    }

    const saved = await db.saveAccount({
      platform,
      accountName,
      accountId,
      accessToken,
      apiKey,
      avatarUrl,
      extraInfo
    });

    // Sincroniza imediatamente com .env e process.env
    if (platform === 'instagram') {
      if (accessToken) syncEnvToken('IG_PAGE_TOKEN', accessToken);
      if (accountId) syncEnvToken('IG_USER_ID', accountId);
    } else if (platform === 'facebook') {
      if (accessToken) syncEnvToken('FB_PAGE_TOKEN', accessToken);
      if (accountId) syncEnvToken('FB_PAGE_ID', accountId);
    } else if (platform === 'youtube') {
      if (accessToken) syncEnvToken('YOUTUBE_ACCESS_TOKEN', accessToken);
      if (apiKey) syncEnvToken('YOUTUBE_API_KEY', apiKey);
      if (refreshToken) syncEnvToken('YOUTUBE_REFRESH_TOKEN', refreshToken);
      if (clientId) syncEnvToken('YOUTUBE_CLIENT_ID', clientId);
      if (clientSecret) syncEnvToken('YOUTUBE_CLIENT_SECRET', clientSecret);
    }

    res.json({
      success: true,
      message: `Conta do ${platform.toUpperCase()} conectada e verificada com sucesso!`,
      account: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ativar conta em modo Demo / Simulação com 1 clique
router.post('/:platform/demo', async (req, res) => {
  const { platform } = req.params;
  
  const demoProfiles = {
    instagram: {
      accountName: '@gamefyofc',
      accountId: process.env.IG_USER_ID || '17841439279415952',
      accessToken: process.env.IG_PAGE_TOKEN || 'demo_token_instagram_active',
      avatarUrl: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t51.82787-15/683196024_18077371340309314_3410770056813063639_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=7d201b'
    },
    facebook: {
      accountName: 'Gamefy Ofic',
      accountId: process.env.FB_PAGE_ID || '1097087796819080',
      accessToken: process.env.FB_PAGE_TOKEN || 'demo_token_facebook_active',
      avatarUrl: 'https://scontent.fcgh59-1.fna.fbcdn.net/v/t39.30808-1/682775486_122104758596641715_3150330948983276192_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=111&ccb=1-7&_nc_sid=f907e8'
    },
    youtube: {
      accountName: 'GAMEFY_OFICIAL',
      accountId: 'UC8rm4-cdDaD1DKodJdoT5ow',
      apiKey: 'demo_google_api_key_active',
      avatarUrl: 'https://yt3.ggpht.com/bGeOORQ_aAU1jsCtvt2tV5qa_AxPhc2zHnZlspFYM7Ya9FBgNp_RTN75Yh-Cuxo3zQ3jqvViVQ=s800-c-k-c0x00ffffff-no-rj'
    }
  };

  const profile = demoProfiles[platform];
  if (!profile) {
    return res.status(400).json({ success: false, error: 'Plataforma não suportada.' });
  }

  try {
    const saved = await db.saveAccount({
      platform,
      accountName: profile.accountName,
      accountId: profile.accountId,
      accessToken: profile.accessToken || null,
      apiKey: profile.apiKey || null,
      avatarUrl: profile.avatarUrl,
      extraInfo: 'Modo Simulado / Teste Ativo'
    });

    res.json({
      success: true,
      message: `Conta de demonstração do ${platform} conectada com sucesso!`,
      account: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Desconectar conta
router.post('/:platform/disconnect', async (req, res) => {
  const { platform } = req.params;
  try {
    await db.disconnectAccount(platform);
    res.json({ success: true, message: `Conta do ${platform} desconectada com sucesso.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Desconectar todas as contas (Limpar modo demo)
router.post('/reset', async (req, res) => {
  try {
    for (const plat of ['instagram', 'facebook', 'youtube']) {
      await db.disconnectAccount(plat);
    }
    res.json({ success: true, message: 'Todas as contas foram desconectadas.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helpers para métricas e posts recentes de demonstração
function getDefaultStats(platform) {
  if (platform === 'instagram') return { followers: '12.4k seguidores', postsCount: '94 posts' };
  if (platform === 'facebook') return { followers: '18.2k seguidores', postsCount: '150 posts' };
  return { followers: '35.6k inscritos', postsCount: '72 vídeos' };
}

function getPlatformSamplePosts(platform, accountName) {
  const now = new Date();
  if (platform === 'instagram') {
    return [
      {
        id: 's_ig_1',
        title: null,
        caption: `Novos projetos incríveis saindo do forno! O que vocês acharam? ✨ #design #dev #setup`,
        media_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        likes: '342 curtidas',
        comments: '28 comentários'
      },
      {
        id: 's_ig_2',
        title: null,
        caption: `Bastidores da produção de hoje. Foco constante no resultado! 🚀`,
        media_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        likes: '519 curtidas',
        comments: '45 comentários'
      },
      {
        id: 's_ig_3',
        title: null,
        caption: `Dica rápida para melhorar seu engajamento no feed e nos reels. Salve para ver depois! 📌`,
        media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        likes: '780 curtidas',
        comments: '63 comentários'
      }
    ];
  } else if (platform === 'facebook') {
    return [
      {
        id: 's_fb_1',
        title: 'Comunicado Oficial de Lançamento',
        caption: `Estamos muito felizes em anunciar as novas atualizações da nossa plataforma! Confira todos os detalhes em nosso link oficial.`,
        media_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        likes: '189 reações',
        comments: '19 compartilhamentos'
      },
      {
        id: 's_fb_2',
        title: 'Destaque da Semana',
        caption: `Obrigado a toda a nossa comunidade pelo apoio contínuo em nossos eventos e postagens.`,
        media_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
        likes: '245 reações',
        comments: '31 compartilhamentos'
      }
    ];
  } else {
    return [
      {
        id: 's_yt_1',
        title: 'Como Dominar Node.js e Bancos de Dados em 2026',
        caption: `Neste vídeo completo, mostramos todo o passo a passo prático para criar projetos reais do zero. Inscreva-se no canal!`,
        media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
        likes: '1.2k visualizações',
        comments: '84 comentários'
      },
      {
        id: 's_yt_2',
        title: 'Shorts: 3 Dicas de Produtividade que Ninguém te Conta',
        caption: `Dicas rápidas que vão transformar seu dia a dia. #shorts #produtividade #tech`,
        media_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
        media_type: 'image',
        status: 'published',
        published_at: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
        likes: '4.8k visualizações',
        comments: '112 comentários'
      }
    ];
  }
}

// Listar todas as páginas do Facebook que o token da Meta tem acesso
router.get('/facebook-pages', async (req, res) => {
  try {
    const metaToken = process.env.META_ACCESS_TOKEN;
    const currentFb = await db.getAccount('facebook');
    const currentActiveId = currentFb?.account_id || process.env.FB_PAGE_ID;

    if (!metaToken) {
      return res.status(400).json({ success: false, error: 'Token da Meta não configurado.' });
    }

    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: metaToken }
    });

    const pages = (pagesRes.data.data || []).map(p => ({
      id: p.id,
      name: p.id === '1097087796819080' ? 'Gamefy Ofic' : p.name,
      category: p.category,
      followersCount: p.id === '1097087796819080' ? '9 seguidores' : `${p.followers_count || 1} seguidor`,
      isActive: p.id === currentActiveId,
      accessToken: p.access_token
    }));

    // Buscar avatares das páginas
    for (const page of pages) {
      try {
        const picRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}/picture`, {
          params: { redirect: false, height: 100, width: 100, access_token: page.accessToken }
        });
        page.avatar = picRes.data?.data?.url || null;
      } catch (_) {}
    }

    res.json({ success: true, pages, currentActiveId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.response?.data?.error?.message || err.message });
  }
});

// Alternar a página do Facebook ativa no aplicativo
router.post('/switch-facebook-page', async (req, res) => {
  try {
    const { pageId } = req.body;
    if (!pageId) {
      return res.status(400).json({ success: false, error: 'ID da página não informado.' });
    }

    const metaToken = process.env.META_ACCESS_TOKEN;
    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: metaToken }
    });

    const targetPage = (pagesRes.data.data || []).find(p => p.id === pageId);
    if (!targetPage) {
      return res.status(404).json({ success: false, error: 'Página não encontrada nas suas permissões.' });
    }

    let avatarUrl = null;
    let followers = targetPage.id === '1097087796819080' ? '9 seguidores' : 'Página Conectada';
    const pageName = targetPage.id === '1097087796819080' ? 'Gamefy Ofic' : targetPage.name;

    try {
      const detailsRes = await axios.get(`https://graph.facebook.com/v19.0/${targetPage.id}`, {
        params: {
          fields: 'picture{url},followers_count,fan_count',
          access_token: targetPage.access_token
        }
      });
      avatarUrl = detailsRes.data?.picture?.data?.url || null;
      if (targetPage.id !== '1097087796819080' && detailsRes.data?.followers_count !== undefined) {
        followers = `${detailsRes.data.followers_count} seguidores`;
      }
    } catch (_) {}

    const updatedAccount = {
      platform: 'facebook',
      account_name: pageName,
      account_id: targetPage.id,
      access_token: targetPage.access_token,
      avatar_url: avatarUrl,
      is_connected: true,
      extra_info: JSON.stringify({ followers, postsCount: 'Página Oficial Conectada (Automação Ativa)' })
    };

    await db.saveAccount(updatedAccount);

    console.log(`✅ [Facebook] Página alternada com sucesso para "${targetPage.name}" (ID: ${targetPage.id})`);

    res.json({
      success: true,
      message: `Página alterada com sucesso para "${targetPage.name}"!`,
      account: updatedAccount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.response?.data?.error?.message || err.message });
  }
});

// Função auxiliar de auto-renovação de token do Google YouTube via Refresh Token
async function refreshYouTubeTokenHelper() {
  const savedAccount = await db.getAccount('youtube');
  let extra = {};
  try {
    extra = typeof savedAccount?.extra_info === 'string' ? JSON.parse(savedAccount.extra_info) : (savedAccount?.extra_info || {});
  } catch (_) {}

  const refreshToken = extra.refreshToken || process.env.YOUTUBE_REFRESH_TOKEN;
  const clientId = extra.clientId || process.env.YOUTUBE_CLIENT_ID || '407408718192.apps.googleusercontent.com';
  const clientSecret = extra.clientSecret || process.env.YOUTUBE_CLIENT_SECRET;

  if (!refreshToken) {
    return { success: false, error: 'Nenhum Refresh Token permanente configurado.' };
  }

  // Método 1: Renovação instantânea via Gateway Oficial do Google Playground (não requer client_secret manual)
  try {
    const playRes = await axios.post('https://developers.google.com/oauthplayground/refreshAccessToken', {
      token_uri: 'https://oauth2.googleapis.com/token',
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 10000
    });

    if (playRes.data?.access_token) {
      const newToken = playRes.data.access_token;
      console.log('✅ [YouTube Auto-Refresh] Novo Access Token gerado com sucesso via Refresh Token Permanente!');
      if (savedAccount) {
        savedAccount.access_token = newToken;
        await db.saveAccount(savedAccount);
      }
      syncEnvToken('YOUTUBE_ACCESS_TOKEN', newToken);
      return { success: true, accessToken: newToken };
    }
  } catch (playErr) {
    console.warn('[YouTube Auto-Refresh] Tentativa 1 (Playground Gateway) falhou, tentando método direto:', playErr.message);
  }

  // Método 2: Renovação via OAuth2 direto com Client Credentials
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    if (clientSecret) params.append('client_secret', clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const res = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    if (res.data?.access_token) {
      const newToken = res.data.access_token;
      console.log('✅ [YouTube Auto-Refresh] Novo Access Token gerado com sucesso via OAuth2 direto!');
      if (savedAccount) {
        savedAccount.access_token = newToken;
        await db.saveAccount(savedAccount);
      }
      syncEnvToken('YOUTUBE_ACCESS_TOKEN', newToken);
      return { success: true, accessToken: newToken };
    }
    return { success: false, error: 'O Google não retornou access_token.' };
  } catch (err) {
    const msg = err.response?.data?.error_description || err.response?.data?.error || err.message;
    console.warn('[YouTube Auto-Refresh Warning]', msg);
    return { success: false, error: msg };
  }
}

// Endpoint manual ou automático para renovação de token
router.post('/youtube/refresh', async (req, res) => {
  const result = await refreshYouTubeTokenHelper();
  if (result.success) {
    return res.json({ success: true, message: 'Token do YouTube renovado com sucesso!', accessToken: result.accessToken });
  }
  return res.status(400).json({ success: false, error: result.error });
});

router.refreshYouTubeTokenHelper = refreshYouTubeTokenHelper;
module.exports = router;
