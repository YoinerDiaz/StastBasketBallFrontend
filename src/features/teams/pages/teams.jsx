import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTeams } from "../hooks/useTeams";
import { useCreateTeam } from "../hooks/useCreateTeam";
import { Plus, Users } from "lucide-react";
import TeamModal from "../components/teamModal";

export default function Teams() {

  const [selectedTeam, setSelectedTeam] = useState(null);

  const { data: teams, isLoading, error } = useTeams();

  const createMutation = useCreateTeam();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  const handleOpen = (team) => {
    setSelectedTeam(team);
  };

  const handleClose = () => {
    setSelectedTeam(null);
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error cargando equipos</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Equipos</h1>
        <p className="text-sm text-gray-400">
          Crea y gestiona los equipos del sistema
        </p>
      </div>

      {/* Crear equipo */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Crear nuevo equipo
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-3"
        >
          <input
            {...register("name", { required: true })}
            placeholder="Nombre del equipo"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008000]/40"
          />

          <button
            type="submit"
            className="bg-[#008000] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            Crear
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleOpen(team)}
              className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-[#008000]">
                  <Users className="w-5 h-5" />
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {team.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Equipo activo
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm col-span-full text-center py-10">
            No hay equipos creados
          </div>
        )}
      </div>

      {selectedTeam && (
        <TeamModal
          onClose={handleClose}
          teamId={selectedTeam?.id_team}
        />
      )}

    </div>
  );
}