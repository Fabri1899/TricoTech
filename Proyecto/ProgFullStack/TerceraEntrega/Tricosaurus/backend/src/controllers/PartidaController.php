<?php

require_once __DIR__ . '/../../inc/config/conectionDB.php';
require_once __DIR__ . '/../repositories/PartidaRepository.php';
require_once __DIR__ . '/../services/PartidaService.php';

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

    public function obtener() {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        // Obtener el ID de la partida de los parámetros GET
        $partidaId = $_GET['id'] ?? null;
        
        if (!$partidaId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de partida requerido']);
            return;
        }

        $partida = $this->PartidaService->obtenerPartida((int)$partidaId, $userId);
        
        if (!$partida) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Partida no encontrada']);
            return;
        }

        echo json_encode(['success' => true, 'data' => $partida]);
    }

    public function actualizar() {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
            return;
        }

        // Obtener el ID de la partida de los parámetros GET
        $partidaId = $_GET['id'] ?? null;
        
        if (!$partidaId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de partida requerido']);
            return;
        }

        $result = $this->PartidaService->actualizarPartida((int)$partidaId, $userId, $input);
        
        if (!$result['success']) {
            http_response_code(400);
        }
        
        echo json_encode($result);
    }
}

// ----------------------------
// Punto de entrada directo (para compatibilidad con URLs antiguas)
// ----------------------------
if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    session_start();
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    $action = $_GET['action'] ?? null;
    $controller = new PartidaController();

    if ($action === 'guardar') {
        $controller->guardar();
    } elseif ($action === 'listar') {
        $controller->listar();
    } else {
        echo json_encode(['success' => false, 'message' => 'Ruta no encontrada']);
    }
}
