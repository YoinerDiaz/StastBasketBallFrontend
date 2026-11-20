import { useEffect, useState } from 'react';
import { gameControlService } from '../api/gameControlService';

export const useGameData = (gameId) => {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showFeedback = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchAllData = async () => {
    if (!gameId || gameId === "undefined") return;
    try {
      setIsLoading(true);
      const [gameData, rawPlayersData] = await Promise.all([
        gameControlService.getGame(gameId),
        gameControlService.getPlayersInGame(gameId)
      ]);

      setGame(gameData);

      const normalizedPlayers = (rawPlayersData || []).map(item => {
        const p = item.player || item.players || item;

        return {
          ...item,
          id: item.id_game_player || item.fk_id_game_player_events || item.id || p.id,
          id_game_player: item.id_game_player || item.fk_id_game_player_events || item.id || p.id,
          player_id: item.player_id || item.fk_id_player || p.id,
          team_id: item.team_id || item.fk_id_team || item.teamId || p.team_id,
          name: p.name || p.full_name || p.first_name || item.name || "Jugador",
          number: p.number || p.jersey_number || p.dorsal || item.number || "00",
          is_on_court: Boolean(item.is_on_court)
        };
      });

      setPlayers(normalizedPlayers);
    } catch (err) {
      console.error("Error al cargar datos del partido/jugadores:", err);
      setError(err);
      showFeedback('error', 'Error al cargar los datos del partido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [gameId]);

  const mapStatToBackendEnum = (statKey) => {
    const key = statKey.toLowerCase();

    if (key.includes('three_made') || key === '3' || key === '+3') return 'three_made';
    if (key.includes('three_missed') || key.includes('three_attempts')) return 'three_missed';

    if (key.includes('two_made') || key === '2' || key === '+2') return 'two_made';
    if (key.includes('two_missed') || key.includes('two_attempts')) return 'two_missed';

    if (key.includes('free_made') || key.includes('one_made') || key === '1' || key === '+1') return 'free_made';
    if (key.includes('free_missed') || key.includes('free_attempts')) return 'free_missed';

    if (key.includes('assist') || key === 'ast') return 'assist';
    if (key.includes('rebound') || key === 'reb' || key === 're') return 'rebound';
    if (key.includes('steal') || key === 'stl') return 'steal';
    if (key.includes('block') || key === 'blk') return 'block';
    if (key.includes('turnover') || key === 'to') return 'turnover';
    if (key.includes('foul') || key === 'pf' || key === 'f') return 'foul';

    return statKey;
  };

  const recordPlayerStat = async (idGamePlayer, statKey, value = 1, currentQuarter = 1) => {
    const parsedId = Number(idGamePlayer);
    const backendEventType = mapStatToBackendEnum(statKey);
    const player = players.find(p => Number(p.id_game_player) === parsedId || Number(p.id) === parsedId);
    const playerName = player ? player.name : `Jugador #${parsedId}`;

    try {
      if (!player || !player.is_on_court) {
        console.warn(`Jugador ${playerName} no está en cancha. La estadística se registrará pero no se cambiará su estado automáticamente.`);
      }

      const eventPayload = {
        fk_id_game_player_events: parsedId,
        event_type: backendEventType,
        quarter: Number(currentQuarter)
      };

      const response = await gameControlService.createEvent(eventPayload);
      showFeedback('success', `✓ Evento registrado para ${playerName}`);
      await fetchAllData();
      return response;

    } catch (err) {
      const backendMessage = err.response?.data?.detail 
        || (Array.isArray(err.response?.data?.detail) ? err.response?.data?.detail[0]?.msg : null)
        || "Error al registrar el evento en el servidor.";

      console.error("Error al registrar estadística en Backend:", err);
      showFeedback('error', `❌ ${playerName}: ${backendMessage}`);
      throw err;
    }
  };

  // ✅ GUARDA LOS TITULARES GARANTIZANDO AMBOS FORMATOS COMPATIBLES CON FASTAPI
  const setStarters = async (teamId, playerIds) => {
    try {
      // Normalizar IDs a números enteros
      const numericIds = playerIds.map(id => Number(id));

      let res;
      if (typeof gameControlService.setStarters === 'function') {
        // Pasa tanto el array como el objeto para cubrir la firma requerida por axios
        res = await gameControlService.setStarters(gameId, teamId, { starter_ids: numericIds }, numericIds);
      }

      showFeedback('success', 'Titulares guardados correctamente');
      await fetchAllData();
      return res;
    } catch (err) {
      console.error("Error al guardar titulares en BD:", err);
      const msg = err.response?.data?.detail || 'Error al guardar los titulares';
      showFeedback('error', `❌ ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
      throw err;
    }
  };

  return { 
    game, 
    players, 
    isLoading, 
    error, 
    notification,
    refetch: fetchAllData,
    recordPlayerStat,
    setStarters,
    saveStarters: setStarters // Alias de compatibilidad
  };
};