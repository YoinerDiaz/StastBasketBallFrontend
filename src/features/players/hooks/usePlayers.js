import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { 
  createPlayer, 
  getPlayers, 
  getPlayer, 
  getPlayersByTeam, 
  deletePlayer, 
  updatePlayer, 
  getPlayersCareerStats, 
  getPlayersStatsHistory 
} from "../api/players";

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function usePlayersByTeam(id_team) {
  return useQuery({
    queryKey: ["players", "team", id_team],
    queryFn: () => getPlayersByTeam(id_team),
    staleTime: 1000 * 60 * 5,
    enabled: !!id_team,
  });
}

export function usePlayerById(id_player) {
  return useQuery({
    queryKey: ["player", id_player],
    queryFn: () => getPlayer(id_player),
    staleTime: 1000 * 60 * 5,
    enabled: !!id_player, 
  });
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id_player, ...data }) => updatePlayer(id_player, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      if (variables.id_player) {
        queryClient.invalidateQueries({ queryKey: ["player", variables.id_player] });
      }
    },
    onError: (error) => {
      console.error("Error al actualizar jugador:", error.response?.data || error.message);
    }
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_player) => deletePlayer(id_player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Jugador eliminado correctamente");
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.detail || "Error al eliminar jugador";
      console.error("Error al eliminar jugador:", errorMsg);
      toast.error(errorMsg);
    }
  });
}

export const usePlayerStats = (playerId) => {
  const career = useQuery({
    queryKey: ["playerCareer", playerId],
    queryFn: () => getPlayersCareerStats(playerId),
    enabled: !!playerId,
  });

  const history = useQuery({
    queryKey: ["playerHistory", playerId],
    queryFn: () => getPlayersStatsHistory(playerId),
    enabled: !!playerId,
  });

  return { career, history };
};
