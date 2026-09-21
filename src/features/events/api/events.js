import client from "../../../api/client";

/**
 * Registrar un nuevo evento en el partido (ej. tiro encestado, falta, asistencia)
 * @param {Object} data - Datos del evento (fk_id_game_player, event_type, etc.)
 */
export const createEvent = async (data) => {
  const response = await client.post("/events/", data);
  return response.data;
};

/**
 * Obtener todos los eventos de un jugador en un partido específico
 * @param {number} gamePlayerId - ID de la relación game_player (gp_id)
 */
export const getEventsByGamePlayer = async (gamePlayerId) => {
  const response = await client.get(`/events/game-player/${gamePlayerId}`);
  return response.data;
};

/**
 * Eliminar un evento por su ID (ej. función de deshacer jugada)
 * @param {number} eventId - ID del evento a eliminar
 */
export const deleteEvent = async (eventId) => {
  const response = await client.delete(`/events/${eventId}`);
  return response.data;
};