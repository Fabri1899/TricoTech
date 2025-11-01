<?php


class PartidaService
{
    private static ?PartidaService $instance = null;
    private ?PartidaRepository $PartidaRepository = null;

    private function __construct()
    {
        $this->PartidaRepository = PartidaRepository::getInstance();
    }

    public static function getInstance(): PartidaService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Guarda una partida con datos estructurados en lugar de JSON
     */
    public function guardarPartida($userId, $data)
    {
        $cantJugadores = $data['cantJugadores'] ?? 2;
        $cantRondas = $data['cantRondas'] ?? 4;
        $gameId = isset($data['game_id']) ? (int)$data['game_id'] : null;
        
        // Procesar datos de rondas
        $rondasData = $this->procesarDatosRondas($data);
        
        $partidaId = $this->PartidaRepository->insertarPartida($userId, $cantJugadores, $cantRondas, $rondasData, $gameId);

        return $partidaId
            ? ['success' => true, 'message' => 'Partida guardada correctamente', 'partida_id' => $partidaId]
            : ['success' => false, 'message' => 'Error al guardar partida'];
    }

    /**
     * Procesa los datos de las rondas para el nuevo formato
     */
    private function procesarDatosRondas($data)
    {
        $rondasData = [];
        
        // Procesar puntajes por ronda
        $puntajesPorRonda = $data['puntajesPorRonda'] ?? [];
        $estadoPorRonda = $data['estado'] ?? [];
        $kingPorRonda = $data['kingPorRonda'] ?? [];
        
        // Extraer números de ronda de las claves
        $numerosRonda = [];
        foreach (array_keys($puntajesPorRonda) as $rondaKey) {
            if (preg_match('/Ronda (\d+)/', $rondaKey, $matches)) {
                $numerosRonda[] = (int)$matches[1];
            }
        }
        
        // Procesar cada ronda
        foreach ($numerosRonda as $numeroRonda) {
            $rondaKey = "Ronda " . $numeroRonda;
            
            $rondasData[$numeroRonda] = [
                'puntaje' => $puntajesPorRonda[$rondaKey] ?? 0,
                'esRey' => $kingPorRonda[$rondaKey] ?? false,
                'posiciones' => $this->procesarPosicionesRonda($estadoPorRonda[$rondaKey] ?? [])
            ];
        }
        
        return $rondasData;
    }

    /**
     * Procesa las posiciones de dinosaurios para una ronda específica
     */
    private function procesarPosicionesRonda($estadoRonda)
    {
        $posiciones = [];
        
        foreach ($estadoRonda as $recinto => $slots) {
            if (is_array($slots)) {
                $posiciones[$recinto] = [];
                foreach ($slots as $index => $dinosaurioId) {
                    if ($dinosaurioId !== null && $dinosaurioId !== '') {
                        $posiciones[$recinto][$index] = $dinosaurioId;
                    }
                }
            }
        }
        
        return $posiciones;
    }

    /**
     * Lista las partidas de un usuario
     */
    public function listarPartidas($userId)
    {
        return $this->PartidaRepository->obtenerPartidasPorUsuario($userId);
    }

    /**
     * Obtiene una partida específica por ID
     */
    public function obtenerPartida($partidaId, $userId)
    {
        return $this->PartidaRepository->obtenerPartidaPorId($partidaId, $userId);
    }

    /**
     * Actualiza una partida existente
     */
    public function actualizarPartida($partidaId, $userId, $data)
    {
        // Primero eliminar datos existentes
        $this->eliminarDatosPartida($partidaId);
        
        // Luego insertar nuevos datos
        $cantJugadores = $data['cantJugadores'] ?? 2;
        $cantRondas = $data['cantRondas'] ?? 4;
        $rondasData = $this->procesarDatosRondas($data);
        
        $success = $this->PartidaRepository->insertarPartida($userId, $cantJugadores, $cantRondas, $rondasData, null);
        
        return $success
            ? ['success' => true, 'message' => 'Partida actualizada correctamente']
            : ['success' => false, 'message' => 'Error al actualizar partida'];
    }

    /**
     * Elimina los datos relacionados de una partida
     */
    private function eliminarDatosPartida($partidaId)
    {
        // Esta función debería implementarse en el repository
        // Por ahora, se puede manejar eliminando y recreando la partida
        return true;
    }
}
