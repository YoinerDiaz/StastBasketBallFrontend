import { X, Users, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useTeamById } from "../hooks/useTeams";
import { useCreatePlayer } from "../../players/hooks/usePlayers";
import { usePlayersByTeam } from "../../players/hooks/usePlayersByTeam";
import { useUpdateTeam } from "../hooks/useUpdateTeam";
import { useForm } from "react-hook-form";

export default function TeamModal({ onClose, teamId }) {
    const { data: team } = useTeamById(teamId);
    const { data: players = [] } = usePlayersByTeam(teamId);
    const createPlayer = useCreatePlayer();
    const updateTeam = useUpdateTeam();

    const [teamName, setTeamName] = useState("");
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (team?.name) {
            setTeamName(team.name);
        }
    }, [team]);

    const onSubmit = (data) => {
        createPlayer.mutate(
            {
                name: data.name,
                number: Number(data.number),
                fk_id_team: teamId,
            },
            {
                onSuccess: () => reset(),
            }
        );
    };

    if (!teamId) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">

            {/* Contenedor */}
            <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-5 space-y-5 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg text-gray-800">
                        {team?.name || "Equipo"}
                    </h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* Editar nombre */}
                <div>
                    <label className="text-xs text-gray-400">Nombre del equipo</label>
                    <input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onBlur={() => {
                            if (teamName !== team?.name && teamName.trim()) {
                                updateTeam.mutate({ id: teamId, data: { name: teamName } });
                            }
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-xl"
                    />
                </div>

                {/* Jugadores */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Jugadores
                    </h3>

                    {players.length > 0 ? (
                        <div className="space-y-2">
                            {players.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl"
                                >
                                    <span>{p.name}</span>
                                    <span className="text-xs text-gray-400">#{p.number}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">
                            No hay jugadores aún
                        </p>
                    )}
                </div>

                {/* Crear jugador */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    <input
                        {...register("name", { required: true })}
                        placeholder="Nombre jugador"
                        className="w-full px-3 py-2 border rounded-xl"
                    />

                    <input
                        type="number"
                        {...register("number", { required: true, valueAsNumber: true })}
                        placeholder="Número"
                        className="w-full px-3 py-2 border rounded-xl"
                    />

                    <button
                        type="submit"
                        className="w-full bg-[green] text-white py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir jugador
                    </button>
                </form>
            </div>
        </div>
    );
}