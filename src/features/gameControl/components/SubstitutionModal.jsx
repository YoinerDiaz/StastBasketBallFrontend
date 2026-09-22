import React, { useState } from "react";

export const SubstitutionModal = ({
  isOpen,
  onClose,
  gamePlayers = [],
  teamId,
  playerOut, // El GamePlayer que sale
  onConfirmSubstitution,
  isLoading
}) => {
  const [playerInId, setPlayerInId] = useState(null);

  if (!isOpen || !playerOut) return null;

  // Jugadores en la banca (mismo equipo, NO en cancha)
  const benchPlayers = gamePlayers.filter(
    (gp) => gp.fk_id_team === teamId && !gp.is_on_court
  );

  const handleConfirm = () => {
    if (playerInId) {
      onConfirmSubstitution(playerOut.id_game_player, playerInId);
      setPlayerInId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Sustitución</h3>
        
        {/* Jugador que sale */}
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-400 block mb-1">SALE (A LA BANCA):</span>
          <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
            <span className="w-8 h-8 rounded bg-red-900 text-red-200 font-bold flex items-center justify-center">
              {playerOut.player?.number ?? "-"}
            </span>
            <span className="text-sm font-semibold text-white">
              {playerOut.player?.name}
            </span>
          </div>
        </div>

        {/* Jugadores que entran */}
        <div className="mb-6">
          <span className="text-xs font-bold text-slate-400 block mb-1">ENTRA (AL CAMPO):</span>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {benchPlayers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay jugadores en la banca.</p>
            ) : (
              benchPlayers.map((gp) => (
                <div
                  key={gp.id_game_player}
                  onClick={() => setPlayerInId(gp.id_game_player)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                    playerInId === gp.id_game_player
                      ? "bg-emerald-900/30 border-emerald-500 text-white"
                      : "bg-slate-800 border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <span className="w-8 h-8 rounded bg-slate-700 text-slate-300 font-bold flex items-center justify-center">
                    {gp.player?.number ?? "-"}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {gp.player?.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              setPlayerInId(null);
              onClose();
            }}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!playerInId || isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {isLoading ? "Cambiando..." : "Confirmar Cambio"}
          </button>
        </div>
      </div>
    </div>
  );
};
