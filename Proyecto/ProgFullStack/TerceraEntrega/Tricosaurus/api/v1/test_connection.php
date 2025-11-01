<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    echo "Probando conexión a la base de datos...\n";
    
    require_once '../../inc/config/conectionDB.php';
    echo "Archivo de conexión cargado correctamente\n";
    
    $db = conectionDB::getInstance();
    echo "Instancia de conexión creada\n";
    
    $conn = $db->getConnection();
    echo "Conexión obtenida\n";
    
    if ($conn->ping()) {
        echo "Conexión a MySQL exitosa\n";
        echo json_encode(['success' => true, 'message' => 'Conexión exitosa']);
    } else {
        echo "Error en la conexión a MySQL\n";
        echo json_encode(['success' => false, 'message' => 'Error de conexión a MySQL']);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
