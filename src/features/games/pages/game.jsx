import { Link, useNavigate } from "react-router-dom";
import { useGames, useDeleteGame } from "../hooks/useGames";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Play, 
  Plus, 
  Trash2, 
  Loader2, 
  Clock, 
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Home
} from "lucide-react";

export default function Game() {
  const navigate = useNavigate();
  const { data: games = [], isLoading, isError } = useGames();
  const deleteGameMutation = useDeleteGame();

  const handleDelete = (e, gameId) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de eliminar este partido?")) {
      deleteGameMutation.mutate(gameId);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no definida";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
      case "live":
      case "en_progreso":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            En Vivo
          </span>
        );
      case "finished":
      case "finalizado":
        return (
          <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-gray-500" />
            Finalizado
          </span>
        );
      case "expirado":
        return (
          <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            Expirado
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Clock className="w-3 h-3 text-green-600" />
            Programado
          </span>
        );
    }
  };

  const activeGames = games?.filter(g => ["programado", "en_progreso"].includes(g.status?.toLowerCase())) || [];
  const historyGames = games?.filter(g => ["finalizado", "expirado"].includes(g.status?.toLowerCase())) || [];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 bg-gray-50 min-h-screen">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600 mt-1"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 text-[#008000] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Matchday Central
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
              Gestión de Partidos
            </h1>
            <p className="text-gray-400 text-xs font-semibold">
              Control de encuentros, pizarras en tiempo real y calendario
            </p>
          </div>
        </div>

        <Link
          to="/games/createGame?mode=now"
          className="flex items-center gap-2 bg-[#008000] hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Partido
        </Link>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/games/createGame?mode=now"
          className="group relative flex items-center justify-between p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-[2.5rem] shadow-xl shadow-green-100 active:scale-[0.99] transition-all overflow-hidden"
        >
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black">
              <Play className="w-7 h-7 fill-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-green-200">Acción Rápida</span>
              <h3 className="text-white font-black uppercase text-lg tracking-wide">Jugar Ahora</h3>
              <p className="text-green-100 text-xs">Crea el partido y salta a la mesa de control</p>
            </div>
          </div>
          <span className="text-white/30 text-7xl font-black group-hover:translate-x-2 transition-transform select-none">
            LIVE
          </span>
        </Link>

        <Link
          to="/games/createGame?mode=schedule"
          className="group flex items-center justify-between p-6 bg-white border border-gray-100 hover:border-green-300 rounded-[2.5rem] shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Próximos Días</span>
              <h3 className="text-gray-900 font-black uppercase text-lg tracking-wide">Programar Juego</h3>
              <p className="text-gray-400 text-xs">Reserva fecha, hora y ubicación</p>
            </div>
          </div>
          <span className="text-gray-100 text-7xl font-black group-hover:translate-x-2 transition-transform select-none">
            CAL
          </span>
        </Link>
      </section>

      {/* LISTA DE PARTIDOS ACTIVOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Cartelera de Juegos ({activeGames.length})
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#008000]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Cargando partidos...
            </span>
          </div>
        ) : isError ? (
          <div className="py-16 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-bold">No se pudieron cargar los partidos del servidor.</p>
          </div>
        ) : activeGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGames.map((game) => {
              const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
              const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
              const homeScore = game.home_score ?? 0;
              const awayScore = game.away_score ?? 0;
              const gameId = game.id_game || game.id;

              return (
                <div
                  key={gameId}
                  onClick={() => navigate(`/game-control/${gameId}`)}
                  className="group relative bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-5"
                >
                  <div className="flex items-center justify-between">
                    {getStatusBadge(game.status)}

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {game.location || "Cancha Principal"}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, gameId)}
                        className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar partido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        LOCAL
                      </span>
                      <h4 className="text-lg font-black text-gray-800 truncate" title={homeTeamName}>
                        {homeTeamName}
                      </h4>
                    </div>

                    <div className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-900">{homeScore}</span>
                      <span className="text-xs font-black text-gray-300">-</span>
                      <span className="text-2xl font-black text-gray-900">{awayScore}</span>
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        VISITANTE
                      </span>
                      <h4 className="text-lg font-black text-gray-800 truncate" title={awayTeamName}>
                        {awayTeamName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(game.date)}
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-green-50 group-hover:bg-[#008000] text-[#008000] group-hover:text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all">
                      <Activity className="w-3.5 h-3.5" />
                      MESA DE CONTROL
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-[#008000]">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-700 uppercase tracking-wide">
                No hay partidos registrados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Crea tu primer partido para comenzar a recopilar estadísticas en tiempo real
              </p>
            </div>
            <Link
              to="/games/createGame?mode=now"
              className="mt-2 text-xs font-black text-[#008000] bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition"
            >
              + Crear Partido Ahora
            </Link>
          </div>
        )}
      </section>
      {/* LISTA DE PARTIDOS HISTÓRICOS */}
      {historyGames.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                Historial de Partidos ({historyGames.length})
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity">
            {historyGames.map((game) => {
              const homeTeamName = game.home_team?.name || `Equipo #${game.fk_home_id_team || "Local"}`;
              const awayTeamName = game.away_team?.name || `Equipo #${game.fk_away_id_team || "Visitante"}`;
              const homeScore = game.home_score ?? 0;
              const awayScore = game.away_score ?? 0;
              const gameId = game.id_game || game.id;

              return (
                <div
                  key={gameId}
                  onClick={() => navigate(`/game-control/${gameId}`)}
                  className="group relative bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100 hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between gap-5"
                >
                  <div className="flex items-center justify-between">
                    {getStatusBadge(game.status)}
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {game.location || "Cancha Principal"}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, gameId)}
                        className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar partido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        LOCAL
                      </span>
                      <h4 className="text-lg font-black text-gray-800 truncate" title={homeTeamName}>
                        {homeTeamName}
                      </h4>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4">
                      <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase mb-1">
                        SCORE
                      </span>
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-inner">
                        <span className="text-2xl font-black text-gray-900 w-8 text-center">{homeScore}</span>
                        <span className="text-sm font-black text-gray-300">-</span>
                        <span className="text-2xl font-black text-gray-900 w-8 text-center">{awayScore}</span>
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        VISITANTE
                      </span>
                      <h4 className="text-lg font-black text-gray-800 truncate" title={awayTeamName}>
                        {awayTeamName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-500 capitalize">
                        {formatDate(game.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
