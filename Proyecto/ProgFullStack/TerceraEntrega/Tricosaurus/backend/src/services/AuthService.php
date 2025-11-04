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
                'id' => (int)$created['user_id'],
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

    /**
     * Verifica la contraseña actual del usuario
     * @param int $userId ID del usuario
     * @param string $password Contraseña a verificar
     * @return bool True si la contraseña es correcta
     */
    public function verifyPassword(int $userId, string $password): bool {
        $passwordHash = $this->userRepository->getPasswordHash($userId);
        if (!$passwordHash) {
            return false;
        }
        return password_verify($password, $passwordHash);
    }

    /**
     * Actualiza el nombre de usuario
     * @param int $userId ID del usuario
     * @param string $newUsername Nuevo nombre de usuario
     * @param string $currentPassword Contraseña actual para verificación
     * @return array Resultado de la operación
     */
    public function updateUsername(int $userId, string $newUsername, string $currentPassword): array {
        $newUsername = trim($newUsername);

        // Validaciones
        if ($newUsername === '') {
            return ['success' => false, 'code' => 'missing_fields', 'message' => 'El nombre de usuario es requerido.'];
        }

        if (strlen($newUsername) < 5) {
            return ['success' => false, 'code' => 'short_username', 'message' => 'El nombre de usuario debe tener al menos 5 caracteres.'];
        }

        // Verificar contraseña actual
        if (!$this->verifyPassword($userId, $currentPassword)) {
            return ['success' => false, 'code' => 'invalid_password', 'message' => 'La contraseña actual es incorrecta.'];
        }

        // Verificar si el username ya existe
        $existingUser = $this->userRepository->findByUsername($newUsername);
        if ($existingUser && $existingUser['user_id'] != $userId) {
            return ['success' => false, 'code' => 'username_taken', 'message' => 'El nombre de usuario ya está registrado.'];
        }

        // Actualizar
        if (!$this->userRepository->updateUsername($userId, $newUsername)) {
            return ['success' => false, 'code' => 'db_error', 'message' => 'Error al actualizar el nombre de usuario.'];
        }

        // Obtener datos actualizados
        $updatedUser = $this->userRepository->findById($userId);
        
        return [
            'success' => true,
            'message' => 'Nombre de usuario actualizado correctamente.',
            'user' => $updatedUser ? [
                'id' => (int)$updatedUser['user_id'],
                'username' => $updatedUser['username'],
                'email' => $updatedUser['email']
            ] : null
        ];
    }

    /**
     * Actualiza el email
     * @param int $userId ID del usuario
     * @param string $newEmail Nuevo email
     * @param string $currentPassword Contraseña actual para verificación
     * @return array Resultado de la operación
     */
    public function updateEmail(int $userId, string $newEmail, string $currentPassword): array {
        $newEmail = trim($newEmail);

        // Validaciones
        if ($newEmail === '') {
            return ['success' => false, 'code' => 'missing_fields', 'message' => 'El email es requerido.'];
        }

        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'code' => 'invalid_email', 'message' => 'Email inválido.'];
        }

        // Verificar contraseña actual
        if (!$this->verifyPassword($userId, $currentPassword)) {
            return ['success' => false, 'code' => 'invalid_password', 'message' => 'La contraseña actual es incorrecta.'];
        }

        // Verificar si el email ya existe
        $existingUser = $this->userRepository->findByEmail($newEmail);
        if ($existingUser && $existingUser['user_id'] != $userId) {
            return ['success' => false, 'code' => 'email_taken', 'message' => 'El email ya está registrado.'];
        }

        // Actualizar
        if (!$this->userRepository->updateEmail($userId, $newEmail)) {
            return ['success' => false, 'code' => 'db_error', 'message' => 'Error al actualizar el email.'];
        }

        // Obtener datos actualizados
        $updatedUser = $this->userRepository->findById($userId);
        
        return [
            'success' => true,
            'message' => 'Email actualizado correctamente.',
            'user' => $updatedUser ? [
                'id' => (int)$updatedUser['user_id'],
                'username' => $updatedUser['username'],
                'email' => $updatedUser['email']
            ] : null
        ];
    }

    /**
     * Actualiza la contraseña
     * @param int $userId ID del usuario
     * @param string $newPassword Nueva contraseña
     * @param string $currentPassword Contraseña actual para verificación
     * @return array Resultado de la operación
     */
    public function updatePassword(int $userId, string $newPassword, string $currentPassword): array {
        $newPassword = trim($newPassword);

        // Validaciones
        if ($newPassword === '') {
            return ['success' => false, 'code' => 'missing_fields', 'message' => 'La nueva contraseña es requerida.'];
        }

        if (strlen($newPassword) < 8) {
            return ['success' => false, 'code' => 'weak_password', 'message' => 'La nueva contraseña debe tener al menos 8 caracteres.'];
        }

        // Verificar contraseña actual
        if (!$this->verifyPassword($userId, $currentPassword)) {
            return ['success' => false, 'code' => 'invalid_password', 'message' => 'La contraseña actual es incorrecta.'];
        }

        // Hash nueva contraseña
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        if ($newPasswordHash === false) {
            return ['success' => false, 'code' => 'hash_error', 'message' => 'No se pudo procesar la nueva contraseña.'];
        }

        // Actualizar
        if (!$this->userRepository->updatePassword($userId, $newPasswordHash)) {
            return ['success' => false, 'code' => 'db_error', 'message' => 'Error al actualizar la contraseña.'];
        }

        return [
            'success' => true,
            'message' => 'Contraseña actualizada correctamente.'
        ];
    }
}

?>