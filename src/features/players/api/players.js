import client from "../../../api/client";

// GET /players/
export const getPlayers = async () => {
  const res = await client.get("/players/");
  return res.data;
};

// POST /players/
export const createPlayer = async (data) => {
  const res = await client.post("/players/", data);
  return res.data;
};

// GET /players/{id}
export const getPlayer = async (id) => {
  const res = await client.get(`/players/${id}`);
  return res.data;
};

// PUT /players/{id}
export const updatePlayer = async (id, data) => {
  const res = await client.put(`/players/${id}`, data);
  return res.data;
};

// DELETE /players/{id}
export const deletePlayer = async (id) => {
  const res = await client.delete(`/players/${id}`);
  return res.data;
};

// GET /players/team/{id}
export const getPlayersByTeam = async (id) => {
  const res = await client.get(`/players/team/${id}`);
  return res.data;
};