## Draftosaurus (UTU 2025) – Documentación del Proyecto

### Resumen

Aplicación web para registrar partidas del juego Draftosaurus y un modo de seguimiento. Incluye:
- Frontend estático (HTML/CSS/JS)
- API simple en PHP (endpoints para autenticación y partidas)
- Persistencia en MySQL (tablas `users` y `partidas`)


### Estructura del proyecto

```
unido/
  api/v1/                 # Endpoints PHP de la API
    partidas.php          # Guardar/Listar partidas (requiere sesión)
    user_access.php       # Login y Registro
  inc/
    config/
      conectionDB.php     # Conexión MySQL (lee inc/config/config)
      config              # JSON con credenciales de DB
    templates/
      header.php, nav.php # Layouts comunes
  assets/
    js/script.js          # Login/Registro + navegación
    js/scriptSeguimiento.js # Lógica tablero, rondas y persistencia
    css/...               # Estilos
  src/                    # Lógica de dominio y acceso a datos
    controllers/
      AuthController.php
      PartidaController.php
    services/
      AuthService.php
      PartidaService.php
    repositories/
      UserRepository.php
      PartidaRepository.php
  OTROS/
    seguimientosql.sql    # Esquema SQL (users, partidas)
  index.php               # Home
```


### Requisitos

- PHP 8.x con extensiones mysqli y json
- Servidor web (Apache/Nginx) o PHP built-in server
- MySQL 8.x


### Instalación y configuración

1) Base de datos
- Crear la base y tablas ejecutando `OTROS/seguimientosql.sql` en MySQL.
- Este script define:
  - `users(user_id, username, email, password_hash, created_at, updated_at)`
  - `partidas(id, user_id, game_id, cant_jugadores, cant_rondas, datos, fecha)` con FK a `users`.

2) Configurar conexión a MySQL
- Editar `inc/config/config` con el siguiente formato JSON:
```
{
  "conectionDB": {
    "server": "localhost",
    "user": "usuario_mysql",
    "password": "clave_mysql",
    "database": "prueba",
    "port": 3306
  }
}
```

3) Servir la app
- Opción A: Apache/Nginx apuntando al directorio `unido/`.
- Opción B: PHP server de desarrollo:
  - `cd unido`
  - `php -S localhost:8000`


### Autenticación y sesión

- Al hacer login exitoso, el backend guarda `$_SESSION['user_id']`.
- Los endpoints de partidas requieren sesión (usuario logueado).
- CORS/cookies: Si front y API están en dominios/puertos distintos, configurar `fetch` con `credentials: 'include'` y ajustar encabezados CORS en la API. En este proyecto se usa el mismo host por simplicidad.


### Endpoints API

- Base: `api/v1/`

1) Registro
- `POST user_access.php?action=register`
- Body JSON: `{ "username": string, "email": string, "password": string }`
- Respuesta 201 (éxito):
```
{ "success": true, "message": "Usuario creado exitosamente.", "user": { "id": number, "username": string, "email": string } }
```

2) Login
- `POST user_access.php?action=login`
- Body JSON: `{ "identifier": string, "password": string }`  // identifier puede ser username o email
- Respuesta 200 (éxito):
```
{ "success": true, "message": "Login exitoso.", "user": { "id": number, "username": string, "email": string } }
```
  - En éxito, se setea `$_SESSION['user_id']`.

3) Guardar partida
- `POST partidas.php?action=guardar`
- Requiere sesión
- Body JSON:
```
{
  "cantJugadores": number,
  "cantRondas": number,
  "puntajesPorRonda": { "Ronda 1": number, ... },
  "estado": { "Ronda 1": { RECINTO: [ids] ... } ... },
  "kingPorRonda": { "Ronda 1": true|false, ... },
  "game_id": number | null  // opcional
}
```
- Respuesta:
```
{ "success": true, "message": "Partida guardada correctamente" }
```

4) Listar partidas del usuario
- `GET partidas.php?action=listar`
- Requiere sesión
- Respuesta:
```
{
  "success": true,
  "data": [
    {
      "id": number,
      "game_id": number|null,
      "cant_jugadores": number,
      "cant_rondas": number,
      "datos": { ... JSON con puntajesPorRonda, estado, kingPorRonda ... },
      "fecha": "YYYY-MM-DD HH:MM:SS"
    }, ...
  ]
}
```


### Backend (capas)

- `AuthController.php`: recibe requests de registro/login, valida JSON, retorna códigos HTTP correctos. En login, setea `$_SESSION['user_id']`.
- `AuthService.php`: valida credenciales, reglas básicas (email válido, min length, etc.), y delega a `UserRepository`.
- `UserRepository.php`: CRUD de usuarios. Usa consultas preparadas. `createUser` devuelve los datos del usuario insertado.
- `PartidaController.php`: en cada acción verifica sesión. Usa `PartidaService` singleton.
- `PartidaService.php`: compone el JSON `datos` y delega a `PartidaRepository`.
- `PartidaRepository.php`: inserta y lista `partidas`. Si viene `game_id`, lo guarda; si no, inserta sin ese campo.


### Archivos PHP (detallado)

- `api/v1/user_access.php`
  - Inicia sesión (`session_start()`), setea headers JSON/CORS básicos.
  - Rutea por `action=login|register` hacia `AuthController`.

- `api/v1/partidas.php`
  - Inicia sesión, setea headers JSON/CORS básicos.
  - Rutea por `action=guardar|listar` hacia `PartidaController`.

- `inc/config/conectionDB.php`
  - Singleton `conectionDB`.
  - Lee `inc/config/config` (JSON) y crea conexión `mysqli` con charset `utf8`.
  - `getInstance()->getConnection()` expone `mysqli` compartido.

- `src/controllers/AuthController.php`
  - `register()`: parsea JSON, valida campos presentes, mapea errores a HTTP (400/409/500), devuelve respuesta de `AuthService`.
  - `login()`: parsea JSON, permite `identifier` ser username o email, mapea errores a HTTP (400/401/500). En éxito setea `$_SESSION['user_id']`.

- `src/services/AuthService.php`
  - Singleton basado en propiedad estática.
  - `register(username, email, password)`: valida presencia, formato email, longitudes mínimas, unicidad en DB; hashea password; inserta usuario y retorna datos.
  - `login(identifier, password)`: resuelve por username (o email si `identifier` tiene formato email), verifica `password_hash` con `password_verify`, y retorna datos de usuario.

- `src/repositories/UserRepository.php`
  - `findByUsername`, `findByEmail`, `findByUsernameOrEmail`: devuelven `user_id, username, email, password_hash`.
  - `createUser(username, email, password_hash)`: inserta y retorna `{ user_id, username, email }` del nuevo registro.

- `src/controllers/PartidaController.php`
  - `guardar()`: exige `$_SESSION['user_id']`, compone `$input` del body y llama a `PartidaService->guardarPartida`.
  - `listar()`: exige `$_SESSION['user_id']`, retorna `data` con partidas del usuario.

- `src/services/PartidaService.php`
  - `guardarPartida(userId, data)`: arma JSON `datos` con `puntajesPorRonda`, `estado`, y si viene, `kingPorRonda`. Pasa además `cantJugadores`, `cantRondas` y opcional `game_id` al repositorio.
  - `listarPartidas(userId)`: lista desde el repositorio.

- `src/repositories/PartidaRepository.php`
  - `insertarPartida(user_id, cant_jugadores, cant_rondas, datos_json, game_id?)`: inserta con o sin `game_id` según venga en el payload.
  - `obtenerPartidasPorUsuario(user_id)`: retorna `id, game_id, cant_jugadores, cant_rondas, datos(JSON->array), fecha` ordenado por fecha desc.

- `inc/templates/header.php`, `inc/templates/nav.php`
  - Componentes de layout. `nav.php` incluye link a `index.php`, `howPlay.php` y `user_access.php`.


### Frontend – vistas clave

- `assets/js/script.js`
  - `mostrarFormulario(tipo)`: alterna pestañas login/registro.
  - `login()`: POST `api/v1/user_access.php?action=login` con `{ identifier, password }`. Si `success`, redirige a `index.php`.
  - `register()`: POST `api/v1/user_access.php?action=register` con `{ username, email, password }`.
  - Navegación entre modos (`seleccionarModo`).

- `assets/js/scriptSeguimiento.js`
  - Gestión de rondas y puntajes: `puntajesPorRonda`, `estado`, `kingPorRonda`.
  - Drag & drop de recintos y slots. Reglas básicas de colocación (bosque igual, pradera diferente, etc.).
  - Cálculo de puntos por recinto; “Rey de la selva” suma +7 si hay 1 pieza en `KING` y `kingPorRonda["Ronda X"]` es true.
  - Persistencia:
    - Guardar partida: `POST ../../api/v1/partidas.php?action=guardar` con payload completo.
    - Listar partidas: `GET ../../api/v1/partidas.php?action=listar`.
    - Carga una partida para reconstruir el estado del tablero y UI.
  - Robustez de fetch: valida `res.ok` y registra cuerpo de error para evitar parsear HTML como JSON.


### Esquema de datos `partidas.datos` (JSON)

Ejemplo de `datos` guardado:
```
{
  "puntajesPorRonda": {
    "Ronda 1": 12,
    "Ronda 2": 8
  },
  "estado": {
    "Ronda 1": {
      "KING": ["tRex_copy_1"],
      "RIVER": ["SPECIE_1_copy_1", null, ...]
    }
  },
  "kingPorRonda": {
    "Ronda 1": true,
    "Ronda 2": false
  }
}
```

