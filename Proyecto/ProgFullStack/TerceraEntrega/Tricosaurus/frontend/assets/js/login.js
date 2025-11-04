'use strict';

// Función para cambiar entre formularios de login y registro
function mostrarFormulario(tipo) {
    console.log('Cambiando a formulario:', tipo);
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

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const checkbox = input.parentElement.querySelector('input[type="checkbox"]');
    
    if (checkbox.checked) {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Función de inicio de sesión
async function login() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const messageDiv = document.getElementById('message');
    
    try {
        const identifier = document.getElementById('login_identifier').value;
        const password = document.getElementById('login_password').value;

        if (!identifier || !password) {
            showMessage('Por favor complete todos los campos', 'error');
            return;
        }

        const response = await fetch(`${API_URL}?path=auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ identifier, password })
        });

        // Leer la respuesta como texto primero
        const text = await response.text();
        
        // Verificar el status de la respuesta
        if (!response.ok) {
            console.error('Error HTTP:', response.status, text);
            // Intentar parsear el error como JSON para obtener un mensaje más descriptivo
            try {
                const errorData = JSON.parse(text);
                showMessage(errorData.message || `Error del servidor (${response.status})`, 'error');
            } catch {
                showMessage(`Error del servidor (${response.status})`, 'error');
            }
            return;
        }

        // Intentar parsear como JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error('Error al parsear JSON:', error, 'Texto recibido:', text);
            showMessage('Error: respuesta del servidor no válida', 'error');
            return;
        }

        if (data.success) {
            console.log('Login exitoso:', data);
            showMessage('Inicio de sesión exitoso', 'success');

            // Guardar el nuevo token y datos del usuario
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Esperar un momento para asegurar que el mensaje se muestre
            setTimeout(() => {
                console.log('Redirigiendo al index...');
                window.location.href = 'http://localhost:8012/Tricosaurus/frontend/index.html';
            }, 800);
        } else {
            showMessage(data.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showMessage('Error al conectar con el servidor', 'error');
    }
}

// Función de registro
async function register() {
    const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
    const messageDiv = document.getElementById('message');

    try {
        const username = document.getElementById('register_username').value;
        const email = document.getElementById('register_email').value;
        const password = document.getElementById('register_password').value;

        if (!username || !email || !password) {
            showMessage('Por favor complete todos los campos', 'error');
            return;
        }

        const response = await fetch(`${API_URL}?path=auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });

        // Leer la respuesta como texto primero
        const text = await response.text();
        
        // Verificar el status de la respuesta
        if (!response.ok) {
            console.error('Error HTTP:', response.status, text);
            // Intentar parsear el error como JSON para obtener un mensaje más descriptivo
            try {
                const errorData = JSON.parse(text);
                showMessage(errorData.message || `Error del servidor (${response.status})`, 'error');
            } catch {
                showMessage(`Error del servidor (${response.status})`, 'error');
            }
            return;
        }

        // Intentar parsear como JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error('Error al parsear JSON:', error, 'Texto recibido:', text);
            showMessage('Error: respuesta del servidor no válida', 'error');
            return;
        }

        if (data.success) {
            showMessage('Registro exitoso', 'success');
            // Limpiar campos
            document.getElementById('register_username').value = '';
            document.getElementById('register_email').value = '';
            document.getElementById('register_password').value = '';
            // Cambiar a formulario de login después de un breve delay
            setTimeout(() => mostrarFormulario('login'), 1500);
        } else {
            showMessage(data.message || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage('Error al conectar con el servidor', 'error');
    }
}

// Función para mostrar mensajes
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = type === 'error' ? 'red' : 'green';
        messageDiv.style.display = 'block';
    }
}

// Inicializar los event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando formularios de acceso...');

    // Event listeners para los botones de mostrar/ocultar contraseña
    const passwordToggles = document.querySelectorAll('[id^="show_password_"]');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const inputId = this.id.replace('show_password_', '');
            togglePassword(inputId);
        });
    });
});