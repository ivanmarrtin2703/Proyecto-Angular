-- Base de datos Taskmate (MySQL 8+ recomendado)
--
-- Desde consola (ajusta usuario/contraseña):
--   mysql -u root -p < schema.sql
--
-- O en MySQL Workbench: File → Open SQL Script → ejecutar.

CREATE DATABASE IF NOT EXISTS taskmate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskmate_db;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'media',
  completed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_completed (completed),
  KEY idx_tasks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
