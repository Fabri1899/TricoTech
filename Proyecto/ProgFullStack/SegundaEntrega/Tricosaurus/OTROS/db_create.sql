CREATE DATABASE IF NOT EXISTS tricosaurus;
USE tricosaurus;

-- Registered users
CREATE TABLE users (
  user_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  username         VARCHAR(50) NOT NULL UNIQUE,
  email            VARCHAR(120) NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,        
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- Game (2 local players)
CREATE TABLE games (
  game_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  -- type             ENUM('game', 'tracing') NOT NULL DEFAULT '',
  status           ENUM('PREPARATION','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PREPARATION',
  player1_id       BIGINT NULL,
  player2_id       BIGINT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at       TIMESTAMP NULL,
  finished_at      TIMESTAMP NULL,
  CONSTRAINT fk_games_player1 FOREIGN KEY (player1_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_games_player2 FOREIGN KEY (player2_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Placements (board state)
-- species: 6 species (T_REX + 5 generic A..E)
-- tile_index: 0..N-1 in enclosures - in RIVER -> NULL
CREATE TABLE placements (
  placement_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
  game_id          BIGINT NOT NULL,
  player_seat      TINYINT NOT NULL,  
  enclosure        ENUM('FOREST_EQUAL','MEADOW_DIFFERENT','PRAIRIE_LOVE','TREES_TRIO','KING','SOLITARY','RIVER') NOT NULL,
  tile_index       TINYINT NULL,
  species          ENUM('T_REX','A','B','C','D','E') NOT NULL,
  placed_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_placements_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
  UNIQUE KEY uq_tile_enclosure (game_id, player_seat, enclosure, tile_index)  
);

-- Piece bag con columnas por especie
CREATE TABLE bags (
  bag_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  game_id      BIGINT NOT NULL,
  T_REX_quantity  TINYINT NOT NULL DEFAULT 0,
  A_quantity      TINYINT NOT NULL DEFAULT 0,
  B_quantity      TINYINT NOT NULL DEFAULT 0,
  C_quantity      TINYINT NOT NULL DEFAULT 0,
  D_quantity      TINYINT NOT NULL DEFAULT 0,
  E_quantity      TINYINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_bags_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Hands con columnas por especie
CREATE TABLE hands (
  hand_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
  game_id     BIGINT NOT NULL,
  player_id   BIGINT NOT NULL,
  T_REX_quantity  TINYINT NOT NULL DEFAULT 0,
  A_quantity      TINYINT NOT NULL DEFAULT 0,
  B_quantity      TINYINT NOT NULL DEFAULT 0,
  C_quantity      TINYINT NOT NULL DEFAULT 0,
  D_quantity      TINYINT NOT NULL DEFAULT 0,
  E_quantity      TINYINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_hands_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
  CONSTRAINT fk_hands_player FOREIGN KEY (player_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- Index for quickly retrieving positions
CREATE INDEX ix_placements_board ON placements (game_id, player_seat, enclosure);