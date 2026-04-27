import { useQuery } from "@tanstack/react-query";
import { getTeams, getTeam } from "../api/teams";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    staleTime: Infinity,
  });
}
export function useTeamById(id_team) {
  return useQuery({
    queryKey: ["teamId"],
    queryFn: () => getTeam(id_team),
    staleTime: Infinity,
    enabled: !!id_team,
  });
}