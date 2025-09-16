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


    public function guardarPartida($userId, $data)
    {
        $cantJugadores = $data['cantJugadores'] ?? 2;
        $cantRondas = $data['cantRondas'] ?? 4;
        $gameId = isset($data['game_id']) ? (int)$data['game_id'] : null;
        $datos = json_encode([
            'puntajesPorRonda' => $data['puntajesPorRonda'] ?? [],
            'estado' => $data['estado'] ?? []
        ]);

        $success = $this->PartidaRepository->insertarPartida($userId, $cantJugadores, $cantRondas, $datos, $gameId);

        return $success
            ? ['success' => true, 'message' => 'Partida guardada correctamente']
            : ['success' => false, 'message' => 'Error al guardar partida'];
    }

    public function listarPartidas($userId)
    {
        return $this->PartidaRepository->obtenerPartidasPorUsuario($userId);
    }
}
