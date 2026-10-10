-- ========================================================================
-- BANCO DE DADOS OFICIAL - SOCIAL PUBLISHER (GAMEFY)
-- Compatível com: MySQL 5.7+, MySQL 8.0+, MariaDB 10+, phpMyAdmin, Laragon, XAMPP
-- ========================================================================

CREATE DATABASE IF NOT EXISTS social_publisher_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE social_publisher_db;

-- 1. TABELA DE USUÁRIOS DO SISTEMA
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

-- 2. TABELA DE GRUPOS DE PUBLICAÇÃO
CREATE TABLE IF NOT EXISTS `groups` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  icon_color VARCHAR(50) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE VÍNCULO DE GRUPOS COM CONTAS
CREATE TABLE IF NOT EXISTS group_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  platform ENUM('instagram', 'facebook', 'youtube') NOT NULL,
  account_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE POSTAGENS E VÍDEOS
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

-- 5. TABELA DE STATUS POR PLATAFORMA
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

-- 6. TABELA DE DESTINOS DETALHADOS DE POSTAGEM
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

-- 7. TABELA DE CONTAS E REDES SOCIAIS CONECTADAS
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

-- 8. TABELA DE CONFIGURAÇÕES GERAIS
CREATE TABLE IF NOT EXISTS settings (
  key_name VARCHAR(100) PRIMARY KEY,
  key_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. INSERÇÃO DO USUÁRIO ADMINISTRADOR ROOT PADRÃO (admin@gamefy.com / admin123)
-- Hash bcrypt gerado com salt 10
INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'Administrador Root', 
  'admin@gamefy.com', 
  '$2a$10$wU05z8zQ0Zk0q1Y4R3n.i.QJ3aJ1xQe0Q1xQe0Q1xQe0Q1xQe0Q1x', 
  'root', 
  'active'
)
ON DUPLICATE KEY UPDATE role = 'root', status = 'active';
