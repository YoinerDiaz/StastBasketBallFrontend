import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createGame, 
  getGames, 
  getGame, 
  updateGame, 
  deleteGame,
  setStarters,
  makeSubstitution,
  getLineup,
  endQuarter,
  getLiveStatus
} from "../api/games";

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: getGames,
    staleTime: 1000 * 30, // 30s
  });
}

export function useGameById(gameId) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGame(gameId),
    enabled: !!gameId,
    staleTime: 1000 * 10,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, data }) => updateGame(gameId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId) => deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useSetStarters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setStarters,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lineup", variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
    },
  });
}

export function useMakeSubstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: makeSubstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineup"] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus"] });
      queryClient.invalidateQueries({ queryKey: ["boxScore"] });
    },
  });
}

export function useLineup(gameId, teamId) {
  return useQuery({
    queryKey: ["lineup", gameId, teamId],
    queryFn: () => getLineup(gameId, teamId),
    enabled: !!gameId && !!teamId,
    staleTime: 1000 * 5,
  });
}

export function useEndQuarter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId) => endQuarter(gameId),
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["lineup", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
    },
  });
}

export function useLiveStatus(gameId) {
  return useQuery({
    queryKey: ["liveStatus", gameId],
    queryFn: () => getLiveStatus(gameId),
    enabled: !!gameId,
    refetchInterval: 5000, // auto refrescar cada 5s si está en vivo
  });
}

