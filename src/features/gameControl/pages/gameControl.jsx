import React from "react";
import { useParams } from "react-router-dom";
// Añade esta línea:
import { useGameTimer } from "../hook/useGameTimer"; 

const GameControl = () => {
    const { gameId } = useParams();
    
    // Aquí inicializas el hook
    const { formatTime, isActive, toggleTimer } = useGameTimer(10); 

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Control del Partido: {gameId}</h1>
            
            <div className="mt-6 p-6 bg-black text-orange-500 rounded-lg text-center">
                <p className="text-6xl font-mono">{formatTime()}</p>
                <button 
                    onClick={toggleTimer}
                    className={`mt-4 px-6 py-2 rounded font-bold text-white ${
                        isActive ? 'bg-red-500' : 'bg-green-500'
                    }`}
                >
                    {isActive ? 'PAUSAR' : 'INICIAR'}
                </button>
            </div>
        </div>
    );
};

export default GameControl;