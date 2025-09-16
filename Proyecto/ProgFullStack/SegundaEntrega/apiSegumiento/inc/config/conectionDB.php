<?php

class conectionDB {
    private static $connection = null;

    public static function getConnection() {
        if (self::$connection === null) {
            // Datos de conexión
            $host = "localhost";        // o IP del servidor
            $user = "Fabri1899";             // usuario MySQL
            $password = "1899";             // contraseña
            $database = "prueba";    // tu base de datos

            // Crear conexión
            self::$connection = new mysqli($host, $user, $password, $database);

            // Verificar conexión
            if (self::$connection->connect_error) {
                die("Conexión fallida: " . self::$connection->connect_error);
            }

            // Opcional: establecer charset a UTF8
            self::$connection->set_charset("utf8");
        }
        return self::$connection;
    }
}