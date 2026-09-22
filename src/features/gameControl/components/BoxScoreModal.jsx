import React, { useState } from "react";

export const BoxScoreModal = ({ isOpen, onClose, game, gamePlayers = [], boxScore = [] }) => {
  const [teamTab, setTeamTab] = useState("all");
  if (!isOpen) return null;

  const getStats = (gpId) =>
    boxScore.find((s) => s.fk_id_game_player === gpId) || {
      points_two_made: 0, points_two_attempts: 0,
      points_three_made: 0, points_three_attempts: 0,
      free_throw_made: 0, free_throw_attempts: 0,
      rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 0, minutes_played: 0,
    };

  const filtered = gamePlayers.filter((gp) => {
    if (teamTab === "home") return gp.fk_id_team === game?.fk_home_id_team;
    if (teamTab === "away") return gp.fk_id_team === game?.fk_away_id_team;
    return true;
  });

  const tabBtn = (key, label, color = "sky") => (
    <button
      onClick={() => setTeamTab(key)}
      className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
        teamTab === key
          ? `bg-slate-800 text-${color}-400 border-t-2 border-${color}-400`
          : "text-slate-400 hover:text-slate-200"
      }`}
    >{label}</button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Box Score</h3>
            <p className="text-xs text-slate-400">
              {game?.home_team?.name || "Local"} vs {game?.away_team?.name || "Visitante"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2">
          {tabBtn("all", "Todos")}
          {tabBtn("home", game?.home_team?.name || "Local")}
          {tabBtn("away", game?.away_team?.name || "Visitante", "orange")}
        </div>

        <div className="overflow-x-auto p-4 flex-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2 text-left">Jugador</th>
                <th className="py-2 px-1 text-center">MIN</th>
                <th className="py-2 px-1 text-center text-sky-400">PTS</th>
                <th className="py-2 px-1 text-center">2PT</th>
                <th className="py-2 px-1 text-center">3PT</th>
                <th className="py-2 px-1 text-center">TL</th>
                <th className="py-2 px-1 text-center">REB</th>
                <th className="py-2 px-1 text-center">AST</th>
                <th className="py-2 px-1 text-center">ROB</th>
                <th className="py-2 px-1 text-center">TAP</th>
                <th className="py-2 px-1 text-center">PER</th>
                <th className="py-2 px-1 text-center">FAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((gp) => {
                const s = getStats(gp.id_game_player);
                const pts = s.points_two_made * 2 + s.points_three_made * 3 + s.free_throw_made;
                return (
                  <tr key={gp.id_game_player} className="hover:bg-slate-800/40 text-slate-200">
                    <td className="py-2 px-2 font-bold text-slate-400">{gp.player?.number ?? "-"}</td>
                    <td className="py-2 px-2 font-sans font-medium text-white">
                      {gp.player?.name || `Jugador #${gp.fk_id_player}`}
                      {gp.is_on_court && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-400">{Math.round(s.minutes_played)}'</td>
                    <td className="py-2 px-1 text-center font-bold text-amber-400">{pts}</td>
                    <td className="py-2 px-1 text-center">{s.points_two_made}/{s.points_two_attempts}</td>
                    <td className="py-2 px-1 text-center">{s.points_three_made}/{s.points_three_attempts}</td>
                    <td className="py-2 px-1 text-center">{s.free_throw_made}/{s.free_throw_attempts}</td>
                    <td className="py-2 px-1 text-center">{s.rebounds}</td>
                    <td className="py-2 px-1 text-center">{s.assists}</td>
                    <td className="py-2 px-1 text-center">{s.steals}</td>
                    <td className="py-2 px-1 text-center">{s.blocks}</td>
                    <td className="py-2 px-1 text-center">{s.turnovers}</td>
                    <td className={`py-2 px-1 text-center font-bold ${s.fouls >= 5 ? "text-red-500" : "text-slate-300"}`}>{s.fouls}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

