<?php
session_start();
require_once __DIR__ . '/../services/PartidaService.php';

class PartidaController {
    private $service;

    public function __construct() {
        $this->service = new PartidaService();
    }

    public function guardar() {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        $result = $this->service->guardarPartida($userId, $input);
        echo json_encode($result);
    }

    public function listar() {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        $partidas = $this->service->listarPartidas($userId);
        echo json_encode(['success' => true, 'data' => $partidas]);
    }
}
