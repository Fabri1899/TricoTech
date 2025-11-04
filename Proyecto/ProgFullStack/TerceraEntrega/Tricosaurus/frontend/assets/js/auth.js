'use strict';

class Auth {
    static init() {
        console.log('Inicializando Auth...');
        const userLink = document.getElementById('cuenta-link');
        if (userLink) {
            userLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.redirectToUserPage();
            });
        }
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token');
        console.log('¿Token existe?:', !!token);
        // Verificar que el token tenga un formato válido
        if (!token || typeof token !== 'string' || token.trim() === '') {
            console.log('Token inválido o vacío');
            return false;
        }
        return true;
    }

    static async redirectToUserPage() {
        const token = localStorage.getItem('token');
        console.log('Redirigiendo... ¿Token existe?:', !!token);
        
        // Si no hay token, ir directamente a login/registro
        if (!token || typeof token !== 'string' || token.trim() === '') {
            console.log('No hay token, redirigiendo a login/registro');
            window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html';
            return;
        }

        // Si hay token, verificar con el servidor si es válido
        try {
            const API_URL = 'http://localhost:8012/Tricosaurus/backend/api/index.php';
            const response = await fetch(`${API_URL}?path=auth/session`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result && result.success && result.authenticated) {
                console.log('Token válido, redirigiendo al panel de usuario');
                window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_panel.html';
            } else {
                console.log('Token inválido o expirado, limpiando y redirigiendo a login/registro');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html';
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            // En caso de error, limpiar token y redirigir a login/registro
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html';
        }
    }

    static checkAccess() {
        console.log('Verificando acceso...');
        const isInUserPanel = window.location.href.includes('user_panel.html');
        const isAuthenticated = this.isAuthenticated();
        console.log('¿En panel de usuario?:', isInUserPanel);
        console.log('¿Está autenticado?:', isAuthenticated);

        if (isInUserPanel && !isAuthenticated) {
            console.log('Redirigiendo a login porque no está autenticado');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html');
            return false;
        } else if (!isInUserPanel && !isAuthenticated) {
            // Si no está en el panel y no está autenticado, asegurarse de limpiar cualquier token inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return true;
    }

    static login(token, userData) {
        console.log('Iniciando sesión...');
        localStorage.setItem('token', token);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }

    static logout() {
        console.log('Cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('http://localhost:8012/Tricosaurus/frontend/pages/user/user_access.html');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando Auth...');
    Auth.init();
    Auth.checkAccess();
});