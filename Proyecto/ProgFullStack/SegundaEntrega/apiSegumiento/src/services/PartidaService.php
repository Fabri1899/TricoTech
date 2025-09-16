<?php
require_once __DIR__ . '/../repositories/PartidaRepository.php';


class PartidaService {
    private $repo;

    public function __construct() {
        $this->repo = new PartidaRepository();
    }

    public function guardarPartida($userId, $data) {
        $cantJugadores = $data['cantJugadores'] ?? 2;
        $cantRondas = $data['cantRondas'] ?? 4;
        $datos = json_encode([
            'puntajesPorRonda' => $data['puntajesPorRonda'] ?? [],
            'estado' => $data['estado'] ?? []
        ]);

        $success = $this->repo->insertarPartida($userId, $cantJugadores, $cantRondas, $datos);

        return $success
            ? ['success' => true, 'message' => 'Partida guardada correctamente']
            : ['success' => false, 'message' => 'Error al guardar partida'];
    }

    public function listarPartidas($userId) {
        return $this->repo->obtenerPartidasPorUsuario($userId);
    }
}
