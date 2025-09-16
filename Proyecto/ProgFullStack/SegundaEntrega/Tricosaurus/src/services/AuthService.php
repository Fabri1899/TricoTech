<?php

class AuthService {

    private static ?AuthService $instance = null;
    private ?UserRepository $userRepository = null;

    private function __construct() {
        $this->userRepository = UserRepository::getInstance();
    }

    public static function getInstance() : AuthService {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function register(string $username, string $email, string $password): array {
        $username = trim($username);
        $email = trim($email);
        $password = trim($password);

        /** 
         * VALIDACIONES
        */

        // PRESENCIA
        if ($username === '' || $email === '' || $password === '') {
            return ['success' => false, 'code' => 'missing_fields', 'message' => 'Nombre de usuario, email y contraseña son requeridos.'];
        }

        // FORMATO EMAIL
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'code' => 'invalid_email', 'message' => 'Email inválido.'];
        }

        // LARGO MINIMO
        if (strlen($username) < 5) {
            return ['success' => false, 'code' => 'short_username', 'message' => 'El nombre de usuario debe tener al menos 5 caracteres.'];
        }

        if (strlen($password) < 8) {
            return ['success' => false, 'code' => 'weak_password', 'message' => 'La contraseña debe tener al menos 8 caracteres.'];
        }

        // VERIFICAR DUPLICADOS nombre_usuario
        if ($this->userRepository->findByUsername($username)) {
            return ['success' => false, 'code' => 'username_taken', 'message' => 'El nombre de usuario ya está registrado.'];
        }
        
        // VERIFICAR DUPLICADOS email
        if ($this->userRepository->findByEmail($email)) {
            return ['success' => false, 'code' => 'email_taken', 'message' => 'El email ya está registrado.'];
        }

        // HASH password
        $hash = password_hash($password, PASSWORD_DEFAULT);
        if ($hash === false) {
            return ['success' => false, 'code' => 'hash_error', 'message' => 'No se pudo procesar la contraseña.'];
        }

        // CREAR usuario
        $created = $this->userRepository->createUser($username, $email, $hash);
        if ($created === false || !is_array($created)) {
            return ['success' => false, 'code' => 'db_error', 'message' => 'No se pudo crear el usuario.'];
        }    

        return [
            'success' => true,
            'message' => 'Usuario creado exitosamente.',
            'user' => [
                'id' => (int)$created['id'],
                'username' => $created['username'],
                'email' => $created['email'],
            ]
        ];
    }
    
    private function verifyCredentials(string $identifier, string $plainPassword) {
        // Intentar por username, luego por email
        $user = $this->userRepository->findByUsername($identifier);
        if (!$user && filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = $this->userRepository->findByEmail($identifier);
        }

        if (!$user || !isset($user['password_hash']) || !is_string($user['password_hash'])) {
            return false;
        }

        if (!password_verify($plainPassword, $user['password_hash'])) {
            return false;
        }

        return [
            'id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
        ];
    }

    public function login(string $identifier, string $password): array {
    
        $basicUser = $this->verifyCredentials($identifier, $password);
        if ($basicUser === false) {
            return ['success' => false, 'code' => 'invalid_credentials', 'message' => 'Credenciales inválidas.'];
        }
        
        return [
            'success' => true,
            'message' => 'Login exitoso.',
            'user' => [
                'id' => (int)$basicUser['id'],
                'username' => $basicUser['username'],
                'email' => $basicUser['email'],
            ]
        ];
    }
}

?>