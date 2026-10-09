const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool = null;
let isConnected = false;
let lastError = null;

// Fallback de memória persistente em JSON caso o MySQL não esteja rodando no momento
const FALLBACK_FILE = path.join(__dirname, 'fallback_storage.json');

function readFallback() {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) {
      const initial = {
        users: [],
        groups: [],
        group_accounts: [],
        posts: [],
        platforms: [],
        post_destinations: [],
        accounts: [],
        idCounter: 1
      };
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf-8'));
    if (!data.users) data.users = [];
    if (!data.groups) data.groups = [];
    if (!data.group_accounts) data.group_accounts = [];
    if (!data.post_destinations) data.post_destinations = [];
    if (!data.accounts) data.accounts = [];
    if (!data.posts) data.posts = [];
    if (!data.platforms) data.platforms = [];
    if (!data.idCounter) data.idCounter = 1;
    return data;
  } catch (err) {
    return {
      users: [],
      groups: [],
      group_accounts: [],
      posts: [],
      platforms: [],
      post_destinations: [],
      accounts: [],
      idCounter: 1
    };
  }
}

function writeFallback(data) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar fallback storage:', err);
  }
}

async function initDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  const dbName = process.env.DB_NAME || 'social_publisher_db';

  try {
    // 1. Tenta conectar ao MySQL para garantir que o banco existe
    const rootConn = await mysql.createConnection(config);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Cria o Pool com o banco selecionado
    pool = mysql.createPool({
      ...config,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // 3. Cria as tabelas se não existirem
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('root', 'admin', 'user', 'member') DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS \`groups\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        icon_color VARCHAR(50) DEFAULT '#6366f1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS group_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        platform ENUM('instagram', 'facebook', 'youtube') NOT NULL,
        account_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NULL,
        caption TEXT NOT NULL,
        media_url VARCHAR(500) NULL,
        thumbnail_url VARCHAR(500) NULL,
        media_type ENUM('image', 'video', 'none') DEFAULT 'none',
        status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
        scheduled_at DATETIME NULL,
        published_at DATETIME NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS post_platforms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        platform ENUM('instagram', 'facebook', 'youtube') NOT NULL,
        platform_post_id VARCHAR(255) NULL,
        status ENUM('pending', 'scheduled', 'published', 'failed') DEFAULT 'pending',
        response_data TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS post_destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        platform ENUM('instagram', 'facebook', 'youtube') NOT NULL,
        account_id VARCHAR(255) NULL,
        account_name VARCHAR(255) NULL,
        status ENUM('pending', 'uploading', 'processing', 'awaiting_confirmation', 'published', 'published_with_restrictions', 'failed', 'unknown') DEFAULT 'pending',
        visibility ENUM('public', 'private', 'unlisted', 'restricted', 'unknown') DEFAULT 'unknown',
        platform_post_id VARCHAR(255) NULL,
        public_url VARCHAR(500) NULL,
        error_log TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS social_accounts (
        platform ENUM('instagram', 'facebook', 'youtube') PRIMARY KEY,
        user_id INT NULL,
        account_name VARCHAR(255) NULL,
        account_id VARCHAR(255) NULL,
        access_token TEXT NULL,
        api_key VARCHAR(255) NULL,
        avatar_url VARCHAR(500) NULL,
        is_connected BOOLEAN DEFAULT FALSE,
        extra_info TEXT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const conn = await pool.getConnection();
    const statements = createTablesQuery.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    conn.release();

    isConnected = true;
    lastError = null;
    console.log(`✅ [MySQL] Conectado com sucesso ao banco '${dbName}' em ${config.host}:${config.port}`);
    await db.ensureDefaultRoot();
  } catch (error) {
    isConnected = false;
    lastError = error.message;
    console.warn(`⚠️ [MySQL] Não foi possível conectar ao MySQL (${error.code || error.message}).`);
    console.warn(`💡 O aplicativo continuará funcionando com armazenamento local resiliente até que o MySQL seja iniciado.`);
    // Assegura conta Root no storage local também
    try { await db.ensureDefaultRoot(); } catch (_) {}
  }
}

// Tentar reconectar periodicamente se o MySQL cair ou for iniciado depois
setInterval(async () => {
  if (!isConnected) {
    try {
      await initDB();
    } catch (_) {}
  }
}, 15000);

// Utilitários de acesso a dados abstraídos para suportar MySQL e fallback transparente
const db = {
  getStatus: () => ({
    connected: isConnected,
    dbName: process.env.DB_NAME || 'social_publisher_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    error: lastError
  }),

  async getPosts(filterPlatform = null, filterStatus = null) {
    if (isConnected) {
      let query = `
        SELECT 
          p.*,
          GROUP_CONCAT(pp.platform) as platforms,
          GROUP_CONCAT(CONCAT(pp.platform, ':', pp.status)) as platform_statuses
        FROM posts p
        LEFT JOIN post_platforms pp ON p.id = pp.post_id
      `;
      const conditions = [];
      const params = [];

      if (filterStatus) {
        conditions.push(`p.status = ?`);
        params.push(filterStatus);
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

      const [rows] = await pool.query(query, params);
      
      let results = rows.map(r => ({
        ...r,
        platforms: r.platforms ? r.platforms.split(',') : [],
        platformStatuses: r.platform_statuses ? r.platform_statuses.split(',').reduce((acc, curr) => {
          const [plat, st] = curr.split(':');
          acc[plat] = st;
          return acc;
        }, {}) : {}
      }));

      if (filterPlatform && filterPlatform !== 'all') {
        results = results.filter(p => p.platforms.includes(filterPlatform));
      }

      return results;
    } else {
      // Fallback
      const data = readFallback();
      let results = data.posts.map(post => {
        const platRecords = data.platforms.filter(pl => pl.post_id === post.id);
        const platforms = platRecords.map(pl => pl.platform);
        const platformStatuses = {};
        platRecords.forEach(pl => { platformStatuses[pl.platform] = pl.status; });
        return {
          ...post,
          platforms,
          platformStatuses
        };
      });

      if (filterStatus && filterStatus !== 'all') {
        results = results.filter(p => p.status === filterStatus);
      }
      if (filterPlatform && filterPlatform !== 'all') {
        results = results.filter(p => p.platforms.includes(filterPlatform));
      }

      return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getPostById(id) {
    if (isConnected) {
      const [posts] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id]);
      if (posts.length === 0) return null;
      const [platforms] = await pool.query(`SELECT * FROM post_platforms WHERE post_id = ?`, [id]);
      return {
        ...posts[0],
        platformRecords: platforms,
        platforms: platforms.map(p => p.platform)
      };
    } else {
      const data = readFallback();
      const post = data.posts.find(p => p.id === parseInt(id, 10));
      if (!post) return null;
      const platforms = data.platforms.filter(pl => pl.post_id === post.id);
      return {
        ...post,
        platformRecords: platforms,
        platforms: platforms.map(p => p.platform)
      };
    }
  },

  async createPost({ title, caption, mediaUrl, mediaType, thumbnailUrl, status, scheduledAt, platforms }) {
    if (isConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [postResult] = await conn.query(
          `INSERT INTO posts (title, caption, media_url, media_type, thumbnail_url, status, scheduled_at, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title || null,
            caption,
            mediaUrl || null,
            mediaType || 'none',
            thumbnailUrl || null,
            status,
            scheduledAt ? new Date(scheduledAt) : null,
            status === 'published' ? new Date() : null
          ]
        );

        const postId = postResult.insertId;

        for (const platform of platforms) {
          await conn.query(
            `INSERT INTO post_platforms (post_id, platform, status)
             VALUES (?, ?, ?)`,
            [postId, platform, status === 'published' ? 'published' : 'scheduled']
          );
        }

        await conn.commit();
        conn.release();
        return await this.getPostById(postId);
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    } else {
      const data = readFallback();
      const newId = data.idCounter++;
      const now = new Date().toISOString();
      const newPost = {
        id: newId,
        title: title || null,
        caption,
        media_url: mediaUrl || null,
        media_type: mediaType || 'none',
        thumbnail_url: thumbnailUrl || null,
        status,
        scheduled_at: scheduledAt || null,
        published_at: status === 'published' ? now : null,
        error_message: null,
        created_at: now,
        updated_at: now
      };

      data.posts.push(newPost);
      for (const platform of platforms) {
        data.platforms.push({
          id: data.platforms.length + 1,
          post_id: newId,
          platform,
          platform_post_id: `mock_${platform}_${Date.now()}`,
          status: status === 'published' ? 'published' : 'scheduled',
          created_at: now
        });
      }

      writeFallback(data);
      return await this.getPostById(newId);
    }
  },

  async updatePostStatus(postId, status, publishedAt = null, errorMessage = null) {
    if (isConnected) {
      await pool.query(
        `UPDATE posts SET status = ?, published_at = ?, error_message = ? WHERE id = ?`,
        [status, publishedAt ? new Date(publishedAt) : null, errorMessage, postId]
      );
      if (status === 'published') {
        await pool.query(`UPDATE post_platforms SET status = 'published' WHERE post_id = ?`, [postId]);
      }
    } else {
      const data = readFallback();
      const post = data.posts.find(p => p.id === parseInt(postId, 10));
      if (post) {
        post.status = status;
        post.published_at = publishedAt || post.published_at;
        post.error_message = errorMessage || null;
        post.updated_at = new Date().toISOString();
        if (status === 'published') {
          data.platforms.filter(pl => pl.post_id === post.id).forEach(pl => {
            pl.status = 'published';
          });
        }
        writeFallback(data);
      }
    }
  },

  async deletePost(postId) {
    if (isConnected) {
      await pool.query(`DELETE FROM posts WHERE id = ?`, [postId]);
    } else {
      const data = readFallback();
      data.posts = data.posts.filter(p => p.id !== parseInt(postId, 10));
      data.platforms = data.platforms.filter(pl => pl.post_id !== parseInt(postId, 10));
      writeFallback(data);
    }
    return true;
  },

  async getDueScheduledPosts() {
    if (isConnected) {
      const [rows] = await pool.query(
        `SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_at <= NOW()`
      );
      return rows;
    } else {
      const data = readFallback();
      const now = new Date();
      return data.posts.filter(p => p.status === 'scheduled' && p.scheduled_at && new Date(p.scheduled_at) <= now);
    }
  },

  async getAccounts() {
    const platforms = ['instagram', 'facebook', 'youtube'];
    if (isConnected) {
      const [rows] = await pool.query(`SELECT * FROM social_accounts`);
      const map = {};
      rows.forEach(r => { map[r.platform] = r; });
      return platforms.map(p => map[p] || {
        platform: p,
        account_name: null,
        account_id: null,
        is_connected: false,
        avatar_url: null,
        updated_at: null
      });
    } else {
      const data = readFallback();
      if (!data.accounts) data.accounts = [];
      const map = {};
      data.accounts.forEach(r => { map[r.platform] = r; });
      return platforms.map(p => map[p] || {
        platform: p,
        account_name: null,
        account_id: null,
        is_connected: false,
        avatar_url: null,
        updated_at: null
      });
    }
  },

  async getAccount(platform) {
    if (isConnected) {
      const [rows] = await pool.query(`SELECT * FROM social_accounts WHERE platform = ?`, [platform]);
      return rows[0] || null;
    } else {
      const data = readFallback();
      if (!data.accounts) data.accounts = [];
      return data.accounts.find(a => a.platform === platform) || null;
    }
  },

  async saveAccount(dataObj) {
    const platform = dataObj.platform;
    const accountName = dataObj.accountName || dataObj.account_name || null;
    const accountId = dataObj.accountId || dataObj.account_id || null;
    const accessToken = dataObj.accessToken || dataObj.access_token || null;
    const apiKey = dataObj.apiKey || dataObj.api_key || null;
    const avatarUrl = dataObj.avatarUrl || dataObj.avatar_url || null;
    const extraInfo = dataObj.extraInfo || dataObj.extra_info || null;

    if (isConnected) {
      await pool.query(
        `INSERT INTO social_accounts (platform, account_name, account_id, access_token, api_key, avatar_url, is_connected, extra_info)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
         ON DUPLICATE KEY UPDATE 
           account_name = VALUES(account_name),
           account_id = VALUES(account_id),
           access_token = VALUES(access_token),
           api_key = VALUES(api_key),
           avatar_url = VALUES(avatar_url),
           is_connected = TRUE,
           extra_info = VALUES(extra_info),
           updated_at = CURRENT_TIMESTAMP`,
        [platform, accountName, accountId, accessToken, apiKey, avatarUrl, extraInfo]
      );
      return await this.getAccount(platform);
    } else {
      const data = readFallback();
      if (!data.accounts) data.accounts = [];
      let acc = data.accounts.find(a => a.platform === platform);
      const now = new Date().toISOString();
      if (!acc) {
        acc = { platform };
        data.accounts.push(acc);
      }
      acc.account_name = accountName;
      acc.account_id = accountId;
      acc.access_token = accessToken;
      acc.api_key = apiKey;
      acc.avatar_url = avatarUrl;
      acc.is_connected = true;
      acc.extra_info = extraInfo;
      acc.updated_at = now;
      writeFallback(data);
      return acc;
    }
  },

  async disconnectAccount(platform) {
    if (isConnected) {
      await pool.query(
        `UPDATE social_accounts 
         SET is_connected = FALSE, access_token = NULL, api_key = NULL 
         WHERE platform = ?`,
        [platform]
      );
    } else {
      const data = readFallback();
      if (!data.accounts) data.accounts = [];
      const acc = data.accounts.find(a => a.platform === platform);
      if (acc) {
        acc.is_connected = false;
        acc.access_token = null;
        acc.api_key = null;
        writeFallback(data);
      }
    }
    return true;
  },

  // ==========================================
  // GERENCIAMENTO DE USUÁRIOS & PERMISSÕES
  // ==========================================
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (isConnected) {
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      return rows[0] || null;
    } else {
      const data = readFallback();
      return (data.users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail) || null;
    }
  },

  async findUserById(id) {
    const numId = parseInt(id, 10);
    if (isConnected) {
      const [rows] = await pool.query('SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?', [numId]);
      return rows[0] || null;
    } else {
      const data = readFallback();
      const user = (data.users || []).find(u => u.id === numId);
      if (!user) return null;
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  async createUser({ name, email, passwordHash, role = 'user', status = 'active' }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (isConnected) {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [cleanName, cleanEmail, passwordHash, role, status]
      );
      return await this.findUserById(result.insertId);
    } else {
      const data = readFallback();
      if (!data.users) data.users = [];
      const newId = (data.users.length > 0 ? Math.max(...data.users.map(u => u.id || 0)) : 0) + 1;
      const now = new Date().toISOString();
      const newUser = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        password_hash: passwordHash,
        role,
        status,
        created_at: now,
        updated_at: now
      };
      data.users.push(newUser);
      writeFallback(data);
      const { password_hash, ...safeUser } = newUser;
      return safeUser;
    }
  },

  async getAllUsers() {
    if (isConnected) {
      const [rows] = await pool.query('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC');
      return rows;
    } else {
      const data = readFallback();
      return (data.users || []).map(u => {
        const { password_hash, ...safeUser } = u;
        return safeUser;
      });
    }
  },

  async updateUser(id, updateData) {
    const numId = parseInt(id, 10);
    if (isConnected) {
      const fields = [];
      const params = [];
      if (updateData.name) { fields.push('name = ?'); params.push(updateData.name.trim()); }
      if (updateData.role) { fields.push('role = ?'); params.push(updateData.role); }
      if (updateData.status) { fields.push('status = ?'); params.push(updateData.status); }
      if (updateData.passwordHash) { fields.push('password_hash = ?'); params.push(updateData.passwordHash); }
      if (fields.length === 0) return await this.findUserById(numId);

      params.push(numId);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      return await this.findUserById(numId);
    } else {
      const data = readFallback();
      const user = (data.users || []).find(u => u.id === numId);
      if (!user) return null;
      if (updateData.name) user.name = updateData.name.trim();
      if (updateData.role) user.role = updateData.role;
      if (updateData.status) user.status = updateData.status;
      if (updateData.passwordHash) user.password_hash = updateData.passwordHash;
      user.updated_at = new Date().toISOString();
      writeFallback(data);
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  async deleteUser(id) {
    const numId = parseInt(id, 10);
    if (isConnected) {
      await pool.query('DELETE FROM users WHERE id = ?', [numId]);
    } else {
      const data = readFallback();
      data.users = (data.users || []).filter(u => u.id !== numId);
      writeFallback(data);
    }
    return true;
  },

  async ensureDefaultRoot() {
    try {
      const rootEmail = (process.env.ROOT_EMAIL || 'admin@gamefy.com').toLowerCase().trim();
      const existing = await this.findUserByEmail(rootEmail);
      if (!existing) {
        const defaultPassword = process.env.ROOT_PASSWORD || 'GamefyAdmin2026!';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(defaultPassword, salt);
        const user = await this.createUser({
          name: 'Administrador Root',
          email: rootEmail,
          passwordHash: hash,
          role: 'root',
          status: 'active'
        });
        console.log(`👑 [Segurança] Conta Root inicial configurada com sucesso: ${rootEmail}`);
        return user;
      }
      return existing;
    } catch (err) {
      console.error('Erro ao verificar conta Root inicial:', err.message);
      return null;
    }
  },

  // ==========================================
  // GERENCIAMENTO DE GRUPOS DE REDES SOCIAIS
  // ==========================================
  async getGroups(userId = null) {
    if (isConnected) {
      let query = `
        SELECT g.*, 
               GROUP_CONCAT(ga.platform) as platforms,
               GROUP_CONCAT(ga.account_id) as account_ids
        FROM \`groups\` g
        LEFT JOIN group_accounts ga ON g.id = ga.group_id
      `;
      const params = [];
      if (userId) {
        query += ` WHERE g.user_id = ? `;
        params.push(parseInt(userId, 10));
      }
      query += ` GROUP BY g.id ORDER BY g.created_at DESC`;

      const [rows] = await pool.query(query, params);
      return rows.map(r => ({
        ...r,
        platforms: r.platforms ? r.platforms.split(',') : [],
        account_ids: r.account_ids ? r.account_ids.split(',') : []
      }));
    } else {
      const data = readFallback();
      let list = data.groups || [];
      if (userId) {
        list = list.filter(g => g.user_id === parseInt(userId, 10) || !g.user_id);
      }
      return list.map(g => {
        const accs = (data.group_accounts || []).filter(ga => ga.group_id === g.id);
        return {
          ...g,
          platforms: accs.map(a => a.platform),
          account_ids: accs.map(a => a.account_id)
        };
      });
    }
  },

  async getGroupById(id, userId = null) {
    const numId = parseInt(id, 10);
    const groups = await this.getGroups(userId);
    return groups.find(g => g.id === numId) || null;
  },

  async createGroup({ userId = 1, name, description = '', iconColor = '#6366f1', platforms = [] }) {
    if (isConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [res] = await conn.query(
          'INSERT INTO `groups` (user_id, name, description, icon_color) VALUES (?, ?, ?, ?)',
          [parseInt(userId, 10), name.trim(), description || '', iconColor || '#6366f1']
        );
        const groupId = res.insertId;

        for (const plat of platforms) {
          await conn.query(
            'INSERT INTO group_accounts (group_id, platform, account_id) VALUES (?, ?, ?)',
            [groupId, typeof plat === 'string' ? plat : plat.platform, typeof plat === 'object' ? plat.accountId : null]
          );
        }

        await conn.commit();
        conn.release();
        return await this.getGroupById(groupId, userId);
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    } else {
      const data = readFallback();
      if (!data.groups) data.groups = [];
      if (!data.group_accounts) data.group_accounts = [];

      const newId = (data.groups.length > 0 ? Math.max(...data.groups.map(g => g.id || 0)) : 0) + 1;
      const now = new Date().toISOString();
      const newGroup = {
        id: newId,
        user_id: parseInt(userId, 10) || 1,
        name: name.trim(),
        description: description || '',
        icon_color: iconColor || '#6366f1',
        created_at: now,
        updated_at: now
      };
      data.groups.push(newGroup);

      for (const plat of platforms) {
        data.group_accounts.push({
          id: data.group_accounts.length + 1,
          group_id: newId,
          platform: typeof plat === 'string' ? plat : plat.platform,
          account_id: typeof plat === 'object' ? plat.accountId : null,
          created_at: now
        });
      }

      writeFallback(data);
      return await this.getGroupById(newId, userId);
    }
  },

  async updateGroup(id, userId, { name, description, iconColor, platforms }) {
    const numId = parseInt(id, 10);
    if (isConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const updates = [];
        const params = [];
        if (name) { updates.push('name = ?'); params.push(name.trim()); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (iconColor) { updates.push('icon_color = ?'); params.push(iconColor); }

        if (updates.length > 0) {
          params.push(numId);
          await conn.query(`UPDATE \`groups\` SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        if (Array.isArray(platforms)) {
          await conn.query('DELETE FROM group_accounts WHERE group_id = ?', [numId]);
          for (const plat of platforms) {
            await conn.query(
              'INSERT INTO group_accounts (group_id, platform, account_id) VALUES (?, ?, ?)',
              [numId, typeof plat === 'string' ? plat : plat.platform, typeof plat === 'object' ? plat.accountId : null]
            );
          }
        }

        await conn.commit();
        conn.release();
        return await this.getGroupById(numId, userId);
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    } else {
      const data = readFallback();
      const group = (data.groups || []).find(g => g.id === numId);
      if (!group) return null;

      if (name) group.name = name.trim();
      if (description !== undefined) group.description = description;
      if (iconColor) group.icon_color = iconColor;
      group.updated_at = new Date().toISOString();

      if (Array.isArray(platforms)) {
        data.group_accounts = (data.group_accounts || []).filter(ga => ga.group_id !== numId);
        for (const plat of platforms) {
          data.group_accounts.push({
            id: data.group_accounts.length + 1,
            group_id: numId,
            platform: typeof plat === 'string' ? plat : plat.platform,
            account_id: typeof plat === 'object' ? plat.accountId : null,
            created_at: new Date().toISOString()
          });
        }
      }

      writeFallback(data);
      return await this.getGroupById(numId, userId);
    }
  },

  async deleteGroup(id, userId = null) {
    const numId = parseInt(id, 10);
    if (isConnected) {
      await pool.query('DELETE FROM group_accounts WHERE group_id = ?', [numId]);
      await pool.query('DELETE FROM `groups` WHERE id = ?', [numId]);
    } else {
      const data = readFallback();
      data.groups = (data.groups || []).filter(g => g.id !== numId);
      data.group_accounts = (data.group_accounts || []).filter(ga => ga.group_id !== numId);
      writeFallback(data);
    }
    return true;
  },

  // ==========================================
  // DESTINOS DE POST & STATUS PROFISSIONAIS
  // ==========================================
  async savePostDestinations(postId, destinations = []) {
    const numPostId = parseInt(postId, 10);
    if (isConnected) {
      for (const dest of destinations) {
        await pool.query(
          `INSERT INTO post_destinations 
            (post_id, platform, account_id, account_name, status, visibility, platform_post_id, public_url, error_log)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            numPostId,
            dest.platform,
            dest.accountId || null,
            dest.accountName || null,
            dest.status || 'pending',
            dest.visibility || 'unknown',
            dest.platformPostId || null,
            dest.publicUrl || null,
            dest.errorLog || null
          ]
        );
      }
      const [rows] = await pool.query('SELECT * FROM post_destinations WHERE post_id = ?', [numPostId]);
      return rows;
    } else {
      const data = readFallback();
      if (!data.post_destinations) data.post_destinations = [];
      const saved = [];
      for (const dest of destinations) {
        const newDest = {
          id: data.post_destinations.length + 1,
          post_id: numPostId,
          platform: dest.platform,
          account_id: dest.accountId || null,
          account_name: dest.accountName || null,
          status: dest.status || 'pending',
          visibility: dest.visibility || 'unknown',
          platform_post_id: dest.platformPostId || null,
          public_url: dest.publicUrl || null,
          error_log: dest.errorLog || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        data.post_destinations.push(newDest);
        saved.push(newDest);
      }
      writeFallback(data);
      return saved;
    }
  },

  async getPostDestinations(postId) {
    const numPostId = parseInt(postId, 10);
    if (isConnected) {
      const [rows] = await pool.query('SELECT * FROM post_destinations WHERE post_id = ?', [numPostId]);
      return rows;
    } else {
      const data = readFallback();
      return (data.post_destinations || []).filter(d => d.post_id === numPostId);
    }
  },

  async updatePostDestination(destId, updates) {
    const numId = parseInt(destId, 10);
    if (isConnected) {
      const fields = [];
      const params = [];
      if (updates.status) { fields.push('status = ?'); params.push(updates.status); }
      if (updates.visibility) { fields.push('visibility = ?'); params.push(updates.visibility); }
      if (updates.platformPostId !== undefined) { fields.push('platform_post_id = ?'); params.push(updates.platformPostId); }
      if (updates.publicUrl !== undefined) { fields.push('public_url = ?'); params.push(updates.publicUrl); }
      if (updates.errorLog !== undefined) { fields.push('error_log = ?'); params.push(updates.errorLog); }

      if (fields.length > 0) {
        params.push(numId);
        await pool.query(`UPDATE post_destinations SET ${fields.join(', ')} WHERE id = ?`, params);
      }
    } else {
      const data = readFallback();
      const dest = (data.post_destinations || []).find(d => d.id === numId);
      if (dest) {
        if (updates.status) dest.status = updates.status;
        if (updates.visibility) dest.visibility = updates.visibility;
        if (updates.platformPostId !== undefined) dest.platform_post_id = updates.platformPostId;
        if (updates.publicUrl !== undefined) dest.public_url = updates.publicUrl;
        if (updates.errorLog !== undefined) dest.error_log = updates.errorLog;
        dest.updated_at = new Date().toISOString();
        writeFallback(data);
      }
    }
    return true;
  }
};

module.exports = {
  initDB,
  db
};
