import { ArrowRightLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { gameControlService } from "../api/gameControlService";
import SubstitutionModal from '../components/SubstitutionModal';
import { useGameData } from "../hook/useGameData";


export default function GameControl() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const { 
    game, 
    players = [], 
    isLoading, 
    error, 
    recordPlayerStat, 
    updateScore,
  } = useGameData(gameId);

  // Marcadores y Faltas Colectivas
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeFouls, setHomeFouls] = useState(0);
  const [awayFouls, setAwayFouls] = useState(0);
  
  // Periodos
  const [quarter, setQuarter] = useState(1);

  // Cronómetros
  const [timeLeft, setTimeLeft] = useState(600);
  const [shotClock, setShotClock] = useState(24);
  const [isRunning, setIsRunning] = useState(false);
  // Los botones de alineación solo existen antes de que el partido arranque.
  const [hasGameStarted, setHasGameStarted] = useState(false);

  // Modales independientes para cada equipo
  const [roster, setRoster] = useState([]);
  const [showHomeRosterModal, setShowHomeRosterModal] = useState(false);
  const [showAwayRosterModal, setShowAwayRosterModal] = useState(false);
  const [showEndPeriodModal, setShowEndPeriodModal] = useState(false);

  // Errores de validación y carga
  const [homeError, setHomeError] = useState("");
  const [awayError, setAwayError] = useState("");
  const [isSubmittingHome, setIsSubmittingHome] = useState(false);
  const [isSubmittingAway, setIsSubmittingAway] = useState(false);
  const [isFinishingGame, setIsFinishingGame] = useState(false);

  // Historial para Deshacer
  const [actionHistory, setActionHistory] = useState([]);

  // Modales de Sustitución
  const [showHomeSubModal, setShowHomeSubModal] = useState(false);
  const [showAwaySubModal, setShowAwaySubModal] = useState(false);
  const [forcedHomePlayerOut, setForcedHomePlayerOut] = useState(null);
  const [forcedAwayPlayerOut, setForcedAwayPlayerOut] = useState(null);
  // Flag para prevenir que el reloj se reinicie al actualizar el juego desde el backend
  const isGameInitialized = useRef(false);

  // Carga e Inicialización Inicial
  useEffect(() => {
    if (game && !isGameInitialized.current) {
      setHomeScore(game.home_score ?? 0);
      setAwayScore(game.away_score ?? 0);
      setQuarter(game.current_quarter || 1);
      if (game.remaining_time_seconds !== undefined && game.remaining_time_seconds !== null) {
        setTimeLeft(game.remaining_time_seconds);
      }
      isGameInitialized.current = true;
      if (String(game.status || "").toUpperCase() !== "SCHEDULED") {
        setHasGameStarted(true);
      }
    }

    if (players && players.length > 0 && roster.length === 0) {
      const initialRoster = players.map((p) => ({
        id_game_player: p.id_game_player || p.id,
        id_player: p.id_player || p.player_id,
        name: p.name || p.player_name || "Jugador",
        number: p.number || p.jersey_number || "00",
        fk_id_team: p.fk_id_team || p.team_id,
        is_on_court: Boolean(p.is_on_court),
        stats: {
          points_two_made: p.stats?.points_two_made || 0,
          points_two_attempts: p.stats?.points_two_attempts || 0,
          points_three_made: p.stats?.points_three_made || 0,
          points_three_attempts: p.stats?.points_three_attempts || 0,
          free_throw_made: p.stats?.free_throw_made || 0,
          free_throw_attempts: p.stats?.free_throw_attempts || 0,
          rebounds: p.stats?.rebounds || 0,
          assists: p.stats?.assists || 0,
          steals: p.stats?.steals || 0,
          blocks: p.stats?.blocks || 0,
          turnovers: p.stats?.turnovers || 0,
          fouls: p.stats?.fouls || 0,
        },
      }));
      setRoster(initialRoster);
    }
  }, [game, players, roster.length]);


    // Auto-Trigger de modales de titulares para juegos programados
    useEffect(() => {
      if (game && game.status === 'SCHEDULED' && roster.length > 0) {
        const homeCourtCount = roster.filter(p => p.fk_id_team === game.fk_home_id_team && p.is_on_court).length;
        const awayCourtCount = roster.filter(p => p.fk_id_team === game.fk_away_id_team && p.is_on_court).length;

        if (homeCourtCount !== 5) {
          setShowHomeRosterModal(true);
        }
        if (awayCourtCount !== 5) {
          setShowAwayRosterModal(true);
        }
      }
    }, [game, roster]);

    useEffect(() => {
      if (!hasGameStarted) return;
      setShowHomeRosterModal(false);
      setShowAwayRosterModal(false);
    }, [hasGameStarted]);

  // Manejo del Tiempo
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setShotClock((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowEndPeriodModal(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const homeTeamId = game?.fk_home_id_team;
  const awayTeamId = game?.fk_away_id_team;

  const homePlayers = roster.filter((p) => p.fk_id_team === homeTeamId);
  const awayPlayers = roster.filter((p) => p.fk_id_team === awayTeamId);

  const homeCourt = homePlayers.filter((p) => p.is_on_court);
  const awayCourt = awayPlayers.filter((p) => p.is_on_court);

  const toggleCourtStatus = (id_game_player) => {
    setRoster((prev) =>
      prev.map((p) =>
        p.id_game_player === id_game_player
          ? { ...p, is_on_court: !p.is_on_court }
          : p
      )
    );
  };

  const handleStartClock = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (homeCourt.length !== 5) {
      setHomeError(`Se requieren exactamente 5 titulares (Actual: ${homeCourt.length})`);
      setShowHomeRosterModal(true);
      return;
    }
    if (awayCourt.length !== 5) {
      setAwayError(`Se requieren exactamente 5 titulares (Actual: ${awayCourt.length})`);
      setShowAwayRosterModal(true);
      return;
    }

    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    if (nextIsRunning) {
      setHasGameStarted(true);
    }

    // Si se está iniciando el partido por primera vez, actualizar estado a IN_PROGRESS
    if (nextIsRunning && String(game?.status || '').toUpperCase() !== "IN_PROGRESS") {
      try {
        if (typeof gameControlService.updateGameStatus === "function") {
          await gameControlService.updateGameStatus(gameId, "IN_PROGRESS");
        } else if (typeof gameControlService.updateGame === "function") {
          await gameControlService.updateGame(gameId, { status: "IN_PROGRESS" });
        }
      } catch (err) {
        console.error("Error al actualizar estado del partido a IN_PROGRESS:", err);
      }
    }
  };

  // FINALIZAR PARTIDO Y CAMBIAR ESTADO A FINISHED EN LA BASE DE DATOS
  const handleFinishGame = async () => {
    setIsFinishingGame(true);
    try {
      if (typeof gameControlService.finishGame === "function") {
        await gameControlService.finishGame(gameId, {
          home_score: homeScore,
          away_score: awayScore,
          status: "FINISHED",
          winner_id: homeScore > awayScore ? homeTeamId : awayTeamId,
        });
      } else if (typeof gameControlService.updateGameStatus === "function") {
        await gameControlService.updateGameStatus(gameId, "FINISHED");
      }
    } catch (err) {
      console.error("Error al finalizar el partido en el servidor:", err);
    } finally {
      setIsFinishingGame(false);
      navigate(`/game-summary/${gameId}`);
    }
  };

  // CONFIRMAR TITULARES EQUIPO LOCAL
  const handleConfirmHomeStarters = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (homeCourt.length !== 5) {
      setHomeError(`Debes seleccionar 5 titulares. Actualmente seleccionados: ${homeCourt.length}/5`);
      return;
    }

    setHomeError("");
    setIsSubmittingHome(true);

    try {
      await gameControlService.setStarters(gameId, homeTeamId, homeCourt.map((p) => p.id_game_player || p.id_player));
      setShowHomeRosterModal(false);
    } catch (err) {
      console.error("Error al guardar titulares locales:", err);
      setHomeError("Error al guardar titulares en la base de datos.");
    } finally {
      setIsSubmittingHome(false);
    }
  };

  // MANEJAR CONFIRMACIÓN DE SUSTITUCIÓN MANUAL O FORZADA
  const handleConfirmSubstitution = async (playerOutId, playerInId) => {
    setIsRunning(false);
    try {
      await gameControlService.substituteGame(gameId, playerOutId, playerInId, timeLeft);
      setRoster(prev => prev.map(p => {
        if (p.id_game_player === playerOutId) return { ...p, is_on_court: false };
        if (p.id_game_player === playerInId) return { ...p, is_on_court: true, lastEntryTimeSeconds: timeLeft };
        return p;
      }));
      if (playerOutId === forcedHomePlayerOut) setForcedHomePlayerOut(null);
      if (playerOutId === forcedAwayPlayerOut) setForcedAwayPlayerOut(null);
      setShowHomeSubModal(false);
      setShowAwaySubModal(false);
      toast.success("Sustitución realizada con éxito.");
    } catch (err) {
      console.error('Error durante la sustitución:', err);
      toast.error("Error al procesar la sustitución.");
    }
  };

  // CONFIRMAR TITULARES EQUIPO VISITANTE
  const handleConfirmAwayStarters = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (awayCourt.length !== 5) {
      setAwayError(`Debes seleccionar 5 titulares. Actualmente seleccionados: ${awayCourt.length}/5`);
      return;
    }

    setAwayError("");
    setIsSubmittingAway(true);

    try {
      await gameControlService.setStarters(gameId, awayTeamId, awayCourt.map((p) => p.id_game_player || p.id_player));
      setShowAwayRosterModal(false);
    } catch (err) {
      console.error("Error al guardar titulares visitantes:", err);
      setAwayError("Error al guardar titulares en la base de datos.");
    } finally {
      setIsSubmittingAway(false);
    }
  };

  // REGISTRAR ESTADÍSTICA DE JUGADOR (BLOQUEADO SI !isRunning)
  const recordStat = (e, id_game_player, statKey, isScoreChange = false, pts = 0, isFoul = false) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isRunning) return; // Protección adicional

    const player = roster.find((p) => p.id_game_player === id_game_player);
    if (!player) return;

    if (typeof recordPlayerStat === "function") {
      recordPlayerStat(id_game_player, statKey, 1, quarter);
    }

    const actionLog = {
      id_game_player,
      playerName: player.name,
      playerNumber: player.number,
      teamId: player.fk_id_team,
      statKey,
      isScoreChange,
      pts,
      isFoul,
    };

    setActionHistory((prev) => [actionLog, ...prev]);

    setRoster((prev) =>
      prev.map((p) => {
        if (p.id_game_player !== id_game_player) return p;

        const s = { ...p.stats };

        if (statKey in s) {
          s[statKey] += 1;
        }

        if (isScoreChange) {
          if (statKey === "free_throw_made") s.free_throw_attempts += 1;
          if (statKey === "points_two_made") s.points_two_attempts += 1;
          if (statKey === "points_three_made") s.points_three_attempts += 1;

          if (p.fk_id_team === homeTeamId) {
            setHomeScore((sc) => {
              const newScore = sc + pts;
              if (typeof updateScore === "function") updateScore(homeTeamId, newScore);
              return newScore;
            });
          } else {
            setAwayScore((sc) => {
              const newScore = sc + pts;
              if (typeof updateScore === "function") updateScore(awayTeamId, newScore);
              return newScore;
            });
          }
        }

        if (isFoul) {
          if (p.fk_id_team === homeTeamId) {
            setHomeFouls((f) => f + 1);
          } else {
            setAwayFouls((f) => f + 1);
          }

          if (s.fouls >= 5) {
            setIsRunning(false);
            if (typeof gameControlService.updateGameTime === 'function') {
              gameControlService.updateGameTime(gameId, timeLeft, true).catch(() => {});
            }
            toast.error(`¡${p.name} ha alcanzado 5 faltas! Sustitución obligatoria.`);
            if (p.fk_id_team === homeTeamId) {
              setForcedHomePlayerOut(p.id_game_player);
              setShowHomeSubModal(true);
            } else {
              setForcedAwayPlayerOut(p.id_game_player);
              setShowAwaySubModal(true);
            }
          }
        }

        return { ...p, stats: s };
      })
    );
  };

  // DESHACER (UNDO)
  const handleUndo = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[0];

    if (lastAction.isScoreChange) {
      if (lastAction.teamId === homeTeamId) {
        setHomeScore((sc) => {
          const newScore = Math.max(0, sc - lastAction.pts);
          if (typeof updateScore === "function") updateScore(homeTeamId, newScore);
          return newScore;
        });
      } else {
        setAwayScore((sc) => {
          const newScore = Math.max(0, sc - lastAction.pts);
          if (typeof updateScore === "function") updateScore(lastAction.teamId, newScore);
          return newScore;
        });
      }
    }

    if (lastAction.isFoul) {
      if (lastAction.teamId === homeTeamId) {
        setHomeFouls((f) => Math.max(0, f - 1));
      } else {
        setAwayFouls((f) => Math.max(0, f - 1));
      }
    }

    setRoster((prev) =>
      prev.map((p) => {
        if (p.id_game_player !== lastAction.id_game_player) return p;

        const s = { ...p.stats };

        if (lastAction.statKey in s) {
          s[lastAction.statKey] = Math.max(0, s[lastAction.statKey] - 1);
        }

        if (lastAction.isScoreChange) {
          if (lastAction.statKey === "free_throw_made") s.free_throw_attempts = Math.max(0, s.free_throw_attempts - 1);
          if (lastAction.statKey === "points_two_made") s.points_two_attempts = Math.max(0, s.points_two_attempts - 1);
          if (lastAction.statKey === "points_three_made") s.points_three_attempts = Math.max(0, s.points_three_attempts - 1);
        }

        return { ...p, stats: s };
      })
    );

    setActionHistory((prev) => prev.slice(1));
  }, [actionHistory, homeTeamId, updateScore]);

  // CTRL + Z
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  const handleAdvancePeriod = async (isOvertime = false) => {
    setIsRunning(false);
    setHomeFouls(0);
    setAwayFouls(0);

    const nextQuarter = quarter + 1;
    setQuarter(nextQuarter);
    setTimeLeft(isOvertime ? 300 : 600);
    setShotClock(24);
    setShowEndPeriodModal(false);

    try {
      if (isOvertime && typeof gameControlService.startOvertime === "function") {
        await gameControlService.startOvertime(gameId, nextQuarter - 4);
      } else if (typeof gameControlService.advanceQuarter === "function") {
        await gameControlService.advanceQuarter(gameId);
      } else if (typeof gameControlService.updateQuarter === "function") {
        await gameControlService.updateQuarter(gameId, nextQuarter);
      }
    } catch (err) {
      console.error("Error al sincronizar cambio de periodo con backend:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] text-[#F26513] font-bold">
        <div className="w-10 h-10 border-4 border-[#F26513] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="tracking-widest uppercase text-xs text-[#01050D]">Cargando Mesa de Control...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA] text-[#D93D04] font-bold">
        Error al cargar los datos del encuentro.
      </div>
    );
  }

  const isTied = homeScore === awayScore;
  const isRegularTimeEnd = quarter >= 4;

  const getQuarterLabel = (q) => {
    if (q <= 4) return `PERIODO ${q}`;
    return `TIEMPO EXTRA ${q - 4} (OT${q - 4})`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#01050D] p-3 md:p-5 flex flex-col justify-between font-sans select-none">
      
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
        <button
          type="button"
          onClick={() => navigate("/games")}
          className="bg-white border border-slate-300 hover:bg-slate-100 text-[#01050D] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
        >
          Volver
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={actionHistory.length === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 border ${
              actionHistory.length > 0
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 shadow-sm cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
            }`}
          >
            <span>↩ DESHACER</span>
          </button>

          {!hasGameStarted && (
            <>
              <button
                type="button"
                onClick={() => setShowHomeRosterModal(true)}
                className="bg-[#F26513]/10 border border-[#F26513]/30 text-[#F26513] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#F26513]/20 transition"
              >
                Alineación Local ({homeCourt.length}/5)
              </button>

              <button
                type="button"
                onClick={() => setShowAwayRosterModal(true)}
                className="bg-[#F26513]/10 border border-[#F26513]/30 text-[#F26513] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#F26513]/20 transition"
              >
                Alineación Visitante ({awayCourt.length}/5)
              </button>
            </>
          )}

          <span className="bg-[#01050D] text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
            {getQuarterLabel(quarter)}
          </span>

          <button
            type="button"
            onClick={() => setShowEndPeriodModal(true)}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#01050D] px-3 py-1.5 rounded-xl text-xs font-black uppercase transition"
          >
            Finalizar Periodo ➔
          </button>
        </div>

        <div className="w-28" aria-hidden="true" />
      </header>

      {/* CONSOLA CENTRAL DE CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
        {/* LOCAL */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F26513]">LOCAL</span>
              <h2 className="text-lg font-black text-[#01050D] uppercase truncate max-w-[180px]">
                {game?.home_team?.name || "Local"}
              </h2>
            </div>
            {homeFouls >= 5 && (
              <span className="bg-[#731702] text-white font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-widest animate-pulse">
                BONUS
              </span>
            )}
          </div>

          <div className="text-center my-2">
            <span className="text-6xl font-mono font-black tracking-tighter text-[#01050D]">
              {homeScore}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs mb-2">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Faltas Colectivas</span>
            <span className="font-mono font-black text-[#D93D04] text-sm">{homeFouls}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHomeSubModal(true)}
            className="w-full bg-[#01050D] hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Cambiar Jugador
          </button>
        </div>

        {/* RELOJ Y POSESIÓN */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {quarter > 4 ? "TIEMPO EXTRA" : "CRONÓMETRO"}
          </span>
          
          <div className="text-center my-1">
            <div className={`text-5xl font-mono font-black tracking-widest ${isRunning ? "text-[#01050D]" : "text-amber-500 animate-pulse"}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`font-mono font-black text-lg px-2.5 py-0.5 rounded border ${
                shotClock <= 5 
                  ? "bg-[#731702]/10 text-[#731702] border-[#731702]/30 animate-pulse" 
                  : "bg-slate-100 text-[#01050D] border-slate-200"
              }`}>
                {shotClock}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full mt-2">
            <button
              type="button"
              onClick={handleStartClock}
              className={`flex-1 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition ${
                isRunning
                  ? "bg-[#D93D04] text-white hover:bg-[#731702]"
                  : "bg-[#F26513] text-white hover:bg-[#D93D04] animate-bounce"
              }`}
            >
              {isRunning ? "PAUSAR TIEMPO" : "INICIAR TIEMPO"}
            </button>
            <button
              type="button"
              onClick={() => setShotClock(24)}
              className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#01050D] px-3 py-2.5 rounded-xl text-xs font-black transition"
            >
              24s
            </button>
            <button
              type="button"
              onClick={() => setShotClock(14)}
              className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#01050D] px-3 py-2.5 rounded-xl text-xs font-black transition"
            >
              14s
            </button>
          </div>
        </div>

        {/* VISITANTE */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F26513]">VISITANTE</span>
              <h2 className="text-lg font-black text-[#01050D] uppercase truncate max-w-[180px]">
                {game?.away_team?.name || "Visitante"}
              </h2>
            </div>
            {awayFouls >= 5 && (
              <span className="bg-[#731702] text-white font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-widest animate-pulse">
                BONUS
              </span>
            )}
          </div>

          <div className="text-center my-2">
            <span className="text-6xl font-mono font-black tracking-tighter text-[#01050D]">
              {awayScore}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs mb-2">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Faltas Colectivas</span>
            <span className="font-mono font-black text-[#D93D04] text-sm">{awayFouls}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAwaySubModal(true)}
            className="w-full bg-[#01050D] hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Cambiar Jugador
          </button>
        </div>
      </div>

      {/* TARJETAS DE JUGADORES EN PISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* LOCALES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-black uppercase text-[#F26513]">
              {game?.home_team?.name || "Local"} en Pista
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{homeCourt.length}/5 TITULARES</span>
          </div>

          {!isRunning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold p-2 rounded-xl text-center">
              Inicia el tiempo en la consola central para habilitar los botones de acción.
            </div>
          )}

          <div className="space-y-2">
            {homeCourt.map((player) => (
              <FullActionPlayerCard
                key={player.id_game_player}
                player={player}
                onRecord={recordStat}
                isDisabled={!isRunning}
              />
            ))}
          </div>
        </div>

        {/* VISITANTES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-black uppercase text-[#F26513]">
              {game?.away_team?.name || "Visitante"} en Pista
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{awayCourt.length}/5 TITULARES</span>
          </div>

          {!isRunning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold p-2 rounded-xl text-center">
                  Inicia el tiempo en la consola central para habilitar los botones de acción.
            </div>
          )}

          <div className="space-y-2">
            {awayCourt.map((player) => (
              <FullActionPlayerCard
                key={player.id_game_player}
                player={player}
                onRecord={recordStat}
                isDisabled={!isRunning}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: ALINEACIÓN LOCAL */}
      {showHomeRosterModal && (
        <div className="fixed inset-0 bg-[#01050D]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base font-black uppercase text-[#01050D]">
                  Titulares {game?.home_team?.name || "Local"}
                </h2>
                <p className="text-xs text-slate-500">Selecciona exactamente 5 jugadores</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#F26513]/10 text-[#F26513] px-2.5 py-1 rounded-lg">
                {homeCourt.length} / 5
              </span>
            </div>

            {homeError && (
              <div className="bg-[#731702]/10 border border-[#731702]/30 text-[#731702] p-2.5 rounded-xl text-xs font-bold">
                {homeError}
              </div>
            )}

            <div className="space-y-2">
              {homePlayers.map((p) => (
                <button
                  type="button"
                  key={p.id_game_player}
                  onClick={() => toggleCourtStatus(p.id_game_player)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition ${
                    p.is_on_court 
                      ? "bg-[#F26513]/10 border-[#F26513] text-[#F26513]" 
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span>#{p.number} - {p.name}</span>
                  <span className="text-[10px] font-black">{p.is_on_court ? "EN CANCHA" : "BANQUILLO"}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowHomeRosterModal(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmHomeStarters}
                disabled={isSubmittingHome}
                className="w-1/2 bg-[#F26513] hover:bg-[#D93D04] disabled:bg-slate-400 text-white font-black py-2.5 rounded-xl text-xs uppercase transition flex items-center justify-center gap-2"
              >
                {isSubmittingHome ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  "Guardar Local"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ALINEACIÓN VISITANTE */}
      {showAwayRosterModal && (
        <div className="fixed inset-0 bg-[#01050D]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base font-black uppercase text-[#01050D]">
                  Titulares {game?.away_team?.name || "Visitante"}
                </h2>
                <p className="text-xs text-slate-500">Selecciona exactamente 5 jugadores</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#F26513]/10 text-[#F26513] px-2.5 py-1 rounded-lg">
                {awayCourt.length} / 5
              </span>
            </div>

            {awayError && (
              <div className="bg-[#731702]/10 border border-[#731702]/30 text-[#731702] p-2.5 rounded-xl text-xs font-bold">
                {awayError}
              </div>
            )}

            <div className="space-y-2">
              {awayPlayers.map((p) => (
                <button
                  type="button"
                  key={p.id_game_player}
                  onClick={() => toggleCourtStatus(p.id_game_player)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition ${
                    p.is_on_court 
                      ? "bg-[#F26513]/10 border-[#F26513] text-[#F26513]" 
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span>#{p.number} - {p.name}</span>
                  <span className="text-[10px] font-black">{p.is_on_court ? "EN CANCHA" : "BANQUILLO"}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAwayRosterModal(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAwayStarters}
                disabled={isSubmittingAway}
                className="w-1/2 bg-[#F26513] hover:bg-[#D93D04] disabled:bg-slate-400 text-white font-black py-2.5 rounded-xl text-xs uppercase transition flex items-center justify-center gap-2"
              >
                {isSubmittingAway ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  "Guardar Visitante"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FIN DE PERIODO */}
      {showEndPeriodModal && (
        <div className="fixed inset-0 bg-[#01050D]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F26513] bg-[#F26513]/10 px-3 py-1 rounded-full">
                {getQuarterLabel(quarter)} CONCLUIDO
              </span>
              <h2 className="text-2xl font-black uppercase text-[#01050D] mt-2">
                {isRegularTimeEnd && isTied
                  ? "¡Empate al Finalizar Tiempo Reglamentario!"
                  : isRegularTimeEnd
                  ? "¡Partido Finalizado!"
                  : `Fin del ${getQuarterLabel(quarter)}`}
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-3 items-center">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase truncate">
                  {game?.home_team?.name || "Local"}
                </p>
                <p className="text-4xl font-mono font-black text-[#01050D]">{homeScore}</p>
              </div>
              <div className="text-xs font-black text-[#F26513] uppercase tracking-widest">
                VS
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase truncate">
                  {game?.away_team?.name || "Visitante"}
                </p>
                <p className="text-4xl font-mono font-black text-[#01050D]">{awayScore}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              {isRegularTimeEnd && isTied ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-bold">
                    El reglamento exige jugar una prórroga de <strong>5 minutos</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAdvancePeriod(true)}
                    className="w-full bg-[#F26513] hover:bg-[#D93D04] text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Iniciar Tiempo Extra 5 Min. (OT)
                  </button>
                </div>
              ) : isRegularTimeEnd ? (
                <div className="space-y-3">
                  <p className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    Ganador: {homeScore > awayScore ? game?.home_team?.name : game?.away_team?.name}
                  </p>
                  <button
                    type="button"
                    onClick={handleFinishGame}
                    disabled={isFinishingGame}
                    className="w-full bg-[#D93D04] hover:bg-[#731702] disabled:bg-slate-400 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    {isFinishingGame ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando estado y finalizando...</span>
                      </>
                    ) : (
                      "Guardar y Ver Resumen"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAdvancePeriod(false)}
                  className="w-full bg-[#01050D] hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-md"
                >
                  Avanzar a {getQuarterLabel(quarter + 1)}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEndPeriodModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Volver a la Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de Sustitución Manual o Forzada */}
      <SubstitutionModal
        isOpen={showHomeSubModal}
        onClose={() => setShowHomeSubModal(false)}
        roster={roster}
        teamId={homeTeamId}
        onConfirm={handleConfirmSubstitution}
        forcedPlayerOutId={forcedHomePlayerOut}
      />
      <SubstitutionModal
        isOpen={showAwaySubModal}
        onClose={() => setShowAwaySubModal(false)}
        roster={roster}
        teamId={awayTeamId}
        onConfirm={handleConfirmSubstitution}
        forcedPlayerOutId={forcedAwayPlayerOut}
      />

    </div>
  );
}

// SUBCOMPONENTE TARJETA DE JUGADORES CON BOTONES BLOQUEABLES
function FullActionPlayerCard({ player, onRecord, isDisabled }) {
  const s = player.stats;
  const totalPoints = s.points_two_made * 2 + s.points_three_made * 3 + s.free_throw_made;
  const isFouledOut = s.fouls >= 5;

  return (
    <div
      className={`p-3 rounded-2xl border flex flex-col gap-2 transition shadow-sm ${
        isFouledOut
          ? "bg-[#731702]/5 border-[#731702]/30 opacity-60"
          : isDisabled
          ? "bg-slate-50 border-slate-200 opacity-70"
          : "bg-white border-slate-200 hover:border-[#F26513]/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs bg-slate-100 text-[#01050D] px-2 py-0.5 rounded-lg border border-slate-200">
            #{player.number}
          </span>
          <h4 className="text-xs font-black text-[#01050D] uppercase truncate max-w-[130px]">
            {player.name}
          </h4>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-[#F26513] font-bold">{totalPoints} PTS</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">{s.rebounds} REB</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">{s.assists} AST</span>
          <span className="text-slate-300">|</span>
          <span className={isFouledOut ? "text-[#731702] font-black" : "text-[#D93D04]"}>
            {s.fouls}/5 FP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 text-[9px] font-black">
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "free_throw_made", true, 1)}
          className="bg-[#F26513]/10 hover:bg-[#F26513] disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-[#F26513] hover:text-white rounded py-1.5 border border-[#F26513]/30 transition"
          title="Tiro Libre Convertido (+1)"
        >
          +1
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "points_two_made", true, 2)}
          className="bg-[#F26513] hover:bg-[#D93D04] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded py-1.5 transition"
          title="Tiro Doble Convertido (+2)"
        >
          +2
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "points_three_made", true, 3)}
          className="bg-[#D93D04] hover:bg-[#731702] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded py-1.5 transition"
          title="Tiro Triple Convertido (+3)"
        >
          +3
        </button>

        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "free_throw_attempts")}
          className="bg-white border border-[#731702]/30 hover:bg-[#731702]/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-[#731702] rounded py-1.5 transition"
          title="Tiro Libre Fallado"
        >
          1F
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "points_two_attempts")}
          className="bg-white border border-[#731702]/30 hover:bg-[#731702]/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-[#731702] rounded py-1.5 transition"
          title="Tiro Doble Fallado"
        >
          2F
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "points_three_attempts")}
          className="bg-white border border-[#731702]/30 hover:bg-[#731702]/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-[#731702] rounded py-1.5 transition"
          title="Tiro Triple Fallado"
        >
          3F
        </button>

        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "rebounds")}
          className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-[#01050D] border border-slate-200 rounded py-1.5 transition"
          title="Rebote"
        >
          RE
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "assists")}
          className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-[#01050D] border border-slate-200 rounded py-1.5 transition"
          title="Asistencia"
        >
          AS
        </button>
        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "steals")}
          className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-[#01050D] border border-slate-200 rounded py-1.5 transition"
          title="Robo"
        >
          RB
        </button>

        <button
          type="button"
          disabled={isDisabled || isFouledOut}
          onClick={(e) => onRecord(e, player.id_game_player, "fouls", false, 0, true)}
          className="bg-[#731702]/10 hover:bg-[#731702] disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-[#731702] hover:text-white border border-[#731702]/30 rounded py-1.5 transition"
          title="Falta Personal"
        >
          FP
        </button>
      </div>
    </div>
  );
}