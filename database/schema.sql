CREATE DATABASE IF NOT EXISTS social_publisher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE social_publisher_db;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NULL,
  caption TEXT NOT NULL,
  media_url VARCHAR(500) NULL,
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

CREATE TABLE IF NOT EXISTS settings (
  key_name VARCHAR(100) PRIMARY KEY,
  key_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
