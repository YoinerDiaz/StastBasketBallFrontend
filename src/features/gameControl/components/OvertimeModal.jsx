import React, { useState } from "react";

export const OvertimeModal = ({
  isOpen,
  onClose,
  onAddOvertime,
  onFinishGame,
  isLoading,
  homeScore,
  awayScore,
}) => {
  const [overtimeMinutes, setOvertimeMinutes] = useState(5);

  if (!isOpen) return null;

  const isTied = homeScore === awayScore;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-800/50 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {isTied ? "¡Partido Empatado!" : "Fin del Cuarto 4"}
          </h3>
          <p className="text-sm text-slate-400">
            {isTied 
              ? "El partido está empatado. ¿Quieres agregar tiempo extra?" 
              : "Se ha completado el tiempo reglamentario. ¿Qué deseas hacer?"}
          </p>
        </div>

        {/* Score Display */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Local</span>
              <div className="text-3xl font-black text-sky-400">{homeScore}</div>
            </div>
            <div className="text-xl font-bold text-slate-500">-</div>
            <div className="text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Visita</span>
              <div className="text-3xl font-black text-orange-400">{awayScore}</div>
            </div>
          </div>

          {/* Overtime Options */}
          {isTied && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Duración del Tiempo Extra
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setOvertimeMinutes(minutes)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      overtimeMinutes === minutes
                        ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {isTied && (
              <button
                onClick={() => onAddOvertime(overtimeMinutes * 60)}
                disabled={isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isLoading ? "Iniciando..." : `Agregar Tiempo Extra (${overtimeMinutes} min)`}
              </button>
            )}
            
            <button
              onClick={onFinishGame}
              disabled={isLoading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isLoading ? "Finalizando..." : "Finalizar Partido"}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};