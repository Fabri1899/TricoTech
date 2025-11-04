<?php

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = AuthService::getInstance();
    }

    /**
     * Valida y limpia los campos de entrada
     */
    private function validateFields($data, $requiredFields) {
        $missingFields = [];
        $cleanedData = [];

        foreach ($requiredFields as $field => $fieldName) {
            $value = isset($data[$field]) ? trim((string)$data[$field]) : '';
            if ($value === '') {
                $missingFields[] = $fieldName;
            }
            $cleanedData[$field] = $value;
        }

        if (!empty($missingFields)) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Los siguientes campos son requeridos: ' . implode(', ', $missingFields)
            ]);
            return null;
        }

        return $cleanedData;
    }

    /**
     * Maneja la respuesta del servicio
     */
    private function handleServiceResponse($result, $successCode = 200) {
        if (!is_array($result) || !array_key_exists('success', $result)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
            return;
        }

        if ($result['success']) {
            http_response_code($successCode);
        } else {
            $code = $result['code'] ?? 'error';
            switch ($code) {
                case 'invalid':
                    http_response_code(400);
                    break;
                case 'duplicate':
                    http_response_code(409);
                    break;
                case 'unauthorized':
                    http_response_code(401);
                    break;
                default:
                    http_response_code(500);
            }
        }

        echo json_encode($result);
    }

    public function register() {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido.']);
            return;
        }

        $fields = $this->validateFields($data, [
            'username' => 'nombre_usuario',
            'email' => 'email',
            'password' => 'password'
        ]);

        if ($fields === null) return;

        $result = $this->authService->register(
            $fields['username'],
            $fields['email'],
            $fields['password']
        );

        $this->handleServiceResponse($result, 201);
    }

    public function login() {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
            return;
        }

        // Normalizar identifier: puede venir como 'identifier', 'email' o 'username'
        $identifier = $data['identifier'] ?? ($data['email'] ?? ($data['username'] ?? null));
        
        // Preparar datos normalizados para validación
        $normalizedData = [
            'identifier' => $identifier,
            'password' => $data['password'] ?? null
        ];
        
        $fields = $this->validateFields($normalizedData, [
            'identifier' => 'identificador',
            'password' => 'password'
        ]);

        if ($fields === null) return;

        $result = $this->authService->login($fields['identifier'], $fields['password']);

        if ($result['success'] && isset($result['user']['id'])) {
            $_SESSION['user_id'] = (int)$result['user']['id'];
        }

        $this->handleServiceResponse($result);
    }

    /**
     * Verifica si el usuario está autenticado y devuelve sus datos
     */
    public function checkSession() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no autenticado',
                'authenticated' => false
            ]);
            return;
        }

        $userId = $_SESSION['user_id'];
        $userRepository = UserRepository::getInstance();
        
        // Obtener datos del usuario desde la base de datos
        $user = $userRepository->findById($userId);

        if (!$user) {
            // Sesión inválida, usuario no existe
            unset($_SESSION['user_id']);
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'message' => 'Sesión inválida',
                'authenticated' => false
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => (int)$user['user_id'],
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ]);
    }

    /**
     * Cierra la sesión del usuario
     */
    public function logout() {
        session_destroy();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Actualiza el nombre de usuario
     */
    public function updateUsername() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            return;
        }

        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
            return;
        }

        $fields = $this->validateFields($data, [
            'username' => 'nombre_usuario',
            'password' => 'contraseña_actual'
        ]);

        if ($fields === null) return;

        $userId = $_SESSION['user_id'];
        $result = $this->authService->updateUsername($userId, $fields['username'], $fields['password']);

        // Si se actualizó correctamente, actualizar la sesión con los nuevos datos
        if ($result['success'] && isset($result['user'])) {
            // Los datos del usuario ya están actualizados en la DB
        }

        $this->handleServiceResponse($result);
    }

    /**
     * Actualiza el email
     */
    public function updateEmail() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            return;
        }

        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
            return;
        }

        $fields = $this->validateFields($data, [
            'email' => 'email',
            'password' => 'contraseña_actual'
        ]);

        if ($fields === null) return;

        $userId = $_SESSION['user_id'];
        $result = $this->authService->updateEmail($userId, $fields['email'], $fields['password']);

        $this->handleServiceResponse($result);
    }

    /**
     * Actualiza la contraseña
     */
    public function updatePassword() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
            return;
        }

        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
            return;
        }

        $fields = $this->validateFields($data, [
            'newPassword' => 'nueva_contraseña',
            'password' => 'contraseña_actual'
        ]);

        if ($fields === null) return;

        $userId = $_SESSION['user_id'];
        $result = $this->authService->updatePassword($userId, $fields['newPassword'], $fields['password']);

        $this->handleServiceResponse($result);
    }
}

?>