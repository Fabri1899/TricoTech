<?php

require_once __DIR__ . '/../../inc/config/conectionDB.php';

/**
 * Repository para gestión de usuarios en DB
 * - Encapsula operaciones CRUD para la entidad 'usuario'
 * - Usa consultas preparadas para prevenir SQL Injection
 */
class UserRepository{
    private static ?UserRepository $instance = null;
    private mysqli $conn;

    /**
     * Constructor privado para patrón Singleton
     * Obtiene conexión de la DB desde conectionDB
     */
    private function __construct(){
        $this->conn = conectionDB::getInstance()->getConnection();
    }

    /**
     * Retorna instancia única (Singleton)
     * @return UserRepository Instancia del repositorio
     */
    public static function getInstance(): UserRepository{
        if (self::$instance === null){
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Busca usuario por nombre de usuario
     * @param string $username Nombre de usuario a buscar
     * @return array|null Datos del usuario o null si no existe
     */
    public function findByUsername(string $username): ?array{
        $query = "SELECT user_id, username, email, password_hash FROM users WHERE username = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt){ return null; }

        $stmt->bind_param("s", $username);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result ? $result->fetch_assoc(): null;

        if ($result) { $result->free(); }
        $stmt->close();

        return $user ?: null;
    }

    /**
     * Busca usuario por email
     * @param string $email Email a buscar
     * @return array|null Datos del usuario o null si no existe
     */
    public function findByEmail(string $email): ?array{
        $query = "SELECT user_id, username, email, password_hash FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) { return null; }

        $stmt->bind_param("s", $email);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result ? $result->fetch_assoc() : null;

        if ($result) { $result->free(); }
        $stmt->close();

        return $user ?: null;
    }

    /**
     * Busca usuario por username o email
     * @param string $username Username a buscar
     * @param string $email Email a buscar
     * @return array|null Datos del usuario o null si no existe
     */
    public function findByUsernameOrEmail(string $username, string $email): ?array{
        $query = "SELECT user_id, username, email, password_hash FROM users WHERE username = ? OR email = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result ? $result->fetch_assoc() : null;

        if ($result) {
            $result->free();
        }

        $stmt->close();

        return $user ?: null;
    }

    /**
     * Crea nuevo usuario en la base de datos
     * @param string $username Nombre de usuario
     * @param string $email Email del usuario
     * @param string $hashedPassword Contraseña hasheada
     * @return array|false Array con datos del usuario creado o false en error
     */
    public function createUser(string $username, string $email, string $hashedPassword){
        $query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt){ return false; } 

        $stmt->bind_param("sss", $username, $email, $hashedPassword);
        $ok = $stmt->execute();

        if (!$ok) {
            $stmt->close();
            return false;
        }
        
        $stmt->close();
        return $ok;

    }
}

?>