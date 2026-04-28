import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTeams } from "../hooks/useTeams";
import { useCreateTeam } from "../hooks/useCreateTeam";
import { Plus, Users, ArrowLeft, Loader2, ShieldCheck, LayoutGrid } from "lucide-react"; 

export default function Teams() {
  const navigate = useNavigate();
  const { data: teams, isLoading, error } = useTeams();
  const createMutation = useCreateTeam();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  const handleOpen = (team) => {
    navigate(`/teams/${team.id_team}`); 
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Botón Volver */}
      <button 
        onClick={() => navigate("/")} 
        className="flex items-center gap-2 text-gray-500 hover:text-[#008000] transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </button>

      {/* Header Principal - Estilo TeamDetail */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-[#008000]">
            <LayoutGrid className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Equipos</h1>
            <p className="text-gray-400 font-medium">Gestión de equipos</p>
          </div>
        </div>
      </div>

      {/* Contenedor de Gestión */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Barra de Registro - Igual a la de jugadores */}
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-3">
            <Plus className="w-6 h-6 text-[#008000]" />
            Registrar Nuevo Equipo
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              {...register("name", { required: true })}
              placeholder="Nombre del equipo"
              className="px-5 py-3 rounded-xl border border-gray-200 outline-none w-full lg:w-96 focus:ring-2 focus:ring-[#008000]/20"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#008000] text-white px-8 py-3 rounded-xl font-bold transition shadow-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Agregar Equipo
            </button>
          </form>
        </div>

        {/* Listado de Tarjetas */}
        <div className="p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#008000] w-12 h-12" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-medium">
              Error al cargar los equipos. Intenta de nuevo.
            </div>
          ) : teams?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id_team}
                  onClick={() => handleOpen(team)}
                  className="group relative flex items-center gap-5 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Icono de Equipo */}
                  <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center text-[#008000] border-2 border-white shadow-md transition-transform group-hover:scale-105">
                    <ShieldCheck className="w-10 h-10" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 text-xl truncate mb-1 uppercase tracking-tight">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-gray-100 text-[#008000] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
                        Equipo
                      </span>
                    </div>
                  </div>

                  {/* Indicador de Status */}
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-base text-center py-16 border-2 border-dashed border-gray-100 rounded-[2rem]">
              No hay equipos registrados en el sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}