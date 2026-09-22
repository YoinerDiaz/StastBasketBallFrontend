import React from "react";

export const PlayerActionCard = ({
  gamePlayer,
  stats,
  onRecordEvent,
  onOpenSubstitution,
  teamColor = "sky",
  isRecording,
}) => {
  const player = gamePlayer?.player || {};
  const name = player.name || `Jugador #${gamePlayer.fk_id_player}`;
  const num = player.number ?? "-";
  const pos = player.position || "Jugador";

  const pts = stats
    ? stats.points_two_made * 2 + stats.points_three_made * 3 + stats.free_throw_made
    : 0;
  const reb = stats?.rebounds ?? 0;
  const ast = stats?.assists ?? 0;
  const fouls = stats?.fouls ?? 0;

  const act = (t) => onRecordEvent({
    event_type: t,
    fk_id_game_player_events: gamePlayer.id_game_player,
  });

  const isSky = teamColor === "sky";

  return (
    <div className={`rounded-xl p-3 border transition-all ${
      isSky ? "bg-slate-900 border-slate-800" : "bg-slate-900 border-slate-800"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg font-mono font-black text-sm flex items-center justify-center border ${
            isSky ? "bg-sky-500/20 text-sky-400 border-sky-500/40" : "bg-orange-500/20 text-orange-400 border-orange-500/40"
          }`}>
            {num}
          </span>
          <div>
            <h4 className="font-bold text-white text-xs truncate max-w-[110px]">{name}</h4>
            <span className="text-[10px] text-slate-400">{pos}</span>
          </div>
        </div>
        <button
          onClick={() => onOpenSubstitution(gamePlayer)}
          className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
        >
          Cambio
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 bg-slate-800/50 p-1.5 rounded-lg mb-2 text-center font-mono text-xs">
        <div><span className="block text-[9px] text-slate-400">PTS</span><strong className="text-white">{pts}</strong></div>
        <div><span className="block text-[9px] text-slate-400">REB</span><strong className="text-white">{reb}</strong></div>
        <div><span className="block text-[9px] text-slate-400">AST</span><strong className="text-white">{ast}</strong></div>
        <div><span className="block text-[9px] text-slate-400">FAL</span><strong className={fouls >= 5 ? "text-red-400 font-bold" : "text-white"}>{fouls}</strong></div>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-1.5">
        <div className="flex flex-col gap-1">
          <button onClick={() => act("two_made")} disabled={isRecording} className="py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded">+2</button>
          <button onClick={() => act("two_missed")} disabled={isRecording} className="py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-700">Fallo 2</button>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => act("three_made")} disabled={isRecording} className="py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded">+3</button>
          <button onClick={() => act("three_missed")} disabled={isRecording} className="py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-700">Fallo 3</button>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => act("free_made")} disabled={isRecording} className="py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded">+1 TL</button>
          <button onClick={() => act("free_missed")} disabled={isRecording} className="py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-700">Fallo TL</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <button onClick={() => act("rebound")} disabled={isRecording} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded border border-slate-700">REB</button>
        <button onClick={() => act("assist")} disabled={isRecording} className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded border border-slate-700">AST</button>
        <button onClick={() => act("foul")} disabled={isRecording} className="py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-[11px] rounded">FALTA</button>
        <button onClick={() => act("steal")} disabled={isRecording} className="py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-800">ROB</button>
        <button onClick={() => act("block")} disabled={isRecording} className="py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-800">TAP</button>
        <button onClick={() => act("turnover")} disabled={isRecording} className="py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-800">PÉR</button>
      </div>
    </div>
  );
};
