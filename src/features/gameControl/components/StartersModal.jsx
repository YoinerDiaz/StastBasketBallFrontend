import React, { useState, useEffect, useMemo } from "react";

export const StartersModal = ({
  isOpen,
  onClose,
  teamName,
  teamId,
  gamePlayers = [],
  onSaveStarters,
  isLoading,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtrar solo los jugadores de este equipo
  const teamGamePlayers = useMemo(() => {
    return gamePlayers.filter((gp) => gp.fk_id_team === teamId);
  }, [gamePlayers, teamId]);

  // Pre-cargar los titulares actuales cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      const currentStarters = teamGamePlayers
        .filter((gp) => gp.is_on_court)
        .map((gp) => gp.id_game_player);
      setSelectedIds(currentStarters);
    } else {
      setSelectedIds([]);
    }
  }, [isOpen, teamGamePlayers]);

  if (!isOpen) return null;

  const togglePlayer = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleSave = () => {
    if (selectedIds.length === 5) {
      onSaveStarters({ teamId, gamePlayerIds: selectedIds });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Quinteto Inicial - {teamName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona exactamente 5 jugadores para iniciar en cancha
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            selectedIds.length === 5
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}>
            {selectedIds.length} / 5
          </div>
        </div>

        {/* Players List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {teamGamePlayers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No hay jugadores registrados en este equipo para el partido.
            </p>
          ) : (
            teamGamePlayers.map((gp) => {
              const isSelected = selectedIds.includes(gp.id_game_player);
              const playerName = gp.player?.name || `Jugador #${gp.fk_id_player}`;
              const playerNumber = gp.player?.number ?? "-";
              const playerPos = gp.player?.position || "Jugador";

              return (
                <div
                  key={gp.id_game_player}
                  onClick={() => togglePlayer(gp.id_game_player)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-sky-500/10 border-sky-500 text-white shadow-sm"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-700 font-bold text-white flex items-center justify-center font-mono text-sm border border-slate-600">
                      {playerNumber}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">{playerName}</h4>
                      <span className="text-[11px] text-slate-400">{playerPos}</span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "border-slate-600 bg-slate-900"
                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedIds.length !== 5 || isLoading}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 active:scale-95 text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Guardando..." : "Confirmar Quinteto (5)"}
          </button>
        </div>
      </div>
    </div>
  );
};
