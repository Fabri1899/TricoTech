
<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../../inc/config/conectionDB.php';
require_once '../../src/repositories/UserRepository.php';
require_once '../../src/services/AuthService.php';
require_once '../../src/controllers/AuthController.php';

$action = $_GET['action'] ?? null;

$controller = new AuthController();

if ($action === 'login') {
    $controller->login();
} elseif ($action === 'register') {
    $controller->register();
} else {
    echo json_encode(['success' => false, 'message' => 'Ruta no encontrada']);
}