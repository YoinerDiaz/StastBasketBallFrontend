import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "../api/teams";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["teamId", variables.id] });
      }
    },
  });
}
