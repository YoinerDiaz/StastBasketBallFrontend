import client from "../../../api/client";

export const createGame = async (data) => {
  const payload = {
    location: data.location,
    date: data.date,
    home_team: data.homeTeamId,
    away_team: data.awayTeamId,
    players: {
      home: data.homePlayers,
      away: data.awayPlayers,
    },
  };

  const response = await client.post("/games/with-players", payload);
  return response.data;
};

export const getGames = async () => {
  const response = await client.get("/games/");
  return response.data;
};

export const getGame = async (gameId) => {
  const response = await client.get(`/games/${gameId}`);
  return response.data;
};

export const updateGame = async (gameId, data) => {
  const response = await client.put(`/games/${gameId}`, data);
  return response.data;
};

export const deleteGame = async (gameId) => {
  const response = await client.delete(`/games/${gameId}`);
  return response.data;
};

export const setStarters = async ({ gameId, teamId, playerIds }) => {
  const response = await client.post(`/games/${gameId}/teams/${teamId}/starters`, playerIds);
  return response.data;
};

export const makeSubstitution = async ({ player_out_id, player_in_id, current_game_time }) => {
  const response = await client.patch("/games/substitution", {
    player_out_id,
    player_in_id,
    current_game_time,
  });
  return response.data;
};

export const getLineup = async (gameId, teamId) => {
  const response = await client.get(`/games/${gameId}/lineup/${teamId}`);
  return response.data;
};

export const endQuarter = async (gameId) => {
  const response = await client.post(`/games/${gameId}/end-quarter`);
  return response.data;
};

export const getLiveStatus = async (gameId) => {
  const response = await client.get(`/games/${gameId}/live-status`);
  return response.data;
};
