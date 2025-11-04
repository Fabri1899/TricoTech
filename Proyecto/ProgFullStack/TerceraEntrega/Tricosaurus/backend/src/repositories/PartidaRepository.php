<?php

require_once __DIR__ . '/../../inc/config/conectionDB.php';

class PartidaRepository {
    private static ?PartidaRepository $instance = null;
    private mysqli $conn;

    private function __construct(){
        $this->conn = conectionDB::getInstance()->getConnection();
    }

    public static function getInstance(): PartidaRepository{
        if (self::$instance === null){
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Inserta una nueva partida de modo juego con bolsas y tableros por jugador
     */
    public function insertarPartidaJuego($userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        $this->conn->begin_transaction();
        
        try {
            // Insertar la partida principal con tipo 'juego'
            $sql = "INSERT INTO partidas (user_id, game_id, cant_jugadores, cant_rondas, tipo) VALUES (?, ?, ?, ?, 'juego')";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("iiii", $userId, $gameId, $cantJugadores, $cantRondas);
            
            if (!$stmt->execute()) {
                throw new Exception("Error al insertar partida: " . $this->conn->error);
            }
            
            $partidaId = $this->conn->insert_id;
            
            // Insertar datos de cada ronda
            foreach ($rondasData as $numeroRonda => $rondaData) {
                // Guardar bolsa grande
                if (isset($rondaData['bolsaGrande'])) {
                    $stmt = $this->conn->prepare("INSERT INTO bolsas_ronda (partida_id, numero_ronda, dinosaurios) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE dinosaurios = ?");
                    $bolsaJson = json_encode($rondaData['bolsaGrande']);
                    $stmt->bind_param("iiss", $partidaId, $numeroRonda, $bolsaJson, $bolsaJson);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar bolsa grande: " . $this->conn->error);
                    }
                }
                
                // Guardar bolsas de jugadores
                foreach ($rondaData['bolsasJugadores'] ?? [] as $numeroJugador => $dinosaurios) {
                    $stmt = $this->conn->prepare("INSERT INTO bolsas_jugador (partida_id, numero_ronda, numero_jugador, dinosaurios) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE dinosaurios = ?");
                    $bolsaJson = json_encode($dinosaurios);
                    $stmt->bind_param("iiiss", $partidaId, $numeroRonda, $numeroJugador, $bolsaJson, $bolsaJson);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar bolsa jugador: " . $this->conn->error);
                    }
                }
                
                // Guardar datos de cada jugador (puntajes y posiciones)
                foreach ($rondaData['jugadores'] ?? [] as $numeroJugador => $jugadorData) {
                    // Puntajes
                    $puntaje = $jugadorData['puntaje'] ?? 0;
                    $esRey = $jugadorData['esRey'] ?? false;
                    $stmt = $this->conn->prepare("INSERT INTO puntajes_jugador (partida_id, numero_ronda, numero_jugador, puntaje, es_rey) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntaje = ?, es_rey = ?");
                    $stmt->bind_param("iiiiiii", $partidaId, $numeroRonda, $numeroJugador, $puntaje, $esRey, $puntaje, $esRey);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar puntaje jugador: " . $this->conn->error);
                    }
                    
                    // Posiciones de dinosaurios
                    if (isset($jugadorData['posiciones'])) {
                        foreach ($jugadorData['posiciones'] as $recinto => $posiciones) {
                            foreach ($posiciones as $posicionSlot => $dinosaurioId) {
                                if ($dinosaurioId !== null && $dinosaurioId !== '') {
                                    $stmt = $this->conn->prepare("INSERT INTO posiciones_jugador (partida_id, numero_ronda, numero_jugador, recinto, posicion_slot, dinosaurio_id) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE dinosaurio_id = ?");
                                    $stmt->bind_param("iiisiss", $partidaId, $numeroRonda, $numeroJugador, $recinto, $posicionSlot, $dinosaurioId, $dinosaurioId);
                                    if (!$stmt->execute()) {
                                        throw new Exception("Error al insertar posición jugador: " . $this->conn->error);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            $this->conn->commit();
            return $partidaId;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * Actualiza una partida existente de modo juego
     */
    public function actualizarPartidaJuego($partidaId, $userId, $cantJugadores, $cantRondas, $rondasData) {
        // Verificar que la partida pertenece al usuario
        $stmt = $this->conn->prepare("SELECT id FROM partidas WHERE id = ? AND user_id = ? AND tipo = 'juego'");
        $stmt->bind_param("ii", $partidaId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if (!$result->fetch_assoc()) {
            throw new Exception("Partida no encontrada o no pertenece al usuario");
        }
        
        $this->conn->begin_transaction();
        
        try {
            // Actualizar información básica de la partida
            $stmt = $this->conn->prepare("UPDATE partidas SET cant_jugadores = ?, cant_rondas = ? WHERE id = ?");
            $stmt->bind_param("iii", $cantJugadores, $cantRondas, $partidaId);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar partida: " . $this->conn->error);
            }
            
            // Eliminar datos antiguos de rondas
            $stmt = $this->conn->prepare("DELETE FROM bolsas_ronda WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM bolsas_jugador WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM puntajes_jugador WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM posiciones_jugador WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            // Insertar datos actualizados de cada ronda (mismo código que insertarPartidaJuego)
            foreach ($rondasData as $numeroRonda => $rondaData) {
                // Guardar bolsa grande
                if (isset($rondaData['bolsaGrande'])) {
                    $stmt = $this->conn->prepare("INSERT INTO bolsas_ronda (partida_id, numero_ronda, dinosaurios) VALUES (?, ?, ?)");
                    $bolsaJson = json_encode($rondaData['bolsaGrande']);
                    $stmt->bind_param("iis", $partidaId, $numeroRonda, $bolsaJson);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar bolsa grande: " . $this->conn->error);
                    }
                }
                
                // Guardar bolsas de jugadores
                foreach ($rondaData['bolsasJugadores'] ?? [] as $numeroJugador => $dinosaurios) {
                    $stmt = $this->conn->prepare("INSERT INTO bolsas_jugador (partida_id, numero_ronda, numero_jugador, dinosaurios) VALUES (?, ?, ?, ?)");
                    $bolsaJson = json_encode($dinosaurios);
                    $stmt->bind_param("iiis", $partidaId, $numeroRonda, $numeroJugador, $bolsaJson);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar bolsa jugador: " . $this->conn->error);
                    }
                }
                
                // Guardar datos de cada jugador (puntajes y posiciones)
                foreach ($rondaData['jugadores'] ?? [] as $numeroJugador => $jugadorData) {
                    // Puntajes
                    $puntaje = $jugadorData['puntaje'] ?? 0;
                    $esRey = $jugadorData['esRey'] ?? false;
                    $stmt = $this->conn->prepare("INSERT INTO puntajes_jugador (partida_id, numero_ronda, numero_jugador, puntaje, es_rey) VALUES (?, ?, ?, ?, ?)");
                    $stmt->bind_param("iiiii", $partidaId, $numeroRonda, $numeroJugador, $puntaje, $esRey);
                    if (!$stmt->execute()) {
                        throw new Exception("Error al insertar puntaje jugador: " . $this->conn->error);
                    }
                    
                    // Posiciones de dinosaurios
                    if (isset($jugadorData['posiciones'])) {
                        foreach ($jugadorData['posiciones'] as $recinto => $posiciones) {
                            foreach ($posiciones as $posicionSlot => $dinosaurioId) {
                                if ($dinosaurioId !== null && $dinosaurioId !== '') {
                                    $stmt = $this->conn->prepare("INSERT INTO posiciones_jugador (partida_id, numero_ronda, numero_jugador, recinto, posicion_slot, dinosaurio_id) VALUES (?, ?, ?, ?, ?, ?)");
                                    $stmt->bind_param("iiisii", $partidaId, $numeroRonda, $numeroJugador, $recinto, $posicionSlot, $dinosaurioId);
                                    if (!$stmt->execute()) {
                                        throw new Exception("Error al insertar posición jugador: " . $this->conn->error);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            $this->conn->commit();
            return $partidaId;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * Actualiza una partida existente de modo seguimiento
     */
    public function actualizarPartida($partidaId, $userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        // Verificar que la partida pertenece al usuario
        $stmt = $this->conn->prepare("SELECT id FROM partidas WHERE id = ? AND user_id = ? AND tipo = 'seguimiento'");
        $stmt->bind_param("ii", $partidaId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if (!$result->fetch_assoc()) {
            throw new Exception("Partida no encontrada o no pertenece al usuario");
        }
        
        $this->conn->begin_transaction();
        
        try {
            // Actualizar información básica de la partida
            $stmt = $this->conn->prepare("UPDATE partidas SET cant_jugadores = ?, cant_rondas = ? WHERE id = ?");
            $stmt->bind_param("iii", $cantJugadores, $cantRondas, $partidaId);
            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar partida: " . $this->conn->error);
            }
            
            // Eliminar datos antiguos
            $stmt = $this->conn->prepare("DELETE FROM partida_rondas WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM posiciones_dinosaurios WHERE partida_id = ?");
            $stmt->bind_param("i", $partidaId);
            $stmt->execute();
            
            // Insertar datos actualizados de rondas
            foreach ($rondasData as $numeroRonda => $rondaData) {
                $puntaje = $rondaData['puntaje'] ?? 0;
                $esRey = $rondaData['esRey'] ?? false;
                
                $stmt = $this->conn->prepare("INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiii", $partidaId, $numeroRonda, $puntaje, $esRey);
                
                if (!$stmt->execute()) {
                    throw new Exception("Error al insertar datos de ronda: " . $this->conn->error);
                }
                
                // Insertar posiciones de dinosaurios
                if (isset($rondaData['posiciones'])) {
                    foreach ($rondaData['posiciones'] as $recinto => $posiciones) {
                        foreach ($posiciones as $posicionSlot => $dinosaurioId) {
                            if ($dinosaurioId !== null && $dinosaurioId !== '') {
                                $stmt = $this->conn->prepare("INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES (?, ?, ?, ?, ?)");
                                $stmt->bind_param("iisis", $partidaId, $numeroRonda, $recinto, $posicionSlot, $dinosaurioId);
                                
                                if (!$stmt->execute()) {
                                    throw new Exception("Error al insertar posición de dinosaurio: " . $this->conn->error);
                                }
                            }
                        }
                    }
                }
            }
            
            $this->conn->commit();
            return $partidaId;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * Inserta una nueva partida y sus datos relacionados (modo seguimiento)
     */
    public function insertarPartida($userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        $this->conn->begin_transaction();
        
        try {
            // Insertar la partida principal (modo seguimiento)
            // game_id puede ser NULL, siempre usamos la misma query
            $sql = "INSERT INTO partidas (user_id, game_id, cant_jugadores, cant_rondas, tipo) VALUES (?, ?, ?, ?, 'seguimiento')";
            $stmt = $this->conn->prepare($sql);
            
            // Siempre pasamos game_id (puede ser NULL)
            // mysqli bind_param acepta null para campos nullable con tipo "i"
            $stmt->bind_param("iiii", $userId, $gameId, $cantJugadores, $cantRondas);
            
            if (!$stmt->execute()) {
                throw new Exception("Error al insertar partida: " . $this->conn->error);
            }
            
            $partidaId = $this->conn->insert_id;
            
            // Insertar datos de rondas
            foreach ($rondasData as $numeroRonda => $rondaData) {
                $puntaje = $rondaData['puntaje'] ?? 0;
                $esRey = $rondaData['esRey'] ?? false;
                
                $stmt = $this->conn->prepare("INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiii", $partidaId, $numeroRonda, $puntaje, $esRey);
                
                if (!$stmt->execute()) {
                    throw new Exception("Error al insertar datos de ronda: " . $this->conn->error);
                }
                
                // Insertar posiciones de dinosaurios
                if (isset($rondaData['posiciones'])) {
                    foreach ($rondaData['posiciones'] as $recinto => $posiciones) {
                        foreach ($posiciones as $posicionSlot => $dinosaurioId) {
                            if ($dinosaurioId !== null && $dinosaurioId !== '') {
                                $stmt = $this->conn->prepare("INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES (?, ?, ?, ?, ?)");
                                $stmt->bind_param("iisis", $partidaId, $numeroRonda, $recinto, $posicionSlot, $dinosaurioId);
                                
                                if (!$stmt->execute()) {
                                    throw new Exception("Error al insertar posición de dinosaurio: " . $this->conn->error);
                                }
                            }
                        }
                    }
                }
            }
            
            $this->conn->commit();
            return $partidaId;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }    /**
     * Verifica si las nuevas tablas existen
     */
    private function verificarNuevasTablas() {
        $result = $this->conn->query("SHOW TABLES LIKE 'partida_rondas'");
        return $result->num_rows > 0;
    }

    /**
     * Inserta partida usando el nuevo sistema (tablas separadas)
     */
    private function insertarPartidaNuevoSistema($userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        // Preparar la consulta SQL dinámicamente
        $sql = "INSERT INTO partidas (user_id, " . ($gameId !== null ? "game_id, " : "") . "cant_jugadores, cant_rondas) VALUES (?, " . ($gameId !== null ? "?, " : "") . "?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        // Preparar los parámetros dinámicamente
        $types = "i" . ($gameId !== null ? "i" : "") . "ii";
        $params = [$userId];
        if ($gameId !== null) $params[] = $gameId;
        $params = array_merge($params, [$cantJugadores, $cantRondas]);
        
        $stmt->bind_param($types, ...$params);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al insertar partida: " . $this->conn->error);
        }
        
        $partidaId = $this->conn->insert_id;
        
        // Insertar datos de rondas
        foreach ($rondasData as $numeroRonda => $rondaData) {
            $puntaje = $rondaData['puntaje'] ?? 0;
            $esRey = $rondaData['esRey'] ?? false;
            
            $stmt = $this->conn->prepare("INSERT INTO partida_rondas (partida_id, numero_ronda, puntaje, es_rey) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiii", $partidaId, $numeroRonda, $puntaje, $esRey);
            
            if (!$stmt->execute()) {
                throw new Exception("Error al insertar datos de ronda: " . $this->conn->error);
            }
            
            // Insertar posiciones de dinosaurios
            if (isset($rondaData['posiciones'])) {
                foreach ($rondaData['posiciones'] as $recinto => $posiciones) {
                    foreach ($posiciones as $posicionSlot => $dinosaurioId) {
                        if ($dinosaurioId !== null && $dinosaurioId !== '') {
                            $stmt = $this->conn->prepare("INSERT INTO posiciones_dinosaurios (partida_id, numero_ronda, recinto, posicion_slot, dinosaurio_id) VALUES (?, ?, ?, ?, ?)");
                            $stmt->bind_param("iisis", $partidaId, $numeroRonda, $recinto, $posicionSlot, $dinosaurioId);
                            
                            if (!$stmt->execute()) {
                                throw new Exception("Error al insertar posición de dinosaurio: " . $this->conn->error);
                            }
                        }
                    }
                }
            }
        }
        
        $this->conn->commit();
        return $partidaId;
    }

    /**
     * Inserta partida usando el sistema antiguo (JSON)
     */
    private function insertarPartidaSistemaAntiguo($userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        // Convertir datos de rondas a formato JSON para compatibilidad
        $datosJson = $this->convertirRondasDataAJson($rondasData);
        
        if ($gameId === null) {
            $stmt = $this->conn->prepare("INSERT INTO partidas (user_id, cant_jugadores, cant_rondas, datos) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiis", $userId, $cantJugadores, $cantRondas, $datosJson);
        } else {
            $stmt = $this->conn->prepare("INSERT INTO partidas (user_id, game_id, cant_jugadores, cant_rondas, datos) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiis", $userId, $gameId, $cantJugadores, $cantRondas, $datosJson);
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Error al insertar partida (sistema antiguo): " . $this->conn->error);
        }
        
        $partidaId = $this->conn->insert_id;
        $this->conn->commit();
        return $partidaId;
    }

    /**
     * Convierte datos de rondas al formato JSON para compatibilidad con sistema antiguo
     */
    private function convertirRondasDataAJson($rondasData) {
        $puntajesPorRonda = [];
        $estado = [];
        $kingPorRonda = [];
        
        foreach ($rondasData as $numeroRonda => $rondaData) {
            $rondaKey = "Ronda " . $numeroRonda;
            $puntajesPorRonda[$rondaKey] = $rondaData['puntaje'] ?? 0;
            $kingPorRonda[$rondaKey] = $rondaData['esRey'] ?? false;
            
            if (isset($rondaData['posiciones'])) {
                $estado[$rondaKey] = [];
                foreach ($rondaData['posiciones'] as $recinto => $posiciones) {
                    $estado[$rondaKey][$recinto] = [];
                    foreach ($posiciones as $slot => $dinosaurioId) {
                        $estado[$rondaKey][$recinto][$slot] = $dinosaurioId;
                    }
                }
            }
        }
        
        return json_encode([
            'puntajesPorRonda' => $puntajesPorRonda,
            'estado' => $estado,
            'kingPorRonda' => $kingPorRonda
        ]);
    }

    /**
     * Obtiene todas las partidas de un usuario con sus datos completos
     */
    public function obtenerPartidasPorUsuario($userId) {
        $stmt = $this->conn->prepare("
            SELECT p.id, p.cant_jugadores, p.cant_rondas, p.fecha, p.tipo
            FROM partidas p 
            WHERE p.user_id = ? 
            ORDER BY p.fecha DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $partidas = [];
        while ($row = $result->fetch_assoc()) {
            $partidaId = $row['id'];
            $tipo = $row['tipo'] ?? 'seguimiento';
            
            if ($tipo === 'juego') {
                // Cargar datos del modo juego
                $row['tipo'] = 'juego';
                $row['datos'] = $this->cargarDatosPartidaJuego($partidaId);
                $partidas[] = $row;
            } else {
                // Obtener datos de rondas (modo seguimiento)
                $rondasStmt = $this->conn->prepare("
                    SELECT numero_ronda, puntaje, es_rey 
                    FROM partida_rondas 
                    WHERE partida_id = ? 
                    ORDER BY numero_ronda
                ");
                $rondasStmt->bind_param("i", $partidaId);
                $rondasStmt->execute();
                $rondasResult = $rondasStmt->get_result();
                
                $puntajesPorRonda = [];
                $kingPorRonda = [];
                
                while ($ronda = $rondasResult->fetch_assoc()) {
                    $rondaKey = "Ronda " . $ronda['numero_ronda'];
                    $puntajesPorRonda[$rondaKey] = $ronda['puntaje'];
                    $kingPorRonda[$rondaKey] = (bool)$ronda['es_rey'];
                }
            
                // Obtener posiciones de dinosaurios
                $posicionesStmt = $this->conn->prepare("
                    SELECT numero_ronda, recinto, posicion_slot, dinosaurio_id 
                    FROM posiciones_dinosaurios 
                    WHERE partida_id = ? 
                    ORDER BY numero_ronda, recinto, posicion_slot
                ");
                $posicionesStmt->bind_param("i", $partidaId);
                $posicionesStmt->execute();
                $posicionesResult = $posicionesStmt->get_result();
            
            $estado = [];
            while ($posicion = $posicionesResult->fetch_assoc()) {
                $rondaKey = "Ronda " . $posicion['numero_ronda'];
                $recinto = $posicion['recinto'];
                $slot = $posicion['posicion_slot'];
                $dinosaurioId = $posicion['dinosaurio_id'];
                
                if (!isset($estado[$rondaKey])) {
                    $estado[$rondaKey] = [];
                }
                if (!isset($estado[$rondaKey][$recinto])) {
                    $estado[$rondaKey][$recinto] = [];
                }
                
                // Asegurar que el array tenga el tamaño correcto
                while (count($estado[$rondaKey][$recinto]) <= $slot) {
                    $estado[$rondaKey][$recinto][] = null;
                }
                
                $estado[$rondaKey][$recinto][$slot] = $dinosaurioId;
            }
            
            // Reconstruir el formato JSON para compatibilidad
            $row['datos'] = [
                'puntajesPorRonda' => $puntajesPorRonda,
                'estado' => $estado,
                'kingPorRonda' => $kingPorRonda
            ];
            
            $partidas[] = $row;
        }
        
        // Cerrar el while ($row = $result->fetch_assoc())
        }
        
        return $partidas;
    }

    /**
     * Carga datos de una partida de tipo juego (con bolsas y tableros por jugador)
     */
    private function cargarDatosPartidaJuego($partidaId) {
        $rondas = [];
        
        // Obtener todas las rondas de la partida
        $stmt = $this->conn->prepare("
            SELECT DISTINCT numero_ronda 
            FROM bolsas_ronda 
            WHERE partida_id = ? 
            ORDER BY numero_ronda
        ");
        $stmt->bind_param("i", $partidaId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $numerosRonda = [];
        while ($row = $result->fetch_assoc()) {
            $numerosRonda[] = $row['numero_ronda'];
        }
        
        foreach ($numerosRonda as $numeroRonda) {
            $rondas[$numeroRonda] = [];
            
            // Cargar bolsa grande
            $stmt = $this->conn->prepare("
                SELECT dinosaurios 
                FROM bolsas_ronda 
                WHERE partida_id = ? AND numero_ronda = ?
            ");
            $stmt->bind_param("ii", $partidaId, $numeroRonda);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($bolsaRow = $result->fetch_assoc()) {
                $rondas[$numeroRonda]['bolsaGrande'] = json_decode($bolsaRow['dinosaurios'], true);
            }
            
            // Cargar bolsas de jugadores
            $stmt = $this->conn->prepare("
                SELECT numero_jugador, dinosaurios 
                FROM bolsas_jugador 
                WHERE partida_id = ? AND numero_ronda = ?
            ");
            $stmt->bind_param("ii", $partidaId, $numeroRonda);
            $stmt->execute();
            $result = $stmt->get_result();
            $rondas[$numeroRonda]['bolsasJugadores'] = [];
            while ($bolsaJug = $result->fetch_assoc()) {
                $rondas[$numeroRonda]['bolsasJugadores'][$bolsaJug['numero_jugador']] = json_decode($bolsaJug['dinosaurios'], true);
            }
            
            // Cargar datos de jugadores (puntajes y posiciones)
            $stmt = $this->conn->prepare("
                SELECT numero_jugador, puntaje, es_rey 
                FROM puntajes_jugador 
                WHERE partida_id = ? AND numero_ronda = ?
            ");
            $stmt->bind_param("ii", $partidaId, $numeroRonda);
            $stmt->execute();
            $result = $stmt->get_result();
            $rondas[$numeroRonda]['jugadores'] = [];
            while ($puntajeRow = $result->fetch_assoc()) {
                $numJug = $puntajeRow['numero_jugador'];
                $rondas[$numeroRonda]['jugadores'][$numJug] = [
                    'puntaje' => $puntajeRow['puntaje'],
                    'esRey' => (bool)$puntajeRow['es_rey'],
                    'posiciones' => []
                ];
            }
            
            // Cargar posiciones de dinosaurios por jugador
            $stmt = $this->conn->prepare("
                SELECT numero_jugador, recinto, posicion_slot, dinosaurio_id 
                FROM posiciones_jugador 
                WHERE partida_id = ? AND numero_ronda = ?
                ORDER BY numero_jugador, recinto, posicion_slot
            ");
            $stmt->bind_param("ii", $partidaId, $numeroRonda);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($posRow = $result->fetch_assoc()) {
                $numJug = $posRow['numero_jugador'];
                $recinto = $posRow['recinto'];
                $slot = $posRow['posicion_slot'];
                $dinoId = $posRow['dinosaurio_id'];
                
                if (!isset($rondas[$numeroRonda]['jugadores'][$numJug])) {
                    $rondas[$numeroRonda]['jugadores'][$numJug] = ['puntaje' => 0, 'esRey' => false, 'posiciones' => []];
                }
                if (!isset($rondas[$numeroRonda]['jugadores'][$numJug]['posiciones'][$recinto])) {
                    $rondas[$numeroRonda]['jugadores'][$numJug]['posiciones'][$recinto] = [];
                }
                while (count($rondas[$numeroRonda]['jugadores'][$numJug]['posiciones'][$recinto]) <= $slot) {
                    $rondas[$numeroRonda]['jugadores'][$numJug]['posiciones'][$recinto][] = null;
                }
                $rondas[$numeroRonda]['jugadores'][$numJug]['posiciones'][$recinto][$slot] = $dinoId;
            }
        }
        
        return ['rondas' => $rondas];
    }

    /**
     * Obtiene una partida específica por ID con todos sus datos relacionados
     */
    public function obtenerPartidaPorId($partidaId, $userId) {
        // Obtener datos básicos de la partida
        $stmt = $this->conn->prepare("
            SELECT p.id, p.cant_jugadores, p.cant_rondas, p.fecha, p.tipo
            FROM partidas p 
            WHERE p.id = ? AND p.user_id = ?
        ");
        $stmt->bind_param("ii", $partidaId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if (!($row = $result->fetch_assoc())) {
            return null;
        }
        
        $tipo = $row['tipo'] ?? 'seguimiento';
        
        if ($tipo === 'juego') {
            // Cargar datos del modo juego
            $row['datos'] = $this->cargarDatosPartidaJuego($partidaId);
            return $row;
        }

        // Obtener datos de rondas
        $rondasStmt = $this->conn->prepare("
            SELECT numero_ronda, puntaje, es_rey 
            FROM partida_rondas 
            WHERE partida_id = ? 
            ORDER BY numero_ronda
        ");
        $rondasStmt->bind_param("i", $partidaId);
        $rondasStmt->execute();
        $rondasResult = $rondasStmt->get_result();
        
        $puntajesPorRonda = [];
        $kingPorRonda = [];
        
        while ($ronda = $rondasResult->fetch_assoc()) {
            $rondaKey = "Ronda " . $ronda['numero_ronda'];
            $puntajesPorRonda[$rondaKey] = $ronda['puntaje'];
            $kingPorRonda[$rondaKey] = (bool)$ronda['es_rey'];
        }
        
        // Obtener posiciones de dinosaurios
        $posicionesStmt = $this->conn->prepare("
            SELECT numero_ronda, recinto, posicion_slot, dinosaurio_id 
            FROM posiciones_dinosaurios 
            WHERE partida_id = ? 
            ORDER BY numero_ronda, recinto, posicion_slot
        ");
        $posicionesStmt->bind_param("i", $partidaId);
        $posicionesStmt->execute();
        $posicionesResult = $posicionesStmt->get_result();
        
        $estado = [];
        while ($posicion = $posicionesResult->fetch_assoc()) {
            $rondaKey = "Ronda " . $posicion['numero_ronda'];
            $recinto = $posicion['recinto'];
            $slot = $posicion['posicion_slot'];
            $dinosaurioId = $posicion['dinosaurio_id'];
            
            if (!isset($estado[$rondaKey])) {
                $estado[$rondaKey] = [];
            }
            if (!isset($estado[$rondaKey][$recinto])) {
                $estado[$rondaKey][$recinto] = [];
            }
            
            // Asegurar que el array tenga el tamaño correcto
            while (count($estado[$rondaKey][$recinto]) <= $slot) {
                $estado[$rondaKey][$recinto][] = null;
            }
            
            $estado[$rondaKey][$recinto][$slot] = $dinosaurioId;
        }
        
        $row['datos'] = [
            'puntajesPorRonda' => $puntajesPorRonda,
            'estado' => $estado,
            'kingPorRonda' => $kingPorRonda
        ];
        
        return $row;
    }
}
