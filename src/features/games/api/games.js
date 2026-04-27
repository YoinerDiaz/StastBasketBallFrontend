import client from "../../../api/client";

export const createGame = async (data) => {
  const payload = {
    location: data.location,
    date: data.date,
    home_team: data.homeTeamId,
    away_team: data.awayTeamId,
    players: {
      home: data.homePlayers, // array de IDs
      away: data.awayPlayers,
    },
  };

  const response = await client.post("/games/with-players", payload);
  return response.data;
};