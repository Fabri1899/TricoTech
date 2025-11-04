-- Script único para crear la base de datos completa de Tricosaurus
-- Incluye tablas base (usuarios, partidas, rondas, posiciones) y tablas del modo juego

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
    tipo ENUM('seguimiento', 'juego') NOT NULL DEFAULT 'seguimiento',
    user_id BIGINT NOT NULL,
    game_id BIGINT NULL,
    cant_jugadores INT NOT NULL,
    cant_rondas INT NOT NULL,
    datos JSON NULL,
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
-- TABLAS DEL MODO JUEGO
-- ==============================================

-- Bolsas grandes por ronda (bolsa principal con todos los dinosaurios)
CREATE TABLE IF NOT EXISTS bolsas_ronda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    dinosaurios JSON NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bolsas_ronda_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partida_ronda_bolsa (partida_id, numero_ronda)
);

-- Bolsas individuales por jugador
CREATE TABLE IF NOT EXISTS bolsas_jugador (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    numero_jugador INT NOT NULL,
    dinosaurios JSON NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bolsas_jugador_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partida_ronda_jugador_bolsa (partida_id, numero_ronda, numero_jugador)
);

-- Posiciones por jugador (tableros individuales)
CREATE TABLE IF NOT EXISTS posiciones_jugador (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    numero_jugador INT NOT NULL,
    recinto VARCHAR(50) NOT NULL,
    posicion_slot INT NOT NULL,
    dinosaurio_id VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_posiciones_jugador_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partida_ronda_jugador_recinto_slot (partida_id, numero_ronda, numero_jugador, recinto, posicion_slot)
);

-- Puntajes por jugador por ronda
CREATE TABLE IF NOT EXISTS puntajes_jugador (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    numero_ronda INT NOT NULL,
    numero_jugador INT NOT NULL,
    puntaje INT NOT NULL DEFAULT 0,
    es_rey BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_puntajes_jugador_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partida_ronda_jugador_puntaje (partida_id, numero_ronda, numero_jugador)
);

-- ==============================================
-- ÍNDICES OPTIMIZADOS
-- ==============================================

-- Índices para tabla users
CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- Índices para tabla partidas
CREATE INDEX IF NOT EXISTS ix_partidas_user_fecha ON partidas (user_id, fecha);

-- Índices para tabla partida_rondas
CREATE INDEX IF NOT EXISTS ix_partida_rondas_partida ON partida_rondas (partida_id);

-- Índices para tabla posiciones_dinosaurios
CREATE INDEX IF NOT EXISTS ix_posiciones_partida_ronda ON posiciones_dinosaurios (partida_id, numero_ronda);

-- Índices para tablas del modo juego
CREATE INDEX IF NOT EXISTS ix_bolsas_ronda_partida ON bolsas_ronda (partida_id, numero_ronda);
CREATE INDEX IF NOT EXISTS ix_bolsas_jugador_partida ON bolsas_jugador (partida_id, numero_ronda, numero_jugador);
CREATE INDEX IF NOT EXISTS ix_posiciones_jugador_partida ON posiciones_jugador (partida_id, numero_ronda, numero_jugador);
CREATE INDEX IF NOT EXISTS ix_puntajes_jugador_partida ON puntajes_jugador (partida_id, numero_ronda, numero_jugador);


