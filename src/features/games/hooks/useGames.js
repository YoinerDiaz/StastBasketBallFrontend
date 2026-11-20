import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGame, getGames } from "../api/games";

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: getGames,
    staleTime: 1000 * 30, // 30s — los partidos cambian de estado frecuentemente
    select: (data) =>
      data.map((g) => ({
        id: g.id_game,
        id_game: g.id_game,
        location: g.location || "Sin sede",
        date: g.date || null,
        status: (g.status || "scheduled").toLowerCase(),
        home_team_name: g.home_team?.name || g.home_team_name || "Local",
        away_team_name: g.away_team?.name || g.away_team_name || "Visitante",
        home_score: g.home_score ?? 0,
        away_score: g.away_score ?? 0,
        current_quarter: g.current_quarter || null,
        fk_id_tournament_phase: g.fk_id_tournament_phase || null,
        fk_id_tournament_group: g.fk_id_tournament_group || null,
        tournament_id: g.tournament_id || null,
        tournament_name: g.tournament_name || null,
        phase_name: g.phase_name || null,
        group_name: g.group_name || null,
        is_friendly: Boolean(g.is_friendly),
      })),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries(["games"]);
    },
  });
}

