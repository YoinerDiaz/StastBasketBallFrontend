import { ArrowLeft, Calendar, Clock, FileText, Filter, Gamepad, MapPin, Play, Plus, Search, Shield, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";
import { useGames } from "../hooks/useGames";

const STATUS_CONFIG = {
  in_progress: { label: "En Vivo",    bg: "bg-red-50",    text: "text-red-600",   dot: "bg-red-500",   pulse: true  },
  scheduled:   { label: "Programado", bg: "bg-blue-50",   text: "text-blue-600",  dot: "bg-blue-400",  pulse: false },
  finished:    { label: "Finalizado", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400", pulse: false },
  cancelled:   { label: "Cancelado",  bg: "bg-red-50",    text: "text-[#731702]", dot: "bg-[#731702]", pulse: false },
};

const getStatusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.scheduled;

const STATUS_FILTERS = [
  { key: "all",         label: "Todos"       },
  { key: "in_progress", label: "En Vivo"     },
  { key: "scheduled",   label: "Programados" },
  { key: "finished",    label: "Finalizados" },
];

export default function UpcomingGames() {
  const navigate = useNavigate();
  const { data: games = [], isLoading } = useGames();
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeTournament, setActiveTournament] = useState("all"); // 'all' | 'friendly' | id_tournament
  const [search, setSearch] = useState("");
  const [tournaments, setTournaments] = useState([]);

  // Cargar lista de torneos existentes para los filtros
  useEffect(() => {
    supabase
      .from("tournaments")
      .select("id_tournament, name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTournaments(data);
      });
  }, []);

  // Conteos por estado
  const statusCounts = useMemo(() => ({
    all:         games.length,
    in_progress: games.filter(g => g.status === "in_progress").length,
    scheduled:   games.filter(g => g.status === "scheduled").length,
    finished:    games.filter(g => g.status === "finished").length,
  }), [games]);

  // Conteos por torneo y amistosos
  const tournamentCounts = useMemo(() => {
    const map = {
      all: games.length,
      friendly: games.filter(g => g.is_friendly).length,
    };
    tournaments.forEach(t => {
      map[t.id_tournament] = games.filter(g => g.tournament_id === t.id_tournament).length;
    });
    return map;
  }, [games, tournaments]);

  // Lista filtrada
  const filtered = useMemo(() => {
    let list = games;

    // Filtro por Estado
    if (activeStatus !== "all") {
      list = list.filter(g => g.status === activeStatus);
    }

    // Filtro por Torneo / Amistoso
    if (activeTournament === "friendly") {
      list = list.filter(g => g.is_friendly);
    } else if (activeTournament !== "all") {
      list = list.filter(g => g.tournament_id === Number(activeTournament));
    }

    // Filtro por Búsqueda
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(g =>
        g.home_team_name.toLowerCase().includes(q) ||
        g.away_team_name.toLowerCase().includes(q) ||
        (g.location || "").toLowerCase().includes(q) ||
        (g.tournament_name || "").toLowerCase().includes(q) ||
        (g.phase_name || "").toLowerCase().includes(q) ||
        (g.group_name || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [games, activeStatus, activeTournament, search]);

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] pb-20 w-full">
      {/* HEADER */}
      <header className="bg-[#01050D] text-white pt-12 pb-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 50px,rgba(255,255,255,.05) 50px,rgba(255,255,255,.05) 51px)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="p-4 rounded-2xl bg-white/10 hover:bg-[#F26513] transition-all duration-300 shadow-lg shrink-0"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Gamepad className="w-9 h-9 text-[#F26513]" /> Gestión de Partidos
            </h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Panel de Control de Encuentros
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 -mt-14 relative z-20 space-y-8">

        {/* ACCIONES RÁPIDAS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={() => navigate("/games/createGame?mode=now")}
            className="bg-[#F26513] hover:bg-[#D93D04] p-7 rounded-[2.5rem] shadow-2xl shadow-[#F26513]/20 hover:-translate-y-1 transition-all duration-300 flex items-center gap-7 text-left"
          >
            <div className="bg-white/20 p-5 rounded-3xl shrink-0">
              <Play className="w-9 h-9 text-white fill-current" />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">Jugar Ahora</h3>
              <p className="text-orange-100 text-sm font-medium opacity-80 mt-1">Inicia un partido en vivo con cronómetro</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/games/createGame?mode=schedule")}
            className="bg-white hover:bg-slate-50 p-7 rounded-[2.5rem] shadow-xl border border-slate-200 hover:-translate-y-1 transition-all duration-300 flex items-center gap-7 text-left"
          >
            <div className="bg-slate-100 p-5 rounded-3xl shrink-0">
              <Calendar className="w-9 h-9 text-[#01050D]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#01050D]">Programar Partido</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Reserva una fecha para un próximo encuentro</p>
            </div>
          </button>
        </section>

        {/* SECCIÓN DE FILTROS */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Fila 1: Filtro de Torneo y Amistosos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Trophy className="w-3.5 h-3.5 text-[#F26513]" /> Torneo / Competencia:
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* Opción Todos */}
              <button
                onClick={() => setActiveTournament("all")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  activeTournament === "all"
                    ? "bg-[#01050D] text-white shadow-md shadow-black/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Todos los partidos</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTournament === "all" ? "bg-white/20 text-white" : "bg-white text-slate-600"
                }`}>
                  {tournamentCounts.all ?? 0}
                </span>
              </button>

              {/* Opción Amistosos */}
              <button
                onClick={() => setActiveTournament("friendly")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  activeTournament === "friendly"
                    ? "bg-[#F26513] text-white shadow-md shadow-[#F26513]/25"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/50"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Amistosos</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTournament === "friendly" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                }`}>
                  {tournamentCounts.friendly ?? 0}
                </span>
              </button>

              {/* Cada Torneo Registrado */}
              {tournaments.map((t) => {
                const count = tournamentCounts[t.id_tournament] ?? 0;
                const isSelected = activeTournament === t.id_tournament;
                return (
                  <button
                    key={t.id_tournament}
                    onClick={() => setActiveTournament(t.id_tournament)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? "bg-[#01050D] text-white shadow-md shadow-black/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#F26513]" />
                    <span className="truncate max-w-[160px]">{t.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Fila 2: Filtro por Estado */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" /> Estado:
              </span>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveStatus(f.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                    activeStatus === f.key
                      ? "bg-[#01050D] text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    activeStatus === f.key ? "bg-white/20 text-white" : "bg-white text-slate-600"
                  }`}>
                    {statusCounts[f.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar equipo, torneo o sede..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#01050D] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F26513]/30 focus:border-[#F26513] transition"
              />
            </div>
          </div>
        </section>

        {/* LISTADO DE RESULTADOS */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#01050D] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F26513]" />
              {activeTournament === "friendly"
                ? "Amistosos"
                : activeTournament !== "all"
                ? tournaments.find(t => t.id_tournament === Number(activeTournament))?.name ?? "Torneo"
                : "Todos los Partidos"}
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filtered.length} partido{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] py-20 px-8 border border-slate-200 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Gamepad className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#01050D]">Sin resultados</h3>
              <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
                {search
                  ? `No hay partidos que coincidan con "${search}".`
                  : "No hay partidos para los filtros seleccionados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(game => (
                <GameCard key={game.id_game} game={game} navigate={navigate} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function GameCard({ game, navigate }) {
  const cfg = getStatusCfg(game.status);
  const isLive = game.status === "in_progress";
  const isFinished = game.status === "finished";

  const handleCardClick = () => {
    if (isFinished) {
      navigate(`/game-summary/${game.id_game}`);
    } else {
      navigate(`/game-control/${game.id_game}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-[#F26513]/30 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div className="p-7 flex-1 flex flex-col space-y-5">
        
        {/* Header de la tarjeta: Badge de Torneo/Amistoso y Estado */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
          {/* Badge Torneo o Amistoso */}
          {game.tournament_name ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-[#F26513] border border-amber-200/60 text-[10px] font-black uppercase tracking-wider truncate max-w-[170px]"
              title={`${game.tournament_name} ${game.group_name ? `· ${game.group_name}` : ""}`}
            >
              <Trophy className="w-3 h-3 text-[#F26513] shrink-0" />
              <span className="truncate">{game.tournament_name}</span>
              {game.group_name && <span className="text-amber-700/60 text-[9px] font-bold shrink-0">· {game.group_name}</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60 text-[10px] font-black uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Amistoso</span>
            </div>
          )}

          {/* Badge Estado */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{cfg.label}</span>
          </div>
        </div>

        {/* Marcador / Equipos */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex-1 text-right">
              <p className="text-sm font-black uppercase truncate text-[#01050D] leading-tight">{game.home_team_name}</p>
            </div>

            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              {isLive || isFinished ? (
                <div className="flex items-center gap-2 bg-slate-950 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-inner">
                  <span>{game.home_score}</span>
                  <span className="opacity-30 text-[10px]">-</span>
                  <span>{game.away_score}</span>
                </div>
              ) : (
                <div className="bg-slate-100 text-slate-400 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black">
                  VS
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <p className="text-sm font-black uppercase truncate text-[#01050D] leading-tight">{game.away_team_name}</p>
            </div>
          </div>

          {isLive && game.current_quarter && (
            <span className="text-[10px] font-bold text-[#F26513] uppercase tracking-[0.2em]">{game.current_quarter}º CUARTO</span>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">
                {game.date ? new Date(game.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "S/F"}
                {" · "}
                {game.date ? new Date(game.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            {game.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold truncate max-w-[80px]">{game.location}</span>
              </div>
            )}
          </div>

          {/* Botón de Acción según el estado */}
          {isFinished ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/game-summary/${game.id_game}`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#01050D] hover:bg-[#F26513] text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-black/10 transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5 text-[#F26513] group-hover:text-white transition-colors" />
              <span>Resumen</span>
            </button>
          ) : (
            <div className="text-[#F26513] font-black text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
              GESTIONAR <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
