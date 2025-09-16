<?php

class conectionDB {
    private static ?conectionDB $instance = null;
    private $server;
    private $user;
    private $password;
    private $database;
    private $port;
    private $conn;

    private function __construct() {
        $this->loadConfig();
        $this->connect();
    }

    private function loadConfig(): void {
        $dir = dirname(__FILE__);
        $jsonData = file_get_contents($dir . '/config');
        $data = json_decode($jsonData, true)['conectionDB'];
        $this->server = $data['server'];
        $this->user = $data['user'];
        $this->password = $data['password'];
        $this->database = $data['database'];
        $this->port = (int)$data['port'];
    }

    private function connect(): void {
        $this->conn = new mysqli(
            $this->server,
            $this->user,
            $this->password,
            $this->database,
            $this->port
        );

        if ($this->conn->connect_error) {
            die("Error de conexión: " . $this->conn->connect_error);
        }

        $this->conn->set_charset("utf8");
    }

    public static function getInstance(): conectionDB {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): mysqli {
        return $this->conn;
    }

    public function close(): void {
        $this->conn->close();
        self::$instance = null;
    }
}




?>