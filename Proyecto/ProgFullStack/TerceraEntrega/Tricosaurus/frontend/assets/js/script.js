'use strict'



// =============================
// FORMULARIOS DE LOGIN Y REGISTRO
// =============================

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.parentElement.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('bx-hide');
        toggleIcon.classList.add('bx-show');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('bx-show');
        toggleIcon.classList.add('bx-hide');
    }
}

function mostrarFormulario(tipo) {
    const loginForm = document.getElementById('formulario-login');
    const registroForm = document.getElementById('formulario-registro');
    const buttons = document.querySelectorAll('.btn-pestana');
    
    if (!loginForm || !registroForm || !buttons || buttons.length < 2) {
        console.error('No se encontraron elementos necesarios para cambiar formulario');
        return;
    }

    if (tipo === 'login') {
        loginForm.style.display = 'block';
        registroForm.style.display = 'none';
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else if (tipo === 'registro') {
        loginForm.style.display = 'none';
        registroForm.style.display = 'block';
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

// login() was moved to assets/js/login.js to avoid conflicts.
// Keep a small shim so old inline onclicks still work if present.
function login() {
    console.warn('login() is handled by assets/js/login.js. Ensure that file is loaded.');
}
// =============================
// VERIFICACIÓN DE SESIÓN
// =============================

async function checkSession() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    
    try {
        const response = await fetch(`${API_URL}?path=auth/session`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return { success: false, authenticated: false };
    }
}

async function logout() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    
    try {
        const response = await fetch(`${API_URL}?path=auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();
        
        if (result && result.success) {
            // Limpiar el token y los datos del usuario
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirigir a la página de login
            window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // En caso de error, intentar limpiar el localStorage de todos modos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html';
    }
}

// Verificar sesión al cargar la página en user_access.html
async function initUserAccess() {
    const token = localStorage.getItem('token');
    if (token) {
        // Si hay un token, redirigir al index
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/index.html';
    } else {
        // Usuario no logueado - mostrar formularios
        mostrarFormulariosLogin();
    }
}

function mostrarUsuarioLogueado(user) {
    // Ocultar formularios de login/registro
    const loginForm = document.getElementById('formulario-login');
    const registroForm = document.getElementById('formulario-registro');
    const pestanasFormulario = document.querySelector('.pestanas-formulario');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registroForm) registroForm.style.display = 'none';
    if (pestanasFormulario) pestanasFormulario.style.display = 'none';
    
    // Crear y mostrar formularios de edición del usuario
    const contenedor = document.querySelector('.contenedor-cuenta');
    if (contenedor) {
        const userInfo = document.createElement('div');
        userInfo.className = 'formulario';
        userInfo.id = 'user-info';
        userInfo.innerHTML = `
            <h2>Mi Cuenta</h2>
            
            <!-- Sección: Cambiar Nombre de Usuario -->
            <div class="seccion-edicion" id="seccion-username">
                <h3>Cambiar Nombre de Usuario</h3>
                <div class="grupo-formulario">
                    <label>Usuario actual:</label>
                    <p style="font-size: 1.1em; font-weight: bold; margin: 5px 0;">${user.username}</p>
                </div>
                <div class="grupo-formulario">
                    <label for="new_username">Nuevo nombre de usuario:</label>
                    <input type="text" id="new_username" placeholder="Mínimo 5 caracteres">
                </div>
                <div class="grupo-formulario">
                    <label for="password_username">Contraseña actual:</label>
                    <input type="password" id="password_username" placeholder="Confirma con tu contraseña">
                </div>
                <button type="button" onclick="actualizarUsername()" class="btn-actualizar">Actualizar Usuario</button>
                <div class="message-small" id="message-username"></div>
            </div>
            
            <hr style="margin: 20px 0; border: 1px solid #e0e0e0;">
            
            <!-- Sección: Cambiar Email -->
            <div class="seccion-edicion" id="seccion-email">
                <h3>Cambiar Email</h3>
                <div class="grupo-formulario">
                    <label>Email actual:</label>
                    <p style="font-size: 1.1em; font-weight: bold; margin: 5px 0;">${user.email}</p>
                </div>
                <div class="grupo-formulario">
                    <label for="new_email">Nuevo email:</label>
                    <input type="email" id="new_email" placeholder="nuevo@email.com">
                </div>
                <div class="grupo-formulario">
                    <label for="password_email">Contraseña actual:</label>
                    <input type="password" id="password_email" placeholder="Confirma con tu contraseña">
                </div>
                <button type="button" onclick="actualizarEmail()" class="btn-actualizar">Actualizar Email</button>
                <div class="message-small" id="message-email"></div>
            </div>
            
            <hr style="margin: 20px 0; border: 1px solid #e0e0e0;">
            
            <!-- Sección: Cambiar Contraseña -->
            <div class="seccion-edicion" id="seccion-password">
                <h3>Cambiar Contraseña</h3>
                <div class="grupo-formulario">
                    <label for="current_password">Contraseña actual:</label>
                    <input type="password" id="current_password" placeholder="Confirma tu contraseña actual">
                </div>
                <div class="grupo-formulario">
                    <label for="new_password">Nueva contraseña:</label>
                    <input type="password" id="new_password" placeholder="Mínimo 8 caracteres">
                </div>
                <div class="grupo-formulario">
                    <label for="confirm_new_password">Confirmar nueva contraseña:</label>
                    <input type="password" id="confirm_new_password" placeholder="Repite la nueva contraseña">
                </div>
                <button type="button" onclick="actualizarPassword()" class="btn-actualizar">Actualizar Contraseña</button>
                <div class="message-small" id="message-password"></div>
            </div>
            
            <hr style="margin: 20px 0; border: 1px solid #e0e0e0;">
            
            <button type="button" onclick="logout()" style="background-color: #f44336; margin-top: 20px; width: 100%;">Cerrar Sesión</button>
        `;
        contenedor.insertBefore(userInfo, contenedor.firstChild);
    }
}

function mostrarFormulariosLogin() {
    // Asegurar que los formularios estén visibles
    const pestanasFormulario = document.querySelector('.pestanas-formulario');
    if (pestanasFormulario) pestanasFormulario.style.display = 'flex';
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) userInfo.remove();
}

// =============================
// ACTUALIZACIÓN DE DATOS DEL USUARIO
// =============================

async function actualizarUsername() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const newUsername = document.getElementById('new_username').value;
    const password = document.getElementById('password_username').value;
    const messageDiv = document.getElementById('message-username');

    messageDiv.textContent = '';
    messageDiv.style.color = '';

    if (!newUsername || !password) {
        messageDiv.textContent = 'Por favor completa todos los campos';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_URL}?path=auth/update-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: newUsername, password: password })
        });

        const result = await response.json();
        
        if (result && result.success) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Limpiar campos
            document.getElementById('new_username').value = '';
            document.getElementById('password_username').value = '';
            // Recargar para mostrar el nuevo username
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            messageDiv.textContent = result.message || 'Error al actualizar';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        messageDiv.textContent = 'Error de conexión: ' + error.message;
        messageDiv.style.color = 'red';
    }
}

async function actualizarEmail() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const newEmail = document.getElementById('new_email').value;
    const password = document.getElementById('password_email').value;
    const messageDiv = document.getElementById('message-email');

    messageDiv.textContent = '';
    messageDiv.style.color = '';

    if (!newEmail || !password) {
        messageDiv.textContent = 'Por favor completa todos los campos';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_URL}?path=auth/update-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: newEmail, password: password })
        });

        const result = await response.json();
        
        if (result && result.success) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Limpiar campos
            document.getElementById('new_email').value = '';
            document.getElementById('password_email').value = '';
            // Recargar para mostrar el nuevo email
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            messageDiv.textContent = result.message || 'Error al actualizar';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error al actualizar email:', error);
        messageDiv.textContent = 'Error de conexión: ' + error.message;
        messageDiv.style.color = 'red';
    }
}

async function actualizarPassword() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_new_password').value;
    const messageDiv = document.getElementById('message-password');

    messageDiv.textContent = '';
    messageDiv.style.color = '';

    if (!currentPassword || !newPassword || !confirmPassword) {
        messageDiv.textContent = 'Por favor completa todos los campos';
        messageDiv.style.color = 'red';
        return;
    }

    if (newPassword !== confirmPassword) {
        messageDiv.textContent = 'Las contraseñas no coinciden';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`${API_URL}?path=auth/update-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password: currentPassword, newPassword: newPassword })
        });

        const result = await response.json();
        
        if (result && result.success) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Limpiar campos
            document.getElementById('current_password').value = '';
            document.getElementById('new_password').value = '';
            document.getElementById('confirm_new_password').value = '';
        } else {
            messageDiv.textContent = result.message || 'Error al actualizar';
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        messageDiv.textContent = 'Error de conexión: ' + error.message;
        messageDiv.style.color = 'red';
    }
}

async function register() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php'; 

    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const messageDiv = document.getElementById('message');

    // Limpiar mensaje anterior
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    try {
        console.log('Enviando datos de registro:', { username, email, password: '***' });
        
        const response = await fetch(`${API_URL}?path=auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Resultado:', result);

        if (result.success) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Limpiar formulario si el registro fue exitoso
            document.getElementById('register_username').value = '';
            document.getElementById('register_email').value = '';
            document.getElementById('register_password').value = '';
            // Redirigir al formulario de login después de un breve delay
            setTimeout(() => {
                mostrarFormulario('login');
            }, 1500);
        } else {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error en registro:', error);
        messageDiv.textContent = 'Error de conexión: ' + error.message;
        messageDiv.style.color = 'red';
    }
}


 // =============================
 // NAVEGACIÓN ENTRE MODOS DE JUEGO
 // =============================

function mostrarModosJuego() {
    document.getElementById('contenido-bienvenida').style.display = 'none';
    document.getElementById('modos-juego').style.display = 'block';
}


function volverInicio() {
    document.getElementById('contenido-bienvenida').style.display = 'block';
    document.getElementById('modos-juego').style.display = 'none';
}


function seleccionarModo(modo) {
    if (modo === 'game') {
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/modes/game.html';
    } else if (modo === 'tracing') {
        window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/modes/modoSeguimiento.html';
    }
}



