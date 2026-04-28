import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Loader2, ShieldCheck, UserPlus, Pencil, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTeamById } from "../hooks/useTeams"; 
import { 
  usePlayersByTeam, 
  useCreatePlayer, 
  useUpdatePlayer, 
  useDeletePlayer 
} from "../../players/hooks/usePlayers";

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  // Estado para saber qué jugador estamos editando
  const [editingId, setEditingId] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const { data: team, isLoading: isTeamLoading } = useTeamById(teamId);
  const { data: players, isLoading: isPlayersLoading } = usePlayersByTeam(teamId);
  
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  const deletePlayerMutation = useDeletePlayer();

  const onSubmit = (data) => {
    const playerData = {
      name: data.name,
      number: data.number ? parseInt(data.number, 10) : 0, 
      fk_id_team: parseInt(teamId, 10)
    };

    if (editingId) {
      // Modo Edición
      updatePlayerMutation.mutate({ id_player: editingId, ...playerData }, {
        onSuccess: () => {
          setEditingId(null);
          reset();
        }
      });
    } else {
      // Modo Creación
      createPlayerMutation.mutate(playerData, {
        onSuccess: () => reset()
      });
    }
  };

  const handleEdit = (player) => {
    setEditingId(player.id_player);
    setValue("name", player.name);
    setValue("number", player.number);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar a este jugador?")) {
      deletePlayerMutation.mutate(id);
    }
  };

    const handleViewStats = (playerId) => {
    navigate(`/players/${playerId}`);
    };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  return (
    <div className="p-6 space-y-6">
      <button 
        onClick={() => navigate("/teams")} 
        className="flex items-center gap-2 text-gray-500 hover:text-[#008000] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a equipos
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {isTeamLoading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-[#008000]" />
            <span className="text-gray-400">Cargando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#008000]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{team?.name}</h1>
              <p className="text-gray-400 text-sm">Integrantes del equipo</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#008000]" />
            {editingId ? "Editando Jugador" : "Jugadores Registrados"}
          </h2>

          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto p-2 rounded-2xl transition-all ${editingId ? 'bg-blue-50/50 border border-blue-100' : ''}`}
          >
            <div className="flex-1 lg:flex-none">
              <input
                {...register("name", { required: true })}
                placeholder="Nombre del jugador"
                className="px-4 py-2.5 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008000]/30 outline-none w-full lg:w-80"
              />
            </div>
            
            <div className="flex gap-2">
              <input
                {...register("number")}
                placeholder="N°"
                className="px-4 py-2.5 text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008000]/30 outline-none w-20 sm:w-24 text-center"
              />
              
              <button
                type="submit"
                disabled={createPlayerMutation.isPending || updatePlayerMutation.isPending}
                className={`flex-1 sm:flex-none ${editingId ? 'bg-blue-600' : 'bg-[#008000]'} text-white px-6 py-2.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition shadow-md`}
              >
                {createPlayerMutation.isPending || updatePlayerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  editingId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />
                )}
                <span className="whitespace-nowrap">
                  {editingId ? "Actualizar" : "Agregar"}
                </span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="p-2.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-6">
          {isPlayersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#008000] w-10 h-10" />
            </div>
          ) : players?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {players.map((player, index) => (
                <div 
                    key={player.id_player || `player-${index}`} 
                    // 2. Agregamos el click a la tarjeta
                    onClick={() => handleViewStats(player.id_player)}
                    className="group relative flex items-center gap-5 p-5 bg-white rounded-3xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all cursor-pointer"
                >
                    {/* Botones de Acción - IMPORTANTE: Usar e.stopPropagation() */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                        onClick={(e) => {
                        e.stopPropagation(); // Evita que se abra el perfil al intentar editar
                        handleEdit(player);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={(e) => {
                        e.stopPropagation(); // Evita que se abra el perfil al intentar eliminar
                        handleDelete(player.id_player);
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center text-[#008000] border-2 border-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
                      {player.photo_url ? (
                        <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-10 h-10 opacity-30" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 min-w-[32px] h-8 px-2 bg-[#008000] text-white text-xs font-black rounded-lg flex items-center justify-center border-2 border-white shadow-lg z-10">
                      {player.number || "—"}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-800 truncate text-lg leading-tight mb-1">
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Oficial
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-base text-center py-16 border-2 border-dashed border-gray-100 rounded-[2rem]">
              No hay jugadores en este equipo todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}