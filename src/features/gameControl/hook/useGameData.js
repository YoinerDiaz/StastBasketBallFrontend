import { useState, useEffect } from 'react';
import { gameControlService } from '../api/gameControlService'; // Importa tu servicio

export const useGameData = (gameId) => {
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                
                // Ejecutamos ambas peticiones en paralelo para que sea más rápido
                const [gameData, playersData] = await Promise.all([
                    gameControlService.getGame(gameId),
                    gameControlService.getPlayersInGame(gameId) // ESTE es el que trae a Sergio, Pedro, etc.
                ]);

                setGame(gameData);
                setPlayers(playersData);
                
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (gameId) fetchAllData();
    }, [gameId]);

    return { game, players, isLoading, error };
};