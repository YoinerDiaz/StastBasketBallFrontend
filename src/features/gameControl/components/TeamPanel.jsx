import React from "react";
import { PlayerActionCard } from "./PlayerActionCard";

const TeamPanel = ({
  label,
  color,
  players,
  statsMap,
  onRecordEvent,
  onOpenSubstitution,
  onDefineStarters,
  isRecording,
}) => {
  const textColor = color === "sky" ? "text-sky-400" : "text-orange-400";
  const dotColor = color === "sky" ? "bg-sky-400" : "bg-orange-400";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <h2 className={`text-sm font-black uppercase tracking-wider ${textColor}`}>
          {label} — En Cancha ({players.length}/5)
        </h2>
      </div>

      {players.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 text-sm">
          <span>No hay titulares. </span>
          <button onClick={onDefineStarters} className={`${textColor} hover:underline`}>
            Definir Quinteto →
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <button 
              onClick={onDefineStarters}
              className={`text-xs font-semibold ${textColor} hover:underline flex items-center gap-1`}
            >
              ✏️ Editar Titulares
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((gp) => (
              <PlayerActionCard
                key={gp.id_game_player}
                gamePlayer={gp}
                stats={statsMap?.[gp.id_game_player]}
                onRecordEvent={onRecordEvent}
                onOpenSubstitution={onOpenSubstitution}
                teamColor={color}
                isRecording={isRecording}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TeamPanel;
