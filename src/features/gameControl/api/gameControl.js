import client from "../../../api/client";

/**
 * Registra un evento en la mesa de control (Tiro anotado/fallado, falta, rebote, asistencia, etc.)
 */
export const recordEvent = async ({ event_type, fk_id_game_player_events, game_time_seconds }) => {
  const response = await client.post("/events/", {
    event_type,
    fk_id_game_player_events,
    game_time_seconds,
  });
  return response.data;
};

/**
 * Deshace (elimina) un evento por su ID y recalcula marcador y estadísticas
 */
export const deleteEvent = async (eventId) => {
  const response = await client.delete(`/events/${eventId}`);
  return response.data;
};

/**
 * Obtiene el Box Score acumulado de todos los jugadores del partido
 */
export const getGameBoxScore = async (gameId) => {
  const response = await client.get(`/stats/game/${gameId}`);
  return response.data;
};

/**
 * Obtiene la lista de GamePlayers con datos de jugador, equipo y estado en cancha
 */
export const getGamePlayers = async (gameId) => {
  const response = await client.get(`/games-players/game/${gameId}`);
  return response.data;
};

/**
 * Asigna los 5 jugadores titulares de un equipo
 */
export const setTeamStarters = async ({ gameId, teamId, gamePlayerIds }) => {
  const response = await client.post(`/games/${gameId}/teams/${teamId}/starters`, gamePlayerIds);
  return response.data;
};

/**
 * Realiza una sustitución de un jugador en cancha por uno de la banca
 */
export const makeSubstitution = async ({ player_out_id, player_in_id, current_game_time }) => {
  const response = await client.patch("/games/substitution", {
    player_out_id,
    player_in_id,
    current_game_time,
  });
  return response.data;
};

/**
 * Finaliza el cuarto actual y avanza al siguiente
 */
export const endQuarter = async (gameId) => {
  const response = await client.post(`/games/${gameId}/end-quarter`);
  return response.data;
};

/**
 * Inicia el partido (cambia status a EN_PROGRESO)
 */
export const startGame = async (gameId) => {
  const response = await client.post(`/games/${gameId}/start`);
  return response.data;
};

/**
 * Finaliza el partido manualmente
 */
export const finishGame = async (gameId) => {
  const response = await client.post(`/games/${gameId}/finish`);
  return response.data;
};

/**
 * Agrega tiempo extra al partido
 */
export const addOvertime = async (gameId, overtimeSeconds = 300) => {
  const response = await client.post(`/games/${gameId}/overtime?overtime_seconds=${overtimeSeconds}`);
  return response.data;
};

/**
 * Obtiene el estado en tiempo real (marcador, faltas por equipo y cuarto)
 */
export const getLiveStatus = async (gameId) => {
  const response = await client.get(`/games/${gameId}/live-status`);
  return response.data;
};

/**
 * Obtiene los detalles del partido
 */
export const getGameDetails = async (gameId) => {
  const response = await client.get(`/games/${gameId}`);
  return response.data;
};
