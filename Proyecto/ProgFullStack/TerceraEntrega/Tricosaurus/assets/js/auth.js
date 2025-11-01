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

// Función para cambiar entre formulario-login y formulario-registro
function mostrarFormulario(tipo) {
    const loginForm = document.getElementById('formulario-login');
    const registroForm = document.getElementById('formulario-registro');
    const tabs = document.querySelectorAll('.tab-btn');
    
    if (tipo === 'login') {
        loginForm.style.display = 'block';
        registroForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registroForm.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Función para logeo de usuarios
async function login() {
    const API_URL = 'http://localhost:8012/Tricosaurus/api/v1/user_access.php'; 

    const identifier = document.getElementById('login_identifier').value;
    const password = document.getElementById('login_password').value;
    const messageDiv = document.getElementById('message');

    // Limpiar mensaje anterior
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    try {
        const response = await fetch(API_URL + '?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const result = await response.json();
        
        if (result && result.success) {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'green';
            // Redirigir después de un breve delay para que el usuario vea el mensaje
            setTimeout(() => {
                window.location.href = 'http://localhost:8012/Tricosaurus/index.php';
            }, 1000);
        } else {
            messageDiv.textContent = result.message;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error en login:', error);
        messageDiv.textContent = 'Error de conexión: ' + error.message;
        messageDiv.style.color = 'red';
    }
}

// Función para registro de usuarios
async function register() {
    const API_URL = 'http://localhost:8012/Tricosaurus/api/v1/user_access.php'; 

    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;
    const messageDiv = document.getElementById('message');

    // Limpiar mensaje anterior
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    try {
        console.log('Enviando datos de registro:', { username, email, password: '***' });
        
        const response = await fetch(API_URL + '?action=register', {
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
