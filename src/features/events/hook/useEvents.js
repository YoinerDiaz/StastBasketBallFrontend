import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  deleteEvent,
  getEventsByGamePlayer,
} from "../api/events";

/**
 * Hook para registrar un evento en vivo (anotación, falta, rebote, etc.)
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (_, variables) => {
      // Invalida los eventos del jugador específico
      queryClient.invalidateQueries({
        queryKey: ["events", variables.fk_id_game_player],
      });
      // Invalida el estado del partido y estadísticas del jugador
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

/**
 * Hook para eliminar/deshacer un evento por su ID
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Invalida todas las consultas de eventos, partidos y jugadores para recalcular marcadores
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

/**
 * Hook para obtener los eventos de un jugador específico en un partido
 * @param {number} gamePlayerId - ID de la relación game_player (gp_id)
 */
export function useEventsByGamePlayer(gamePlayerId) {
  return useQuery({
    queryKey: ["events", gamePlayerId],
    queryFn: () => getEventsByGamePlayer(gamePlayerId),
    enabled: !!gamePlayerId, // Evita disparar la petición si gamePlayerId es undefined o null
  });
}