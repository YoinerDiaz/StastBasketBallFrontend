import axios from 'axios';

// Si ya tienes una instancia de axios configurada en otro lado, impórtala. 
// Si no, podemos usar esta base:
const API_URL = 'http://localhost:8000'; // Ajusta a tu puerto de FastAPI

export const eventService = {
    /**
     * POST /events/
     * Crea un nuevo evento (canasta, falta, etc.)
     */
    createEvent: async (eventData) => {
        const response = await axios.post(`${API_URL}/events/`, eventData);
        return response.data;
    },

    /**
     * GET /events/game-player/{gp_id}
     * Obtiene todos los eventos de un jugador específico en este partido
     */
    getEventsByPlayer: async (gpId) => {
        const response = await axios.get(`${API_URL}/events/game-player/${gpId}`);
        return response.data;
    },

    /**
     * DELETE /events/{event_id}
     * Borra un evento (útil para el botón de "deshacer" si el anotador se equivoca)
     */
    deleteEvent: async (eventId) => {
        const response = await axios.delete(`${API_URL}/events/${eventId}`);
        return response.data;
    }
};