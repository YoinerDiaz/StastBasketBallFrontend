import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";

export default function GameSummary() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] py-10 px-6 sm:px-8 lg:px-12 w-full flex flex-col space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#01050D] text-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/games")} className="p-3.5 rounded-2xl bg-white/10 hover:bg-[#F26513] transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Trophy className="w-7 h-7 text-[#F26513]" /> Resumen del Partido #{gameId}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Estadísticas finales y marcador</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6 max-w-2xl mx-auto w-full">
        <Trophy className="w-16 h-16 text-[#F26513] mx-auto" />
        <h3 className="text-xl font-black uppercase text-[#01050D]">Partido Finalizado</h3>
        <p className="text-xs font-bold text-gray-500">Estadísticas completas del encuentro registradas correctamente.</p>
        <button onClick={() => navigate("/games")} className="px-8 py-4 rounded-2xl bg-[#01050D] text-white text-xs font-black uppercase tracking-widest hover:bg-[#F26513] transition">
          Volver a Partidos
        </button>
      </div>
    </div>
  );
}
