import client from "../../../api/client";
import { supabase } from "../../../api/supabaseClient";

export const getGames = async () => {
  const response = await client.get("/games/");
  const games = response.data || [];

  try {
    // Enriquecemos con los torneos, fases y grupos desde Supabase
    const { data: meta } = await supabase
      .from("games")
      .select(`
        id_game,
        fk_id_tournament_phase,
        fk_id_tournament_group,
        tournament_phases (
          id_phase,
          name,
          fk_id_tournament,
          tournaments (
            id_tournament,
            name
          )
        ),
        tournament_groups (
          id_group,
          name
        )
      `);

    const tMap = new Map((meta || []).map((t) => [t.id_game, t]));

    return games.map((g) => {
      const info = tMap.get(g.id_game);
      const phase = info?.tournament_phases;
      const group = info?.tournament_groups;
      const tournament = phase?.tournaments;

      const phaseId = g.fk_id_tournament_phase || info?.fk_id_tournament_phase || null;
      const groupId = g.fk_id_tournament_group || info?.fk_id_tournament_group || null;

      return {
        ...g,
        fk_id_tournament_phase: phaseId,
        fk_id_tournament_group: groupId,
        tournament_id: tournament?.id_tournament || null,
        tournament_name: tournament?.name || null,
        phase_name: phase?.name || null,
        group_name: group?.name || null,
        is_friendly: !phaseId,
      };
    });
  } catch (err) {
    console.error("Error al enriquecer juegos con datos de torneos:", err);
    return games;
  }
};

export const createGame = async (data) => {
  const payload = {
    location: data.location,
    date: data.date,
    fk_home_id_team: data.homeTeamId || data.fk_home_id_team || data.home_team,
    fk_away_id_team: data.awayTeamId || data.fk_away_id_team || data.away_team,
    home_team: data.homeTeamId || data.fk_home_id_team || data.home_team,
    away_team: data.awayTeamId || data.fk_away_id_team || data.away_team,
    status: data.status || "SCHEDULED",
    players: {
      home: data.homePlayers || (data.players && data.players.home) || [],
      away: data.awayPlayers || (data.players && data.players.away) || [],
    },
    // Asociación opcional a torneo — null si es amistoso
    fk_id_tournament_phase: data.fk_id_tournament_phase || null,
    fk_id_tournament_group: data.fk_id_tournament_group || null,
  };

  const response = await client.post("/games/with-players", payload);
  const createdGame = response.data;

  // Garantía de persistencia directa en Supabase
  const createdId = createdGame?.id_game;
  if (createdId && (payload.fk_id_tournament_phase || payload.fk_id_tournament_group)) {
    try {
      await supabase
        .from("games")
        .update({
          fk_id_tournament_phase: payload.fk_id_tournament_phase,
          fk_id_tournament_group: payload.fk_id_tournament_group,
        })
        .eq("id_game", createdId);
    } catch (e) {
      console.error("Error al actualizar torneo en games:", e);
    }
  }

  return createdGame;
};

export const getGameSummary = async (gameId) => {
  const response = await client.get(`/games/${gameId}/summary`);
  return response.data;
};