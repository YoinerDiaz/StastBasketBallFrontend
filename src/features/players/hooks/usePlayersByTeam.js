import { useQuery } from "@tanstack/react-query";
import { getPlayersByTeam } from "../api/players";

export function usePlayersByTeam(id_team) {
    return useQuery({
        queryKey: ["playersByTeam", id_team],
        queryFn: () => getPlayersByTeam(id_team),
        staleTime: Infinity,
        enabled: !!id_team,
    });
}