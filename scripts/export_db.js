const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, '..', 'database', 'fallback_storage.json');
const destLocal = path.join(__dirname, '..', 'database', 'social_publisher_banco_completo.sql');
const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));

let sql = '';
sql += '-- ========================================================\n';
sql += '-- DUMP EXPORTADO DO BANCO DE DADOS - SOCIAL PUBLISHER (GAMEFY)\n';
sql += '-- Data de Exportacao: ' + new Date().toISOString() + '\n';
sql += '-- Compativel com: MySQL 5.7+, MySQL 8+, MariaDB, Laragon, XAMPP, phpMyAdmin\n';
sql += '-- ========================================================\n\n';
sql += 'CREATE DATABASE IF NOT EXISTS `social_publisher_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
sql += 'USE `social_publisher_db`;\n\n';

// 1. Tabela users
sql += 'DROP TABLE IF EXISTS `users`;\n';
sql += 'CREATE TABLE `users` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `name` VARCHAR(255) NOT NULL,\n';
sql += '  `email` VARCHAR(255) NOT NULL UNIQUE,\n';
sql += '  `password_hash` VARCHAR(255) NOT NULL,\n';
sql += '  `role` ENUM(\'root\', \'admin\', \'user\', \'member\') DEFAULT \'user\',\n';
sql += '  `status` ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\',\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

if (data.users && data.users.length > 0) {
  sql += 'INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`) VALUES\n';
  const userRows = data.users.map(u => {
    const name = (u.name || '').replace(/'/g, "\\'");
    const email = (u.email || '').replace(/'/g, "\\'");
    const hash = (u.password_hash || '').replace(/'/g, "\\'");
    return `  (${u.id}, '${name}', '${email}', '${hash}', '${u.role || 'user'}', '${u.status || 'active'}')`;
  });
  sql += userRows.join(',\n') + ';\n\n';
}

// 2. Tabela groups
sql += 'DROP TABLE IF EXISTS `groups`;\n';
sql += 'CREATE TABLE `groups` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `user_id` INT NOT NULL,\n';
sql += '  `name` VARCHAR(255) NOT NULL,\n';
sql += '  `description` TEXT NULL,\n';
sql += '  `icon_color` VARCHAR(50) DEFAULT \'#6366f1\',\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

// 3. Tabela group_accounts
sql += 'DROP TABLE IF EXISTS `group_accounts`;\n';
sql += 'CREATE TABLE `group_accounts` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `group_id` INT NOT NULL,\n';
sql += '  `platform` ENUM(\'instagram\', \'facebook\', \'youtube\') NOT NULL,\n';
sql += '  `account_id` VARCHAR(255) NULL,\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

// 4. Tabela posts
sql += 'DROP TABLE IF EXISTS `posts`;\n';
sql += 'CREATE TABLE `posts` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `user_id` INT NULL,\n';
sql += '  `title` VARCHAR(255) NULL,\n';
sql += '  `caption` TEXT NOT NULL,\n';
sql += '  `media_url` VARCHAR(500) NULL,\n';
sql += '  `thumbnail_url` VARCHAR(500) NULL,\n';
sql += '  `media_type` ENUM(\'image\', \'video\', \'none\') DEFAULT \'none\',\n';
sql += '  `status` ENUM(\'draft\', \'scheduled\', \'published\', \'failed\') DEFAULT \'draft\',\n';
sql += '  `scheduled_at` DATETIME NULL,\n';
sql += '  `published_at` DATETIME NULL,\n';
sql += '  `error_message` TEXT NULL,\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

if (data.posts && data.posts.length > 0) {
  sql += 'INSERT INTO `posts` (`id`, `user_id`, `title`, `caption`, `media_url`, `thumbnail_url`, `media_type`, `status`, `scheduled_at`, `published_at`) VALUES\n';
  const postRows = data.posts.map(p => {
    const titleVal = p.title ? `'${p.title.replace(/'/g, "\\'")}'` : 'NULL';
    const captionVal = `'${(p.caption || '').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
    const mediaVal = p.media_url ? `'${p.media_url.replace(/'/g, "\\'")}'` : 'NULL';
    const thumbVal = p.thumbnail_url ? `'${p.thumbnail_url.replace(/'/g, "\\'")}'` : 'NULL';
    const schedVal = p.scheduled_at ? `'${p.scheduled_at.replace('T', ' ').slice(0, 19)}'` : 'NULL';
    const pubVal = p.published_at ? `'${p.published_at.replace('T', ' ').slice(0, 19)}'` : 'NULL';
    return `  (${p.id}, ${p.user_id || 'NULL'}, ${titleVal}, ${captionVal}, ${mediaVal}, ${thumbVal}, '${p.media_type || 'none'}', '${p.status || 'draft'}', ${schedVal}, ${pubVal})`;
  });
  sql += postRows.join(',\n') + ';\n\n';
}

// 5. Tabela post_platforms
sql += 'DROP TABLE IF EXISTS `post_platforms`;\n';
sql += 'CREATE TABLE `post_platforms` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `post_id` INT NOT NULL,\n';
sql += '  `platform` ENUM(\'instagram\', \'facebook\', \'youtube\') NOT NULL,\n';
sql += '  `platform_post_id` VARCHAR(255) NULL,\n';
sql += '  `status` ENUM(\'pending\', \'scheduled\', \'published\', \'failed\') DEFAULT \'pending\',\n';
sql += '  `response_data` TEXT NULL,\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

if (data.platforms && data.platforms.length > 0) {
  sql += 'INSERT INTO `post_platforms` (`id`, `post_id`, `platform`, `platform_post_id`, `status`) VALUES\n';
  const platRows = data.platforms.map(pl => {
    const platPostId = pl.platform_post_id ? `'${pl.platform_post_id}'` : 'NULL';
    return `  (${pl.id || 'NULL'}, ${pl.post_id}, '${pl.platform}', ${platPostId}, '${pl.status || 'pending'}')`;
  });
  sql += platRows.join(',\n') + ';\n\n';
}

// 6. Tabela social_accounts
sql += 'DROP TABLE IF EXISTS `social_accounts`;\n';
sql += 'CREATE TABLE `social_accounts` (\n';
sql += '  `platform` ENUM(\'instagram\', \'facebook\', \'youtube\') PRIMARY KEY,\n';
sql += '  `user_id` INT NULL,\n';
sql += '  `account_name` VARCHAR(255) NULL,\n';
sql += '  `account_id` VARCHAR(255) NULL,\n';
sql += '  `access_token` TEXT NULL,\n';
sql += '  `api_key` VARCHAR(255) NULL,\n';
sql += '  `avatar_url` VARCHAR(500) NULL,\n';
sql += '  `is_connected` BOOLEAN DEFAULT FALSE,\n';
sql += '  `extra_info` TEXT NULL,\n';
sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

if (data.accounts && data.accounts.length > 0) {
  sql += 'INSERT INTO `social_accounts` (`platform`, `account_name`, `account_id`, `access_token`, `avatar_url`, `is_connected`, `extra_info`) VALUES\n';
  const accRows = data.accounts.map(a => {
    const accName = a.account_name ? `'${a.account_name.replace(/'/g, "\\'")}'` : 'NULL';
    const accId = a.account_id ? `'${a.account_id.replace(/'/g, "\\'")}'` : 'NULL';
    const token = a.access_token ? `'${a.access_token.replace(/'/g, "\\'")}'` : 'NULL';
    const avatar = a.avatar_url ? `'${a.avatar_url.replace(/'/g, "\\'")}'` : 'NULL';
    const info = typeof a.extra_info === 'object' ? JSON.stringify(a.extra_info) : (a.extra_info || '');
    const infoVal = info ? `'${info.replace(/'/g, "\\'")}'` : 'NULL';
    return `  ('${a.platform}', ${accName}, ${accId}, ${token}, ${avatar}, ${a.is_connected ? 1 : 0}, ${infoVal})`;
  });
  sql += accRows.join(',\n') + ';\n\n';
}

// Destinos de exportação
const destDesktop = 'C:\\Users\\lexke\\OneDrive\\Desktop\\social_publisher_banco_completo.sql';
const destDesktopTxt = 'C:\\Users\\lexke\\OneDrive\\Desktop\\social_publisher_banco_completo.txt';

fs.writeFileSync(destLocal, sql, 'utf8');
fs.writeFileSync(destDesktop, sql, 'utf8');
fs.writeFileSync(destDesktopTxt, sql, 'utf8');

console.log('✅ EXPORTAÇÃO CONCLUÍDA COM SUCESSO!');
console.log('Arquivo Local:', destLocal);
console.log('Arquivo Desktop (SQL):', destDesktop);
console.log('Arquivo Desktop (TXT):', destDesktopTxt);
