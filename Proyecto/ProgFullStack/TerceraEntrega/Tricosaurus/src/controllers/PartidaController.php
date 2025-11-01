<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../../inc/config/conectionDB.php';
require_once '../../src/repositories/PartidaRepository.php';
require_once '../../src/services/PartidaService.php';

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

// ----------------------------
// Punto de entrada directo
// ----------------------------
if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
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
