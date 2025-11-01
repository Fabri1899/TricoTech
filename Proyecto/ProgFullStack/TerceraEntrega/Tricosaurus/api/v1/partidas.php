<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../../inc/config/conectionDB.php';
require_once '../../src/repositories/PartidaRepository.php';
require_once '../../src/services/PartidaService.php';
require_once '../../src/controllers/PartidaController.php';

$action = $_GET['action'] ?? null;

$controller = new PartidaController();

if ($action === 'guardar') {
    $controller->guardar();
} elseif ($action === 'listar') {
    $controller->listar();
} else {
    echo json_encode(['success' => false, 'message' => 'Ruta no encontrada']);
}


// Shim para mantener compatibilidad con rutas antiguas que apuntaban a /api/v1/partidas.php
