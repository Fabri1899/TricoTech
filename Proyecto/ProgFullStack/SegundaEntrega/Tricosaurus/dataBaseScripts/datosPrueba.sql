USE tricosaurus;

-- Usuarios
INSERT INTO users (username, email, password_hash) VALUES
('alice', 'alice@example.com', '$2y$10$$2y$12$e493ym5VyAoyt4htyW7ZDucAe5NQC17M0R.OA5LSX1zam7GRxZWkG');
-- Contraseña original: 18991899

-- Partidas de ejemplo
INSERT INTO partidas (user_id, cant_jugadores, cant_rondas, datos)
VALUES
(1, 3, 2, '{
  "estado": {
    "Ronda 1": {
      "KING": ["SPECIE_4_copy_1"],
      "RIVER": [null, null, null, null, null, null],
      "LONELY": [null],
      "TRIO_TREES": ["SPECIE_5_copy_5", null, null],
      "LOVE_MEADOW": [null, null, null, null, null, null],
      "SAME_FOREST": ["SPECIE_5_copy_1", "SPECIE_5_copy_2", "SPECIE_5_copy_3", "SPECIE_5_copy_4", null, null],
      "DIFFERENT_MEADOW": [null, null, null, null, null, null]
    },
    "Ronda 2": {
      "KING": ["SPECIE_2_copy_1"],
      "RIVER": [null, null, null, null, null, null],
      "LONELY": [null],
      "TRIO_TREES": ["SPECIE_4_copy_1", "SPECIE_3_copy_1", null],
      "LOVE_MEADOW": [null, null, null, null, null, null],
      "SAME_FOREST": ["SPECIE_5_copy_1", null, null, null, null, null],
      "DIFFERENT_MEADOW": ["SPECIE_5_copy_2", "SPECIE_2_copy_2", null, null, null, null]
    }
  },
  "puntajesPorRonda": {
    "Ronda 1": 12,
    "Ronda 2": 5,
    "Ronda 3": 0,
    "Ronda 4": 0
  }
}');
