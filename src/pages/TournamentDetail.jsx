import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Trophy, Plus, Shield, Clock, Award, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../api/supabaseClient";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [phases,     setPhases]     = useState([]);
  const [games,      setGames]      = useState([]);
  const [standings,  setStandings]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);

      const { data: tData, error: tErr } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id_tournament", id)
        .single();
      if (tErr) throw tErr;
      setTournament(tData);

      const { data: pData, error: pErr } = await supabase
        .from("tournament_phases")
        .select("*, tournament_groups(*)")
        .eq("fk_id_tournament", id)
        .order("sequence_order", { ascending: true });
      if (pErr) throw pErr;
      setPhases(pData || []);

      const phaseIds = (pData || []).map(p => p.id_phase);

      if (phaseIds.length > 0) {
        const { data: gData } = await supabase
          .from("games")
          .select("*, home:teams!fk_home_id_team(id_team, name), away:teams!fk_away_id_team(id_team, name)")
          .in("fk_id_tournament_phase", phaseIds)
          .order("date", { ascending: true });
        setGames(gData || []);

        const groupIds = (pData || []).flatMap(p => (p.tournament_groups || []).map(g => g.id_group));
        if (groupIds.length > 0) {
          const { data: sData } = await supabase
            .from("tournament_standings")
            .select("*, team:teams!fk_id_team(id_team, name)")
            .in("fk_id_group", groupIds)
            .order("points", { ascending: false });
          setStandings(sData || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los datos del torneo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTournamentData();
  }, [id]);

  const handleProgramGame = (phase, group) => {
    navigate("/games/createGame", {
      state: {
        fromTournament:       true,
        tournamentId:         tournament?.id_tournament,
        tournamentName:       tournament?.name,
        phaseId:              phase.id_phase,
        phaseName:            phase.name,
        groupId:              group.id_group,
        groupName:            group.name,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#F26513] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  const startDateStr = tournament?.start_date ? new Date(tournament.start_date).toLocaleDateString() : null;
  const endDateStr   = tournament?.end_date   ? new Date(tournament.end_date).toLocaleDateString()   : null;

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] pb-24">

      {/* HEADER HERO */}
      <div className="bg-[#01050D] text-white pt-10 pb-20 px-6 sm:px-10 lg:px-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 50px,white 50px,white 51px)" }} />
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">

          {/* Barra de navegación superior */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/tournaments")}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-[#F26513] transition text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Torneos
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                {tournament?.status || "Activo"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/10 text-white rounded-full">
                {tournament?.category || "Libre"}
              </span>
            </div>
          </div>

          {/* Título y metadatos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#F26513] text-xs font-black uppercase tracking-widest">
              <Trophy className="w-4 h-4" /> Campeonato Oficial
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              {tournament?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-400 pt-1">
              {tournament?.format && (
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#F26513]" />
                  <span>{tournament.format}</span>
                </div>
              )}
              {tournament?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F26513]" />
                  <span>{tournament.location}</span>
                </div>
              )}
              {(startDateStr || endDateStr) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F26513]" />
                  <span>{startDateStr}{endDateStr ? " - " + endDateStr : ""}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 -mt-10 relative z-20 space-y-10">
        {phases.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-200">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase text-[#01050D]">Sin fases configuradas</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Este torneo aún no tiene fases ni grupos creados.</p>
          </div>
        ) : (
          phases.map((phase) => (
            <div key={phase.id_phase} className="space-y-6">

              {/* Título de la Fase */}
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-7 bg-[#F26513] rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-tight text-[#01050D]">{phase.name}</h2>
                {phase.type && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">
                    {phase.type}
                  </span>
                )}
              </div>

              {/* Grid de Grupos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(phase.tournament_groups || []).map((group) => {
                  const groupStandings = standings.filter(s => s.fk_id_group === group.id_group);
                  const groupGames     = games.filter(g => g.fk_id_tournament_group === group.id_group);

                  return (
                    <div key={group.id_group} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">

                      {/* Header del Grupo */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-[#F26513]">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-black text-base uppercase text-[#01050D]">{group.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {groupStandings.length} equipos · {groupGames.length} partidos
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleProgramGame(phase, group)}
                          className="px-4 py-2.5 rounded-xl bg-[#F26513] hover:bg-[#D93D04] text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-[#F26513]/25 transition active:scale-95 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Programar
                        </button>
                      </div>

                      {/* Tabla de Posiciones */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#F26513]" /> Tabla de Posiciones
                        </p>
                        {groupStandings.length === 0 ? (
                          <div className="bg-slate-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-slate-400 font-bold">Sin equipos registrados en este grupo</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                                  <th className="py-2 pl-2">#</th>
                                  <th className="py-2">Club</th>
                                  <th className="py-2 text-center">PJ</th>
                                  <th className="py-2 text-center">PG</th>
                                  <th className="py-2 text-center">PP</th>
                                  <th className="py-2 text-center font-black text-[#01050D]">PTS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {groupStandings.map((s, idx) => (
                                  <tr key={s.id_standing} className="hover:bg-slate-50 font-bold">
                                    <td className="py-2 pl-2 text-slate-400 font-black">{idx + 1}</td>
                                    <td className="py-2 text-[#01050D] font-black truncate max-w-[120px]">{s.team?.name || "Equipo"}</td>
                                    <td className="py-2 text-center text-slate-600">{s.games_played ?? 0}</td>
                                    <td className="py-2 text-center text-green-600 font-black">{s.wins ?? 0}</td>
                                    <td className="py-2 text-center text-red-500 font-black">{s.losses ?? 0}</td>
                                    <td className="py-2 text-center font-black text-[#F26513]">{s.points ?? 0}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Lista de Partidos del Grupo */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#F26513]" /> Partidos ({groupGames.length})
                        </p>
                        {groupGames.length === 0 ? (
                          <div className="bg-slate-50 rounded-2xl p-4 text-center">
                            <p className="text-xs text-slate-400 font-bold">No hay partidos programados aún</p>
                            <button
                              onClick={() => handleProgramGame(phase, group)}
                              className="mt-2 text-xs text-[#F26513] font-black uppercase tracking-widest hover:underline"
                            >
                              + Programar el primero
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {groupGames.map((game) => {
                              const isFinished = game.status === "finished";
                              const isLive     = game.status === "in_progress";
                              const dateStr    = game.date ? new Date(game.date).toLocaleDateString() : "S/F";
                              const timeStr    = game.date ? new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                              return (
                                <div
                                  key={game.id_game}
                                  onClick={() => navigate("/game-control/" + game.id_game)}
                                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="text-right flex-1 truncate font-black text-[#01050D]">
                                      {game.home?.name || "Local"}
                                    </div>
                                    <div className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-center font-black text-[11px] shrink-0">
                                      {isFinished || isLive
                                        ? `${game.home_score ?? 0} - ${game.away_score ?? 0}`
                                        : "VS"}
                                    </div>
                                    <div className="text-left flex-1 truncate font-black text-[#01050D]">
                                      {game.away?.name || "Visitante"}
                                    </div>
                                  </div>

                                  <div className="ml-3 text-right shrink-0">
                                    <p className="text-[10px] text-slate-400 font-bold">{dateStr} {timeStr}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                      isLive ? "bg-red-100 text-red-600 animate-pulse" : isFinished ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-600"
                                    }`}>
                                      {isLive ? "En Vivo" : isFinished ? "Final" : "Prog."}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}
