<?php

$conn = new mysqli('localhost', 'Fabri1899', '1899', 'pruebaAPI');
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
echo"conexion ok";

phpinfo();
?>