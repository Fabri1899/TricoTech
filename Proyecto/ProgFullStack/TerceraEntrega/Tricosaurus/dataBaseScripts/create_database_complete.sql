-- Script único para crear la base de datos completa de Tricosaurus
-- Incluye todas las tablas necesarias y solo los índices que se usan realmente

CREATE DATABASE IF NOT EXISTS tricosaurus;
USE tricosaurus;

-- ==============================================
-- TABLA DE USUARIOS
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================
-- TABLA DE PARTIDAS PRINCIPAL
-- ==============================================
CREATE TABLE IF NOT EXISTS partidas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NULL, -- Campo opcional para futuras funcionalidades
    cant_jugadores INT NOT NULL,
    cant_rondas INT NOT NULL,
    datos JSON NULL, -- Campo opcional para compatibilidad con sistema antiguo
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partidas_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLA DE RONDAS DE PARTIDAS (Sistema Normalizado)
-- ==============================================
CREATE TABLE IF NOT EXISTS partida_rondas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    puntaje INT NOT NULL DEFAULT 0,
    es_rey BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partida_rondas_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partida_ronda (partida_id, numero_ronda)
);

-- ==============================================
-- TABLA DE POSICIONES DE DINOSAURIOS (Sistema Normalizado)
-- ==============================================
CREATE TABLE IF NOT EXISTS posiciones_dinosaurios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    recinto VARCHAR(50) NOT NULL,
    posicion_slot INT NOT NULL,
    dinosaurio_id VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posiciones_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE
);

-- ==============================================
-- ÍNDICES OPTIMIZADOS(Solo los que se usan realmente)
-- ==============================================

-- Índices para tabla users (basados en consultas reales del UserRepository)
-- Usado en: findByUsername, findByEmail, findByUsernameOrEmail
CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- Índices para tabla partidas (basados en consultas reales del PartidaRepository)
-- Usado en: obtenerPartidasPorUsuario (WHERE user_id = ? ORDER BY fecha DESC)
CREATE INDEX IF NOT EXISTS ix_partidas_user_fecha ON partidas (user_id, fecha);

-- Índices para tabla partida_rondas (basados en consultas reales)
-- Usado en: obtenerPartidasPorUsuario (WHERE partida_id = ? ORDER BY numero_ronda)
CREATE INDEX IF NOT EXISTS ix_partida_rondas_partida ON partida_rondas (partida_id);

-- Índices para tabla posiciones_dinosaurios (basados en consultas reales)
-- Usado en: obtenerPartidasPorUsuario (WHERE partida_id = ? ORDER BY numero_ronda, recinto, posicion_slot)
CREATE INDEX IF NOT EXISTS ix_posiciones_partida_ronda ON posiciones_dinosaurios (partida_id, numero_ronda);

