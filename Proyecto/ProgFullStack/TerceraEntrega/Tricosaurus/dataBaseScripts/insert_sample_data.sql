-- Script para insertar usuarios y partidas de ejemplo en Tricosaurus

USE tricosaurus;

-- ==============================================
-- USUARIOS DE EJEMPLO
-- ==============================================

INSERT INTO users (username, email, password_hash) VALUES
('marcelitoGamer', 'marcelitoPro1811@gmail.com', '$2y$10$/tFWhNQtdx9cvPegyK6aSO1jKJzmZxkqfZKJWTQgXeqHAbI9c.sVq'),
('chanchitoLoco', 'chanchito.Loco@gmail.com', '$2y$10$gcBRntWcziL5eW4qPMK9pef7dCKyAc5AapwmOBpzFvy96lb4HtZm.'),
('rickSanchez', 'rickC137@gmail.com', '$2y$10$J7SSXfnx9Syx.R6VXVlu/.rljEDHyQ2w008ZTAWmEhSa5tnaFhU..'),
('sonGoku', 'sonGoku@gmail.com', '$2y$10$YM7K5VjB.7khOPXAgciEBOmExQjUwMT4j3ndkheF8ce1Qs4mXPGq2');

-- marcelitoGamer 
-- Contraseña original: ElMasCap1to

-- chanchitoLoco
-- Contraseña original: oink1234

-- rickSanchez
-- Contraseña original: WubbaLubbaDubDub

-- sonGoku
-- Contraseña original: kamehameha


-- ==============================================
-- PARTIDAS DE EJEMPLO (Modo Seguimiento)
-- ==============================================

-- PARTIDA 1: marcelitoGamer (usuario_id = 1) - 2 jugadores, 4 rondas
INSERT INTO partidas (user_id, cant_jugadores, cant_rondas) VALUES (1, 2, 4);

INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES 
(1, 1, 16, 0),
(1, 2, 22, 0),
(1, 3, 22, 1),
(1, 4, 7, 0);

INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES
-- Ronda 1
(1, 1, 'SAME_FOREST', 0, 'SPECIE_1_copy_1'),
(1, 1, 'SAME_FOREST', 1, 'SPECIE_1_copy_2'),
(1, 1, 'SAME_FOREST', 2, 'SPECIE_1_copy_3'),
(1, 1, 'TRIO_TREES', 0, 'SPECIE_2_copy_1'),
(1, 1, 'TRIO_TREES', 1, 'SPECIE_3_copy_1'),
(1, 1, 'TRIO_TREES', 2, 'tRex_copy_1'),
-- Ronda 2
(1, 2, 'DIFFERENT_MEADOW', 0, 'SPECIE_1_copy_4'),
(1, 2, 'DIFFERENT_MEADOW', 1, 'SPECIE_2_copy_2'),
(1, 2, 'DIFFERENT_MEADOW', 2, 'SPECIE_3_copy_2'),
(1, 2, 'DIFFERENT_MEADOW', 3, 'SPECIE_4_copy_1'),
(1, 2, 'DIFFERENT_MEADOW', 4, 'SPECIE_5_copy_1'),
(1, 2, 'DIFFERENT_MEADOW', 5, 'tRex_copy_2'),
-- Ronda 3
(1, 3, 'LOVE_MEADOW', 0, 'SPECIE_1_copy_5'),
(1, 3, 'LOVE_MEADOW', 1, 'SPECIE_1_copy_6'),
(1, 3, 'KING', 0, 'SPECIE_2_copy_3'),
(1, 3, 'LONELY', 0, 'SPECIE_3_copy_3'),
(1, 3, 'RIVER', 0, 'SPECIE_4_copy_2'),
(1, 3, 'RIVER', 1, 'tRex_copy_3'),
-- Ronda 4
(1, 4, 'RIVER', 0, 'SPECIE_1_copy_7'),
(1, 4, 'RIVER', 1, 'SPECIE_2_copy_4'),
(1, 4, 'RIVER', 2, 'SPECIE_3_copy_4'),
(1, 4, 'RIVER', 3, 'SPECIE_4_copy_3'),
(1, 4, 'RIVER', 4, 'SPECIE_5_copy_2'),
(1, 4, 'RIVER', 5, 'tRex_copy_4');


-- PARTIDA 2: chanchitoLoco (usuario_id = 2) - 3 jugadores, 2 rondas
INSERT INTO partidas (user_id, cant_jugadores, cant_rondas) VALUES (2, 3, 2);

INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES 
(2, 1, 10, 0),
(2, 2, 23, 1);

INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES
-- Ronda 1
(2, 1, 'LOVE_MEADOW', 0, 'SPECIE_1_copy_8'),
(2, 1, 'LOVE_MEADOW', 1, 'SPECIE_1_copy_9'),
(2, 1, 'RIVER', 0, 'SPECIE_2_copy_5'),
(2, 1, 'RIVER', 1, 'SPECIE_3_copy_5'),
(2, 1, 'RIVER', 2, 'SPECIE_4_copy_4'),
(2, 1, 'RIVER', 3, 'tRex_copy_5'),
-- Ronda 2
(2, 2, 'KING', 0, 'SPECIE_1_copy_10'),
(2, 2, 'LONELY', 0, 'SPECIE_2_copy_6'),
(2, 2, 'TRIO_TREES', 0, 'SPECIE_3_copy_6'),
(2, 2, 'TRIO_TREES', 1, 'SPECIE_4_copy_5'),
(2, 2, 'TRIO_TREES', 2, 'SPECIE_5_copy_3'),
(2, 2, 'RIVER', 0, 'tRex_copy_6');


-- PARTIDA 3: rickSanchez (usuario_id = 3) - 4 jugadores, 2 rondas
INSERT INTO partidas (user_id, cant_jugadores, cant_rondas) VALUES (3, 4, 2);

INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES 
(3, 1, 7, 0),
(3, 2, 14, 0);

INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES
-- Ronda 1
(3, 1, 'RIVER', 0, 'SPECIE_1_copy_12'),
(3, 1, 'RIVER', 1, 'SPECIE_2_copy_8'),
(3, 1, 'RIVER', 2, 'SPECIE_3_copy_8'),
(3, 1, 'RIVER', 3, 'SPECIE_4_copy_7'),
(3, 1, 'RIVER', 4, 'SPECIE_5_copy_5'),
(3, 1, 'RIVER', 5, 'tRex_copy_8'),
-- Ronda 2
(3, 2, 'LOVE_MEADOW', 0, 'SPECIE_1_copy_13'),
(3, 2, 'LOVE_MEADOW', 1, 'SPECIE_1_copy_14'),
(3, 2, 'TRIO_TREES', 0, 'SPECIE_2_copy_9'),
(3, 2, 'TRIO_TREES', 1, 'SPECIE_3_copy_9'),
(3, 2, 'TRIO_TREES', 2, 'SPECIE_4_copy_8'),
(3, 2, 'RIVER', 0, 'tRex_copy_9');


-- PARTIDA 4: sonGoku (usuario_id = 4) - 2 jugadores, 4 rondas
INSERT INTO partidas (user_id, cant_jugadores, cant_rondas) VALUES (4, 2, 4);

INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES 
(4, 1, 22, 0),
(4, 2, 25, 0),
(4, 3, 25, 1),
(4, 4, 11, 0);

INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES
-- Ronda 1
(4, 1, 'DIFFERENT_MEADOW', 0, 'SPECIE_1_copy_15'),
(4, 1, 'DIFFERENT_MEADOW', 1, 'SPECIE_2_copy_10'),
(4, 1, 'DIFFERENT_MEADOW', 2, 'SPECIE_3_copy_10'),
(4, 1, 'DIFFERENT_MEADOW', 3, 'SPECIE_4_copy_9'),
(4, 1, 'DIFFERENT_MEADOW', 4, 'SPECIE_5_copy_6'),
(4, 1, 'DIFFERENT_MEADOW', 5, 'tRex_copy_10'),
-- Ronda 2
(4, 2, 'SAME_FOREST', 0, 'SPECIE_1_copy_16'),
(4, 2, 'SAME_FOREST', 1, 'SPECIE_1_copy_17'),
(4, 2, 'SAME_FOREST', 2, 'SPECIE_1_copy_18'),
(4, 2, 'SAME_FOREST', 3, 'SPECIE_1_copy_19'),
(4, 2, 'SAME_FOREST', 4, 'SPECIE_1_copy_20'),
(4, 2, 'SAME_FOREST', 5, 'tRex_copy_11'),
-- Ronda 3
(4, 3, 'LOVE_MEADOW', 0, 'SPECIE_2_copy_11'),
(4, 3, 'LOVE_MEADOW', 1, 'SPECIE_2_copy_12'),
(4, 3, 'LOVE_MEADOW', 2, 'SPECIE_3_copy_11'),
(4, 3, 'LOVE_MEADOW', 3, 'SPECIE_3_copy_12'),
(4, 3, 'KING', 0, 'SPECIE_4_copy_10'),
(4, 3, 'LONELY', 0, 'tRex_copy_12'),
-- Ronda 4
(4, 4, 'TRIO_TREES', 0, 'SPECIE_4_copy_11'),
(4, 4, 'TRIO_TREES', 1, 'SPECIE_5_copy_7'),
(4, 4, 'TRIO_TREES', 2, 'SPECIE_5_copy_8'),
(4, 4, 'RIVER', 0, 'SPECIE_1_copy_21'),
(4, 4, 'RIVER', 1, 'SPECIE_2_copy_13'),
(4, 4, 'RIVER', 2, 'tRex_copy_13');


-- ==============================================
-- RESUMEN DE PARTIDAS
-- ==============================================

SELECT 
    u.username,
    p.id as partida_id,
    p.cant_jugadores,
    p.cant_rondas,
    p.fecha,
    SUM(pr.puntaje) as puntaje_total
FROM users u
JOIN partidas p ON u.user_id = p.user_id
JOIN partida_rondas pr ON p.id = pr.partida_id
GROUP BY u.username, p.id, p.cant_jugadores, p.cant_rondas, p.fecha
ORDER BY puntaje_total DESC;

-- ==============================================
-- RESUMEN DE USUARIOS
-- ==============================================

SELECT 
    u.username,
    u.email,
    COUNT(DISTINCT p.id) as total_partidas,
    SUM(DISTINCT p.cant_jugadores) as total_jugadores_jugados,
    SUM(DISTINCT p.cant_rondas) as total_rondas_jugadas,
    COALESCE(SUM(pr.puntaje), 0) as puntaje_total_acumulado,
    ROUND(COALESCE(AVG(pr.puntaje), 0), 1) as puntaje_promedio_por_ronda,
    u.created_at as fecha_registro
FROM users u
LEFT JOIN partidas p ON u.user_id = p.user_id
LEFT JOIN partida_rondas pr ON p.id = pr.partida_id
GROUP BY u.user_id, u.username, u.email, u.created_at
ORDER BY puntaje_total_acumulado DESC;
