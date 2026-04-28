import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayer, getPlayers, getPlayer, getPlayersByTeam, deletePlayer, updatePlayer } from "../api/players";
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


export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    // Recibe un objeto que contenga id_player y los nuevos datos
    mutationFn: ({ id_player, ...data }) => updatePlayer(id_player, data),
    onSuccess: () => {
      // Invalidamos las listas para que se refresquen los datos
      queryClient.invalidateQueries({ queryKey: ["players"] });
      console.log("Jugador actualizado con éxito");
    },
    onError: (error) => {
      console.error("Error al actualizar jugador:", error.response?.data || error.message);
    }
  });
}


export function useDeletePlayer(){
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_player) => deletePlayer(id_player),
    onSuccess: () =>{
      queryClient.invalidateQueries({queryKey:["players"]});
      console.log("Jugador Eliminado");
    },
    onError:(error) =>{
      console.log("Error al eliminar jugador:" , error.response?.data || error.message);
    }
  });
}