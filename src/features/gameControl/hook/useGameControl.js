import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGameDetails,
  getLiveStatus,
  getGamePlayers,
  getGameBoxScore,
  recordEvent,
  deleteEvent,
  setTeamStarters,
  makeSubstitution,
  endQuarter,
  startGame,
  finishGame,
  addOvertime
} from "../api/gameControl";

export function useGameControl(gameId) {
  const queryClient = useQueryClient();

  // 1. Datos básicos del partido
  const gameQuery = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGameDetails(gameId),
    enabled: !!gameId,
  });

  // 2. Estado en vivo (marcador, faltas por cuarto)
  const liveStatusQuery = useQuery({
    queryKey: ["liveStatus", gameId],
    queryFn: () => getLiveStatus(gameId),
    enabled: !!gameId,
    refetchInterval: 4000,
  });

  // 3. Jugadores del partido (GamePlayers)
  const gamePlayersQuery = useQuery({
    queryKey: ["gamePlayers", gameId],
    queryFn: () => getGamePlayers(gameId),
    enabled: !!gameId,
  });

  // 4. Box Score acumulado
  const boxScoreQuery = useQuery({
    queryKey: ["boxScore", gameId],
    queryFn: () => getGameBoxScore(gameId),
    enabled: !!gameId,
    refetchInterval: 5000,
  });

  // Mutación para Registrar Evento
  const recordEventMutation = useMutation({
    mutationFn: recordEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });

  // Mutación para Deshacer/Borrar Evento
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });

  // Mutación para Definir Titulares (5 jugadores)
  const setStartersMutation = useMutation({
    mutationFn: setTeamStarters,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamePlayers", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
    },
  });

  // Mutación para Realizar Sustitución
  const substitutionMutation = useMutation({
    mutationFn: makeSubstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamePlayers", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
    },
  });

  // Mutación para Iniciar Partido
  const startGameMutation = useMutation({
    mutationFn: () => startGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
    },
  });

  // Mutación para Finalizar Cuarto
  const endQuarterMutation = useMutation({
    mutationFn: () => endQuarter(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["gamePlayers", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
    },
  });

  // Mutación para Finalizar Partido
  const finishGameMutation = useMutation({
    mutationFn: () => finishGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["gamePlayers", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
    },
  });

  // Mutación para Agregar Tiempo Extra
  const addOvertimeMutation = useMutation({
    mutationFn: (overtimeSeconds) => addOvertime(gameId, overtimeSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["liveStatus", gameId] });
      queryClient.invalidateQueries({ queryKey: ["gamePlayers", gameId] });
      queryClient.invalidateQueries({ queryKey: ["boxScore", gameId] });
    },
  });

  return {
    game: gameQuery.data,
    liveStatus: liveStatusQuery.data,
    gamePlayers: gamePlayersQuery.data || [],
    boxScore: boxScoreQuery.data || [],
    isLoading: gameQuery.isLoading || gamePlayersQuery.isLoading,
    isError: gameQuery.isError || gamePlayersQuery.isError,
    recordEventMutation,
    deleteEventMutation,
    setStartersMutation,
    substitutionMutation,
    startGameMutation,
    endQuarterMutation,
    finishGameMutation,
    addOvertimeMutation,
  };
}
