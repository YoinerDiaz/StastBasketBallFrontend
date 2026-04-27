import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayer, getPlayers, getPlayer, getPlayersByTeam } from "../api/players";
import { useQuery } from "@tanstack/react-query";

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries(["players"]);
    },
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
    staleTime: Infinity,
  });
}

export function usePlayersByTeam(id_team) {
  return useQuery({
    queryKey: ["players", id_team],
    queryFn: () => getPlayersByTeam(id_team),
    staleTime: Infinity,
    enabled: !!id_team,
  });
}
export function usePlayerById(id_player) {
  return useQuery({
    queryKey: ["id_player"],
    queryFn: () => getPlayer(id_player),
    staleTime: Infinity,
  });
}