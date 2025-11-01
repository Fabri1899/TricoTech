# Diagrama del Nuevo Esquema de Base de Datos

## Esquema Relacional Normalizado

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ user_id (PK)    │
│ username        │
│ email           │
│ password_hash   │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    PARTIDAS     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ game_id         │
│ cant_jugadores  │
│ cant_rondas     │
│ fecha           │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ PARTIDA_RONDAS │
├─────────────────┤
│ id (PK)         │
│ partida_id (FK) │
│ numero_ronda    │
│ puntaje         │
│ es_rey          │
│ fecha_creacion  │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│ POSICIONES_DINOSAURIOS │
├─────────────────────┤
│ id (PK)             │
│ partida_id (FK)     │
│ numero_ronda        │
│ recinto             │
│ posicion_slot       │
│ dinosaurio_id       │
│ fecha_creacion      │
└─────────────────────┘
```

## Flujo de Datos

### Guardado de Partida
1. **Frontend** → Envía datos en formato JSON original
2. **PartidaService** → Procesa y estructura los datos
3. **PartidaRepository** → Inserta en tablas separadas:
   - `partidas`: Información básica
   - `partida_rondas`: Puntajes y estado del rey
   - `posiciones_dinosaurios`: Posiciones específicas

### Carga de Partida
1. **PartidaRepository** → Consulta las tablas separadas
2. **PartidaRepository** → Reconstruye formato JSON para compatibilidad
3. **Frontend** → Recibe datos en el mismo formato que antes

## Ventajas del Nuevo Diseño

### Antes (JSON)
```json
{
  "puntajesPorRonda": {"Ronda 1": 12, "Ronda 2": 8},
  "estado": {
    "Ronda 1": {
      "KING": ["tRex_copy_1"],
      "RIVER": ["SPECIE_1_copy_1", null, ...]
    }
  },
  "kingPorRonda": {"Ronda 1": true, "Ronda 2": false}
}
```

### Después (Tablas Normalizadas)
- **partida_rondas**: Cada fila = una ronda con su puntaje y estado del rey
- **posiciones_dinosaurios**: Cada fila = una posición específica de dinosaurio

### Beneficios
1. **Integridad**: Tipos de datos específicos (INT, BOOLEAN, VARCHAR)
2. **Consultas**: SQL directo sin parsear JSON
3. **Índices**: Optimización de consultas por ronda, recinto, etc.
4. **Escalabilidad**: Mejor rendimiento con muchas partidas
5. **Mantenimiento**: Más fácil agregar campos o validaciones
