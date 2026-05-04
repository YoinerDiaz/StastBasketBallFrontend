import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Ajusta según tu backend

export const gameControlService = {
    // Datos generales del juego (Score, Equipos, Periodo)
    getGame: async (gameId) => {
        const response = await axios.get(`${API_URL}/games/${gameId}`);
        return response.data;
    },

    // Lista de jugadores asociados al partido
    getPlayersInGame: async (gameId) => {
        const response = await axios.get(`${API_URL}/games-players/game/${gameId}`);
        return response.data;
    },

    // Jugadores en cancha (Quintetos iniciales/actuales)
    getLineup: async (gameId, teamId) => {
        const response = await axios.get(`${API_URL}/games/${gameId}/lineup/${teamId}`);
        return response.data;
    },
/**
     * POST /games/{game_id}/teams/{team_id}/starters
     * Envía los 5 elegidos a la base de datos
     */
    setStarters: async (gameId, teamId, playerIds) => {
        try {
            // Enviamos el array de IDs directamente como espera tu FastAPI
            const response = await axios.post(
                `${API_URL}/games/${gameId}/teams/${teamId}/starters`, 
                playerIds
            );
            return response.data;
        } catch (error) {
            console.error("Error en setStarters service:", error);
            throw error; // Lo lanzamos para que el componente lo maneje
        }
    }

};