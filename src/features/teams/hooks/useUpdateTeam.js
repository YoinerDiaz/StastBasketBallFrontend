import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "../api/teams";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teamId"]);
    },
  });
}