import React from 'react';

const PlayerRow = ({ player, onAction }) => {
    // 1. Accedemos al objeto anidado donde está el nombre y el número
    // Según tu JSON, 'player' es el objeto que recibimos por props,
    // y dentro tiene una propiedad llamada 'player' con la data básica.
    const infoBasica = player.player; 

    // 2. Extraemos los valores con nombres exactos de tu JSON
    const playerName = infoBasica?.name || "Sin Nombre";
    const playerNumber = infoBasica?.number !== undefined ? infoBasica.number : "??";

    // 3. Estilos dinámicos según si está en cancha (opcional)
    const rowClass = player.is_on_court 
        ? "bg-orange-50 border-l-4 border-orange-500" 
        : "bg-white";

    return (
        <tr className={`border-b hover:bg-gray-50 transition-colors ${rowClass}`}>
            {/* NÚMERO */}
            <td className="p-4 text-center font-black text-gray-700">
                #{playerNumber}
            </td>

            {/* NOMBRE */}
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 uppercase leading-none">
                        {playerName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">
                        ID: {player.fk_id_player}
                    </span>
                </div>
            </td>

            {/* ACCIONES (Ajusta los nombres de las acciones según tu backend) */}
            <td className="p-4">
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => onAction(player.id_game_player, '1pt')}
                        className="px-2 py-1 bg-gray-100 hover:bg-green-500 hover:text-white rounded text-[10px] font-bold transition-colors"
                    >
                        1PT
                    </button>
                    <button 
                        onClick={() => onAction(player.id_game_player, '2pt')}
                        className="px-2 py-1 bg-gray-100 hover:bg-green-600 hover:text-white rounded text-[10px] font-bold transition-colors"
                    >
                        2PT
                    </button>
                    <button 
                        onClick={() => onAction(player.id_game_player, '3pt')}
                        className="px-2 py-1 bg-gray-100 hover:bg-green-700 hover:text-white rounded text-[10px] font-bold transition-colors"
                    >
                        3PT
                    </button>
                    <button 
                        onClick={() => onAction(player.id_game_player, 'foul')}
                        className="px-2 py-1 bg-gray-100 hover:bg-red-600 hover:text-white rounded text-[10px] font-bold transition-colors"
                    >
                        F
                    </button>
                </div>
            </td>

            {/* PUNTOS TOTALES */}
            <td className="p-4 text-center">
                <span className="inline-block w-8 py-1 bg-blue-100 text-blue-700 rounded-lg font-black text-xs">
                    {player.points || 0}
                </span>
            </td>

            {/* FALTAS */}
            <td className="p-4 text-center">
                <span className={`inline-block w-8 py-1 rounded-lg font-black text-xs ${
                    (player.fouls || 0) >= 4 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {player.fouls || 0}
                </span>
            </td>
        </tr>
    );
};

export default PlayerRow;