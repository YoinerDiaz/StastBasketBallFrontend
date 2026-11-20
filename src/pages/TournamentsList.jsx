import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Plus, Calendar, MapPin, ChevronRight, Layers } from "lucide-react";
import { supabase } from "../api/supabaseClient";

export default function TournamentsList() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setTournaments(data || []);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] py-10 px-6 sm:px-8 lg:px-12 w-full flex flex-col space-y-8">
      {/* Header Banner - Full Width */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#01050D] text-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/")} className="p-3.5 rounded-2xl bg-white/10 hover:bg-[#F26513] transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Trophy className="w-7 h-7 text-[#F26513]" /> Gestión de Torneos
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Campeonatos, fases de grupos y llaves eliminatorias</p>
          </div>
        </div>
        <button onClick={() => navigate("/tournaments/create")} className="px-6 py-3.5 rounded-2xl bg-[#F26513] hover:bg-[#D93D04] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#F26513]/30 transition">
          <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Torneo
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#F26513] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Cargando torneos desde base de datos...</p>
          </div>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-xl shadow-slate-200/50 max-w-xl w-full mx-auto space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-[#F26513] mx-auto shadow-inner">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase text-[#01050D]">No hay torneos registrados</h3>
              <p className="text-xs font-bold text-gray-500">Comienza creando tu primer campeonato de baloncesto para gestionar fases y equipos.</p>
            </div>
            <button onClick={() => navigate("/tournaments/create")} className="px-8 py-4 rounded-2xl bg-[#01050D] text-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-[#F26513] shadow-lg transition">
              <Plus className="w-4 h-4" /> Crear Primer Torneo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {tournaments.map((t) => (
            <div key={t.id_tournament} onClick={() => navigate(`/tournaments/${t.id_tournament}`)} className="group bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-[#F26513]/50 transition cursor-pointer flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 bg-[#F2F2F2] text-[#01050D] rounded-full">{t.category || "Libre"}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">{t.status || "Activo"}</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#01050D] group-hover:text-[#F26513] transition">{t.name}</h3>
                <p className="text-xs font-bold text-gray-500 line-clamp-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#F26513]" /> {t.format || "Fase de Grupos + Playoffs"}
                </p>
              </div>
              <div className="space-y-3 pt-5 border-t border-slate-100 text-xs font-bold text-gray-600">
                {t.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#F26513]" /><span>{t.location}</span></div>}
                {t.start_date && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(t.start_date).toLocaleDateString()}</span></div>}
                <div className="pt-3 flex items-center justify-between text-[#F26513] font-black uppercase text-[11px]">
                  <span>Ver detalle y posiciones</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
