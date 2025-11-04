<?php
// Activar la salida de errores PHP para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Establecer el manejador de errores personalizado
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'debug' => [
            'error' => $errstr,
            'file' => $errfile,
            'line' => $errline
        ]
    ]);
    exit;
});

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../inc/config/conectionDB.php';

// Función para cargar las clases del proyecto
function loadClass($className) {
    $paths = [
        __DIR__ . '/../src/controllers/',
        __DIR__ . '/../src/services/',
        __DIR__ . '/../src/repositories/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'debug' => [
            'error' => "Clase no encontrada: {$className}",
            'searched_in' => $paths
        ]
    ]);
    exit;
}

// Registrar el autoloader
spl_autoload_register('loadClass');

// Obtener la ruta de la URL
$path = $_GET['path'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Definir rutas y sus controladores
$routes = [
    'partidas' => [
        'controller' => 'PartidaController',
        'actions' => [
            'GET' => [
                'listar' => 'listar',
                'obtener' => 'obtener'
            ],
            'POST' => 'guardar',
            'PUT' => [
                'actualizar' => 'actualizar'
            ]
        ]
    ],
    'auth' => [
        'controller' => 'AuthController',
        'actions' => [
            'GET' => [
                'session' => 'checkSession'
            ],
            'POST' => [
                'login' => 'login',
                'register' => 'register',
                'logout' => 'logout',
                'update-username' => 'updateUsername',
                'update-email' => 'updateEmail',
                'update-password' => 'updatePassword'
            ]
        ]
    ]
];

// Procesar la ruta
$pathParts = explode('/', trim($path, '/'));
$resource = $pathParts[0] ?? '';
$action = $pathParts[1] ?? '';

try {
    if (!isset($routes[$resource])) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Recurso no encontrado',
            'debug' => [
                'path' => $path,
                'resource' => $resource,
                'available_resources' => array_keys($routes)
            ]
        ]);
        exit;
    }

    $controllerName = $routes[$resource]['controller'];
    $controllerFile = __DIR__ . "/../src/controllers/{$controllerName}.php";
    
    if (!file_exists($controllerFile)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error interno del servidor',
            'debug' => [
                'error' => "Controlador no encontrado",
                'controller' => $controllerName,
                'file' => $controllerFile
            ]
        ]);
        exit;
    }

    require_once $controllerFile;
    $controller = new $controllerName();
    
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if (!isset($routes[$resource]['actions'][$method])) {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido',
            'debug' => [
                'method' => $method,
                'allowed_methods' => array_keys($routes[$resource]['actions'])
            ]
        ]);
        exit;
    }

    $methodAction = $routes[$resource]['actions'][$method];
    
    if (is_array($methodAction)) {
        // Si la acción está vacía y es GET para partidas, usar 'listar' por defecto
        if (empty($action) && $resource === 'partidas' && $method === 'GET' && isset($methodAction['listar'])) {
            $action = 'listar';
        }
        
        if (empty($action) || !isset($methodAction[$action])) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Acción no encontrada',
                'debug' => [
                    'action' => $action,
                    'available_actions' => array_keys($methodAction)
                ]
            ]);
            exit;
        }
        $controller->{$methodAction[$action]}();
    } else {
        $controller->{$methodAction}();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'debug' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}