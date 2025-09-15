<?php
$pageTitle = "Cuenta - Draftosaurus";
include '../../inc/templates/header.php';
include '../../inc/templates/nav.php';
?>

<main>

    <div class="contenedor-cuenta">
        <div class="pestanas-formulario">
            <button class="btn-pestana active" onclick="mostrarFormulario('login')">Iniciar Sesión</button>
            <button class="btn-pestana" onclick="mostrarFormulario('registro')">Registrarse</button>
        </div>

        <div id="formulario-login" class="formulario">
            <h2>Iniciar Sesión</h2>
            <form>
                <div class="grupo-formulario">
                    <label for="login_identifier">Email o Nombre de Usuario:</label>
                    <input type="text" id="login_identifier" required>
                </div>
                <div class="grupo-formulario">
                    <label for="login_password">Contraseña:</label>
                    <input type="password" id="login_password" required>
                </div>
                <button type="button" onclick="login()">Iniciar Sesión</button>
            </form>
        </div>

        <div id="formulario-registro" class="formulario" style="display: none;">
            <h2>Crear Cuenta</h2>
            <form>
                <div class="grupo-formulario">
                    <label for="username">Nombre de Usuario:</label>
                    <input type="text" id="register_username" required>
                </div>
                <div class="grupo-formulario">
                    <label for="email-registro">Email:</label>
                    <input type="email" id="register_email" required>
                </div>
                <div class="grupo-formulario">
                    <label for="password-registro">Contraseña:</label>
                    <input type="password" id="register_password" required>
                </div>

                <button type="button" onclick="register()">Registrarse</button>
            </form>
        </div>
        <div class="message" id="message"></div>
    </div>

    <script src="../../assets/js/script.js"></script>


</main>

</body>

</html>