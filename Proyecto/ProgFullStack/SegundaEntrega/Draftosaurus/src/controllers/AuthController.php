<?php

class AuthController{

    private $authService;

    public function __construct(){
        $this->authService = AuthService::getInstance();
    }

    public function register(){

        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido.']);
            return;
        }

        $username = isset($data['username']) ? trim((string)$data['username']) : '';
        $email = isset($data['email']) ? trim((string)$data['email']) : '';
        $password = isset($data['password']) ? trim((string)$data['password']) : '';

        
        if ($username === '' || $email === '' || $password === '') {
            http_response_code(400);

            $missingFields = [];
            if ($username === '') $missingFields[] = 'nombre_usuario';
            if ($email === '') $missingFields[] = 'email';
            if ($password === '') $missingFields[] = 'password';

            echo json_encode(['success' => false, 'message' => 'Los siguientes campos son requeridos: ' . implode(', ', $missingFields)]);
            return;
        }

        $result = $this->authService->register($username, $email, $password);

        if (!is_array($result) || !array_key_exists('success', $result)){
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
            return;
        }

        if ($result['success'] === true) {
            http_response_code(201);
        } else {
            $code = isset($result['code']) ? $result['code'] : 'error';
            if ($code === 'invalid') {
                http_response_code(400);
            } elseif ($code === 'duplicate') {
                http_response_code(409);
            } else {
                http_response_code(500);    
            }
        }

        echo json_encode($result);
    }

    public function login() {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON invalido']);
            return;
        }

        $identifier = $data['identifier'] ?? ($data['email'] ?? ($data['username'] ?? null));
        $password = $data['password'] ?? null;

        if (!$identifier || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identificador (email o nombre de usuario) y contraseña son requeridos.']);
        return;
        }
        
        $identifier = trim((string) $identifier);
        $password = (string)$password;
    
        if ($identifier === '' || $password === ''){
            http_response_code(400);

            $missingFields = [];
            if ($identifier === '') $missingFields = ['identifier'];
            if ($password === '') $missingFields = ['password'];

            echo json_encode(['success' => false, 'message' => 'Los siguientes campos son requeridos: ' . implode(', ', $missingFields)]);
            return;
        }

        $result = $this->authService->login($identifier, $password);

        if (!is_array($result) || !array_key_exists('success', $result)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
        return;
        }

        if ($result['success']) {
            http_response_code(200);
        } else {
            http_response_code(401);
        }

        echo json_encode($result);
    }

    
}

?>