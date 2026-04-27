import client from "../../../api/client";

// GET /teams/
export const getTeams = async () => {
  const res = await client.get("/teams/");
  return res.data;
};

// POST /teams/
export const createTeam = async (data) => {
  const res = await client.post("/teams/", data);
  return res.data;
};

// GET /teams/{id}
export const getTeam = async (id) => {
  const res = await client.get(`/teams/${id}`);
  return res.data;
};

// PUT /teams/{id}
export const updateTeam = async (id, data) => {
  const res = await client.put(`/teams/${id}`, data);
  return res.data;
};

// DELETE /teams/{id}
export const deleteTeam = async (id) => {
  const res = await client.delete(`/teams/${id}`);
  return res.data;
};