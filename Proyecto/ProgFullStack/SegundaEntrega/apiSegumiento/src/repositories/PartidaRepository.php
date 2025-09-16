<?php

require_once __DIR__ . '/../../inc/config/conectionDB.php';

class PartidaRepository {
    private $conn;

    public function __construct() {
        $this->conn = conectionDB::getConnection();
    }

    public function insertarPartida($userId, $cantJugadores, $cantRondas, $datosJson) {
        $stmt = $this->conn->prepare("INSERT INTO partidas (user_id, cant_jugadores, cant_rondas, datos) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiis", $userId, $cantJugadores, $cantRondas, $datosJson);
        return $stmt->execute();
    }

    public function obtenerPartidasPorUsuario($userId) {
        $stmt = $this->conn->prepare("SELECT id, cant_jugadores, cant_rondas, datos, fecha FROM partidas WHERE user_id = ? ORDER BY fecha DESC");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $partidas = [];
        while ($row = $result->fetch_assoc()) {
            $row['datos'] = json_decode($row['datos'], true);
            $partidas[] = $row;
        }
        return $partidas;
    }
}
