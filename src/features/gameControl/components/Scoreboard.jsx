import React from "react";

export const Scoreboard = ({
  homeTeam,
  awayTeam,
  liveStatus,
  currentQuarter,
  formatTime,
  isActive,
  onToggleTimer,
  onEndQuarter,
  isEndingQuarter,
  onFinishGame,
  isFinishingGame,
  gameStatus,
}) => {
  const homeScore = liveStatus?.score?.home ?? homeTeam?.score ?? 0;
  const awayScore = liveStatus?.score?.away ?? awayTeam?.score ?? 0;
  const homeFouls = liveStatus?.fouls?.home ?? 0;
  const awayFouls = liveStatus?.fouls?.away ?? 0;
  const homeBonus = liveStatus?.fouls?.home_bonus ?? homeFouls >= 5;
  const awayBonus = liveStatus?.fouls?.away_bonus ?? awayFouls >= 5;
  const quarter = liveStatus?.current_quarter ?? currentQuarter ?? 1;

  const getQuarterLabel = (q) => {
    if (q <= 4) return `CUARTO ${q}`;
    return `TIEMPO EXTRA ${q - 4}`;
  };

  const getQuarterColor = (q) => {
    if (q <= 4) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 border border-slate-800">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>MESA DE CONTROL EN VIVO</span>
        </div>
        <div className={`px-3 py-1 rounded-full border ${getQuarterColor(quarter)}`}>
          {getQuarterLabel(quarter)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Home Team */}
        <div className="flex flex-col items-center lg:items-end text-center lg:text-right bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <span className="text-xs font-bold text-sky-400 tracking-wider uppercase mb-1">LOCAL</span>
          <h2 className="text-2xl font-black text-white truncate max-w-[220px]">
            {homeTeam?.name || "Equipo Local"}
          </h2>
          <div className="text-6xl font-black text-sky-400 font-mono tracking-tight my-2">
            {homeScore}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Faltas: <strong className="text-white">{homeFouls}</strong></span>
            {homeBonus && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded animate-pulse">
                BONUS
              </span>
            )}
          </div>
        </div>

        {/* Center Clock & Quarter Controls */}
        <div className="flex flex-col items-center justify-center p-4 bg-black/70 rounded-xl border border-amber-500/30 shadow-inner">
          <span className="text-[11px] font-bold text-amber-500 tracking-widest uppercase mb-1">
            TIEMPO DE JUEGO
          </span>
          <div className="text-5xl lg:text-6xl font-black font-mono text-amber-400 tracking-wider">
            {formatTime()}
          </div>

          <div className="flex items-center gap-3 mt-4 w-full justify-center flex-wrap">
            <button
              onClick={onToggleTimer}
              disabled={gameStatus === "FINALIZADO"}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/40"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40"
              }`}
            >
              {gameStatus === "FINALIZADO" ? "PARTIDO FINALIZADO" : isActive ? "PAUSAR" : "INICIAR"}
            </button>

            {gameStatus !== "FINALIZADO" && (
              <button
                onClick={onEndQuarter}
                disabled={isEndingQuarter}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-all disabled:opacity-50"
                title="Finalizar cuarto y guardar minutos de jugadores"
              >
                {isEndingQuarter ? "Cerrando..." : "Fin de Cuarto"}
              </button>
            )}

            {gameStatus !== "FINALIZADO" && (
              <button
                onClick={onFinishGame}
                disabled={isFinishingGame}
                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold rounded-xl border border-rose-600 transition-all disabled:opacity-50"
                title="Finalizar partido ahora"
              >
                {isFinishingGame ? "Finalizando..." : "Finalizar Partido"}
              </button>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
          <span className="text-xs font-bold text-orange-400 tracking-wider uppercase mb-1">VISITANTE</span>
          <h2 className="text-2xl font-black text-white truncate max-w-[220px]">
            {awayTeam?.name || "Equipo Visitante"}
          </h2>
          <div className="text-6xl font-black text-orange-400 font-mono tracking-tight my-2">
            {awayScore}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Faltas: <strong className="text-white">{awayFouls}</strong></span>
            {awayBonus && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded animate-pulse">
                BONUS
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
