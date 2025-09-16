<?php
session_start();

class PartidaController {
    private $PartidaService;

    public function __construct() {
        $this->PartidaService = PartidaService::getInstance();
    }

    public function guardar() {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        $result = $this->PartidaService->guardarPartida($userId, $input);
        echo json_encode($result);
    }

    public function listar() {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        $partidas = $this->PartidaService->listarPartidas($userId);
        echo json_encode(['success' => true, 'data' => $partidas]);
    }
}
