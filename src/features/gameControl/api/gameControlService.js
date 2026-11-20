import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const gameControlService = {
    // Datos generales del juego (Score, Equipos, Periodo)
    getGame: async (gameId) => {
        try {
            const response = await axios.get(`${API_URL}/games/${gameId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener datos del juego ${gameId}:`, error);
            throw error;
        }
    },

    // Lista de jugadores asociados al partido
    getPlayersInGame: async (gameId) => {
        try {
            const response = await axios.get(`${API_URL}/games-players/game/${gameId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener jugadores del juego ${gameId}:`, error);
            throw error;
        }
    },

    // Jugadores en cancha (Quintetos iniciales/actuales)
    getLineup: async (gameId, teamId) => {
        try {
            const response = await axios.get(`${API_URL}/games/${gameId}/lineup/${teamId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener la alineación del equipo ${teamId}:`, error);
            throw error;
        }
    },

    // Enviar los 5 elegidos para un equipo
    setStarters: async (gameId, teamId, playerIds) => {
        try {
        // 1. Asegurar que enviamos un array de enteros simples
        const numericIds = playerIds.map((id) => Number(id));

        // 2. Enviar el array directamente en el cuerpo (body)
        const response = await axios.post(
            `${API_URL}/games/${gameId}/teams/${teamId}/starters`,
            numericIds
        );
        
        return response.data;
        } catch (error) {
        console.error("Error al guardar titulares:", error.response?.data || error);
        throw error;
        }
    },

    // ENDPOINT CENTRALIZADO DE EVENTOS
    createEvent: async (eventData) => {
        try {
            const response = await axios.post(`${API_URL}/events/`, eventData);
            return response.data;
        } catch (error) {
            console.error("Error al crear evento en BD:", error);
            throw error;
        }
    },

    // Métodos helper para registro rápido de estadísticas con los enums requeridos por el backend
    registerPoints: async (idGamePlayer, points, quarter = 1) => {
        const eventType = points === 3 ? 'three_made' : points === 2 ? 'two_made' : 'free_made';
        return gameControlService.createEvent({
            fk_id_game_player_events: Number(idGamePlayer),
            event_type: eventType,
            quarter: Number(quarter)
        });
    },

    registerFoul: async (idGamePlayer, foulType = 'personal', quarter = 1) => {
        return gameControlService.createEvent({
            fk_id_game_player_events: Number(idGamePlayer),
            event_type: 'foul',
            quarter: Number(quarter)
        });
    },

    // Actualización completa o parcial del juego (PUT)
    updateGame: async (gameId, gameData) => {
        try {
            const response = await axios.put(`${API_URL}/games/${gameId}`, gameData);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar juego ${gameId}:`, error.response?.data || error);
            throw error;
        }
    },

    // Actualizar estado del juego (SCHEDULED, IN_PROGRESS, FINISHED)
    updateGameStatus: async (gameId, status) => {
        try {
            const response = await axios.put(`${API_URL}/games/${gameId}`, {
                status: String(status).toUpperCase()
            });
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar estado del juego ${gameId}:`, error.response?.data || error);
            throw error;
        }
    },

    // Actualizar el cuarto actual
    updateQuarter: async (gameId, quarter) => {
        try {
            const response = await axios.put(`${API_URL}/games/${gameId}`, {
                current_quarter: Number(quarter)
            });
            return response.data;
        } catch (error) {
            console.error("Error al actualizar el periodo:", error.response?.data || error);
            throw error;
        }
    },

    // Avanzar cuarto en backend (calcula minutos jugados y resetea reloj a 600)
    advanceQuarter: async (gameId) => {
        try {
            const response = await axios.post(`${API_URL}/games/${gameId}/end-quarter`);
            return response.data;
        } catch (error) {
            console.error("Error al avanzar periodo en backend:", error.response?.data || error);
            throw error;
        }
    },

    // Iniciar tiempo extra
    startOvertime: async (gameId, overtimeNumber = 1) => {
        try {
            const response = await axios.post(`${API_URL}/games/${gameId}/overtime`, {
                overtime_number: overtimeNumber
            });
            return response.data;
        } catch (error) {
            console.error("Error al iniciar tiempo extra:", error.response?.data || error);
            throw error;
        }
    },

    // Actualizar tiempo del juego (timer)
    updateGameTime: async (gameId, timeInSeconds, isPaused = true) => {
        try {
            const response = await axios.patch(`${API_URL}/games/${gameId}/timer`, {
                time_remaining: Number(timeInSeconds),
                is_paused: Boolean(isPaused)
            });
            return response.data;
        } catch (error) {
            console.error("Error al actualizar tiempo de juego:", error.response?.data || error);
            throw error;
        }
    },

    // Finalizar partido
    finishGame: async (gameId, summaryData = {}) => {
        try {
            const payload = {
                ...summaryData,
                status: 'FINISHED'
            };
            const response = await axios.put(`${API_URL}/games/${gameId}`, payload);
            return response.data;
        } catch (error) {
            console.error("Error al finalizar partido:", error.response?.data || error);
            throw error;
        }
    },

    // Finalizar partido (alias)
    endGame: async (gameId) => {
        return gameControlService.finishGame(gameId, { status: 'FINISHED' });
    }, // Comma added here

  // Módulo de Sustitución Manual
  substituteGame: async (gameId, playerOutId, playerInId, timeLeft) => {
    try {
      const response = await axios.patch(`${API_URL}/games/substitution`, {
        player_out_id: Number(playerOutId),
        player_in_id: Number(playerInId),
        current_game_time: Number(timeLeft)
      });
      return response.data;
    } catch (error) {
      console.error('Error efectuando cambio de jugador:', error);
      console.error('Detalles 422 de FastAPI:', error.response?.data);
      throw error;
    }
  },
};

export default gameControlService;