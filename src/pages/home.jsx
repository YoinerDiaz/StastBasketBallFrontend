import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionWidget from "../components/actionWidget";
import { useGames } from "../features/games/hooks/useGames";
import { useTeams } from "../features/teams/hooks/useTeams";
import { usePlayers } from "../features/players/hooks/usePlayers";
import { Users2Icon, Gamepad, Trophy, TrendingUp, Activity, Calendar, Users, Target, MapPin, ArrowRight, Radio, Clock, CheckCircle2, AlertCircle, UserPlus, Zap } from "lucide-react";
import DashboardCharts from "../components/DashboardCharts";
import QuickActions from "../components/QuickActions";
import DashboardFooter from "../components/DashboardFooter";

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="tabular-nums">{count}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: players = [], isLoading: playersLoading } = usePlayers();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px)`
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-green-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-green-500/60" />
                <span className="text-green-400 text-xs font-black uppercase tracking-[0.3em]">Panel de Administracion</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Administrador</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium max-w-lg">
                El juego esta en tus manos. Gestiona equipos, programa encuentros y controla cada detalle desde un solo lugar.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={() => navigate("/games/createGame?mode=now")} className="group flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-green-900/50 active:scale-95 transition-all">
                  <Gamepad className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Nuevo Partido
                </button>
                <button onClick={() => navigate("/teams")} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-xl border border-white/10 active:scale-95 transition-all">
                  <Users2Icon className="w-4 h-4" />
                  Ver Equipos
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4 bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <div className="text-right">
                <div className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">{formatDate(currentTime)}</div>
                <div className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight">{formatTime(currentTime)}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sistema en linea
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionWidget title="Equipos" description="Gestionar equipos" path="/teams" icon={<Users2Icon className="w-6 h-6" />} colorClass="bg-white text-gray-700 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50" accentColor="bg-green-100 text-green-600" />
          <ActionWidget title="Partidos" description="Programa o inicia un encuentro" path="/games" icon={<Gamepad className="w-6 h-6" />} colorClass="bg-white text-gray-700 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50" accentColor="bg-blue-100 text-blue-600" />
          <ActionWidget title="Estadisticas" description="Analisis de rendimiento" path="/stats" icon={<TrendingUp className="w-6 h-6" />} colorClass="bg-white text-gray-700 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50" accentColor="bg-purple-100 text-purple-600" />
          <ActionWidget title="Torneos" description="Gestion de competencias" path="/tournaments" icon={<Trophy className="w-6 h-6" />} colorClass="bg-white text-gray-700 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50" accentColor="bg-amber-100 text-amber-600" />
        </div>
      </div>

      {/* KPIs / Metricas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-green-500/60" />
          <span className="text-green-600 text-xs font-black uppercase tracking-[0.3em]">Resumen General</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Equipos */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Equipos</span>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {teamsLoading ? "-" : <AnimatedCounter value={teams.length} />}
            </div>
            <p className="text-xs text-gray-400 font-medium">Registrados en el sistema</p>
          </div>

          {/* Total Jugadores */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Jugadores</span>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {playersLoading ? "-" : <AnimatedCounter value={players.length} />}
            </div>
            <p className="text-xs text-gray-400 font-medium">Activos en plantillas</p>
          </div>

          {/* Total Partidos */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Partidos</span>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {gamesLoading ? "-" : <AnimatedCounter value={games.length} />}
            </div>
            <p className="text-xs text-gray-400 font-medium">Jugados o programados</p>
          </div>

          {/* Partidos en Vivo */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">En Vivo</span>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {gamesLoading ? "-" : <AnimatedCounter value={games.filter(g => ["en_progreso", "in_progress", "live"].includes(g.status?.toLowerCase())).length} />}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <p className="text-xs text-gray-400 font-medium">Partidos activos ahora</p>
            </div>
          </div>
        </div>
      </div>

      {/* PARTIDOS EN VIVO Y PROXIMOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-green-500/60" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Cartelera de Partidos</h2>
          </div>
          <button onClick={() => navigate("/games")} className="flex items-center gap-2 text-green-600 hover:text-green-700 text-xs font-black uppercase tracking-widest transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {gamesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded w-32" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games
              .filter(g => ["en_progreso", "in_progress", "live"].includes(g.status?.toLowerCase()))
              .slice(0, 2)
              .map((game) => {
                const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
                const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
                const homeScore = game.home_score ?? 0;
                const awayScore = game.away_score ?? 0;
                const gameId = game.id_game || game.id;

                return (
                  <div key={gameId} onClick={() => navigate(`/game-control/${gameId}`)} className="group relative bg-white rounded-3xl p-6 border-2 border-red-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all cursor-pointer">
                    <div className="absolute -top-3 left-6">
                      <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30">
                        <Radio className="w-3 h-3 animate-pulse" />
                        En Vivo
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4 pt-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                        <MapPin className="w-3 h-3" />
                        {game.location || "Cancha Principal"}
                      </span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Cuarto {game.current_quarter || 1}</span>
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex-1 text-left">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Local</span>
                        <h4 className="text-lg font-black text-gray-800 truncate">{homeTeamName}</h4>
                      </div>
                      <div className="px-4 py-2 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                        <span className="text-2xl font-black text-red-600">{homeScore}</span>
                        <span className="text-xs font-black text-red-300">-</span>
                        <span className="text-2xl font-black text-red-600">{awayScore}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Visitante</span>
                        <h4 className="text-lg font-black text-gray-800 truncate">{awayTeamName}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {game.date ? new Date(game.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "Hoy"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-red-500 text-[11px] font-black group-hover:bg-red-500 group-hover:text-white px-3 py-1.5 rounded-lg transition-all">
                        Mesa de Control <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}

            {games
              .filter(g => ["programado", "scheduled"].includes(g.status?.toLowerCase()))
              .slice(0, 2)
              .map((game) => {
                const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
                const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
                const gameId = game.id_game || game.id;

                return (
                  <div key={gameId} onClick={() => navigate(`/game-control/${gameId}`)} className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer">
                    <div className="absolute -top-3 left-6">
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        Programado
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4 pt-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                        <MapPin className="w-3 h-3" />
                        {game.location || "Cancha Principal"}
                      </span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Por iniciar</span>
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex-1 text-left">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Local</span>
                        <h4 className="text-lg font-black text-gray-800 truncate">{homeTeamName}</h4>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-sm font-black text-gray-400">VS</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Visitante</span>
                        <h4 className="text-lg font-black text-gray-800 truncate">{awayTeamName}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {game.date ? new Date(game.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Fecha por definir"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-[11px] font-black group-hover:bg-green-600 group-hover:text-white px-3 py-1.5 rounded-lg transition-all">
                        Ir al Partido <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}

            {games.filter(g => ["en_progreso", "in_progress", "live", "programado", "scheduled"].includes(g.status?.toLowerCase())).length === 0 && (
              <div className="col-span-2 py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-center">
                <Calendar className="w-12 h-12 text-gray-300" />
                <p className="text-gray-400 font-bold">No hay partidos activos ni programados</p>
                <button onClick={() => navigate("/games/createGame?mode=now")} className="text-green-600 hover:text-green-700 text-sm font-black uppercase tracking-wider transition-colors">
                  Crear nuevo partido
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-green-500/60" />
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Actividad Reciente</h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {gamesLoading && teamsLoading && playersLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {games
                .filter(g => ["finalizado", "finished"].includes(g.status?.toLowerCase()))
                .slice(0, 3)
                .map((game) => {
                  const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
                  const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
                  const homeScore = game.home_score ?? 0;
                  const awayScore = game.away_score ?? 0;
                  const gameId = game.id_game || game.id;

                  return (
                    <div key={gameId} onClick={() => navigate(`/game-control/${gameId}`)} className="group flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          Partido finalizado: {homeTeamName} {homeScore} - {awayScore} {awayTeamName}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {game.date ? new Date(game.date).toLocaleDateString("es-ES", { day: "numeric", month: "long" }) : "Fecha no disponible"} · {game.location || "Cancha Principal"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  );
                })}

              {games
                .filter(g => ["programado", "scheduled"].includes(g.status?.toLowerCase()))
                .slice(0, 2)
                .map((game) => {
                  const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
                  const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
                  const gameId = game.id_game || game.id;

                  return (
                    <div key={gameId} onClick={() => navigate(`/game-control/${gameId}`)} className="group flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          Partido programado: {homeTeamName} vs {awayTeamName}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {game.date ? new Date(game.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Fecha por definir"} · {game.location || "Cancha Principal"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  );
                })}

              {games
                .filter(g => ["en_progreso", "in_progress", "live"].includes(g.status?.toLowerCase()))
                .slice(0, 2)
                .map((game) => {
                  const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
                  const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
                  const gameId = game.id_game || game.id;

                  return (
                    <div key={gameId} onClick={() => navigate(`/game-control/${gameId}`)} className="group flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          En progreso: {homeTeamName} vs {awayTeamName}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          Cuarto {game.current_quarter || 1} · {game.location || "Cancha Principal"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  );
                })}

              {games.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-300" />
                  <p className="text-gray-400 font-bold">No hay actividad reciente</p>
                  <p className="text-xs text-gray-300 font-medium">Los partidos apareceran aqui cuando los crees</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DashboardCharts games={games} teams={teams} players={players} gamesLoading={gamesLoading} teamsLoading={teamsLoading} playersLoading={playersLoading} />

      <QuickActions />

      <DashboardFooter />
    </div>
  );
}