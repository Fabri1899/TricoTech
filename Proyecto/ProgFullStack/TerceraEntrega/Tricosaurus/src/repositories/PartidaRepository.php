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
     * Inserta una nueva partida y sus datos relacionados
     */
    public function insertarPartida($userId, $cantJugadores, $cantRondas, $rondasData, $gameId = null) {
        $this->conn->begin_transaction();
        
        try {
            // Verificar si las nuevas tablas existen
            $tablasExisten = $this->verificarNuevasTablas();
            
            if ($tablasExisten) {
                // Usar el nuevo sistema con tablas separadas
                return $this->insertarPartidaNuevoSistema($userId, $cantJugadores, $cantRondas, $rondasData, $gameId);
            } else {
                // Usar el sistema antiguo con JSON
                return $this->insertarPartidaSistemaAntiguo($userId, $cantJugadores, $cantRondas, $rondasData, $gameId);
            }
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
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
        // Insertar la partida principal
        if ($gameId === null) {
            $stmt = $this->conn->prepare("INSERT INTO partidas (user_id, cant_jugadores, cant_rondas) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $userId, $cantJugadores, $cantRondas);
        } else {
            $stmt = $this->conn->prepare("INSERT INTO partidas (user_id, game_id, cant_jugadores, cant_rondas) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiii", $userId, $gameId, $cantJugadores, $cantRondas);
        }
        
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
            SELECT p.id, p.cant_jugadores, p.cant_rondas, p.fecha 
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
            
            // Reconstruir el formato JSON para compatibilidad
            $row['datos'] = [
                'puntajesPorRonda' => $puntajesPorRonda,
                'estado' => $estado,
                'kingPorRonda' => $kingPorRonda
            ];
            
            $partidas[] = $row;
        }
        
        return $partidas;
    }

    /**
     * Obtiene una partida específica por ID
     */
    public function obtenerPartidaPorId($partidaId, $userId) {
        $stmt = $this->conn->prepare("
            SELECT p.id, p.cant_jugadores, p.cant_rondas, p.fecha 
            FROM partidas p 
            WHERE p.id = ? AND p.user_id = ?
        ");
        $stmt->bind_param("ii", $partidaId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Usar la misma lógica que obtenerPartidasPorUsuario para reconstruir los datos
            $partidas = $this->obtenerPartidasPorUsuario($userId);
            foreach ($partidas as $partida) {
                if ($partida['id'] == $partidaId) {
                    return $partida;
                }
            }
        }
        
        return null;
    }
}
