import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "../api/teams";
import { toast } from "react-toastify";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Equipo eliminado correctamente");
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.detail || "Error al eliminar equipo";
      console.error("Error al eliminar equipo:", errorMsg);
      toast.error(errorMsg);
    }
  });
}
