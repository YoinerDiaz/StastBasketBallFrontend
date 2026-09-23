import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BoxScoreModal } from "../components/BoxScoreModal";
import { OvertimeModal } from "../components/OvertimeModal";
import { Scoreboard } from "../components/Scoreboard";
import { StartersModal } from "../components/StartersModal";
import { SubstitutionModal } from "../components/SubstitutionModal";
import TeamPanel from "../components/TeamPanel";
import { useGameControl } from "../hook/useGameControl";
import { useGameTimer } from "../hook/useGameTimer";

const GameControl = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const gid = Number(gameId);

  const [startersModal, setStartersModal] = useState({ open: false, teamId: null, teamName: "" });
  const [subModal, setSubModal] = useState({ open: false, playerOut: null, teamId: null });
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);

  const { seconds, isActive, toggleTimer, formatTime, resetTimer } = useGameTimer(10);
  const { 
    game, 
    liveStatus, 
    gamePlayers, 
    boxScore, 
    isLoading, 
    isError,
    recordEventMutation, 
    setStartersMutation, 
    substitutionMutation, 
    endQuarterMutation,
    startGameMutation, 
    finishGameMutation, 
    addOvertimeMutation,
  } = useGameControl(gid);

  const safeGamePlayers = Array.isArray(gamePlayers) ? gamePlayers : [];
  const safeBoxScore = Array.isArray(boxScore) ? boxScore : [];

  const homeOnCourt = safeGamePlayers.filter(
    (gp) => gp.fk_id_team === game?.fk_home_id_team && gp.is_on_court
  );
  const awayOnCourt = safeGamePlayers.filter(
    (gp) => gp.fk_id_team === game?.fk_away_id_team && gp.is_on_court
  );

  const statsMap = {};
  safeBoxScore.forEach((s) => {
    statsMap[s.fk_id_game_player] = s;
  });

  const handleRecordEvent = ({ event_type, fk_id_game_player_events }) => {
    recordEventMutation.mutate(
      { event_type, fk_id_game_player_events, game_time_seconds: seconds },
      {
        onSuccess: () => toast.success(`✅ ${event_type.replace(/_/g, " ")}`),
        onError: (err) => toast.error(err?.response?.data?.detail || "Error al registrar"),
      }
    );
  };

  const handleSaveStarters = ({ teamId, gamePlayerIds }) => {
    if (!Array.isArray(gamePlayerIds) || gamePlayerIds.length !== 5) {
      toast.error("Debes seleccionar exactamente 5 jugadores");
      return;
    }

    setStartersMutation.mutate(
      { gameId: gid, teamId, gamePlayerIds },
      {
        onSuccess: () => {
          toast.success("✅ Quinteto configurado");
          setStartersModal({ open: false, teamId: null, teamName: "" });
        },
        onError: (err) => toast.error(err?.response?.data?.detail || "Error"),
      }
    );
  };

  const handleOpenSub = (playerOut) => setSubModal({ open: true, playerOut, teamId: playerOut.fk_id_team });

  const handleConfirmSub = (outId, inId) => {
    substitutionMutation.mutate({ player_out_id: outId, player_in_id: inId, current_game_time: seconds }, {
      onSuccess: () => {
        toast.success("🔁 Sustitución realizada");
        setSubModal({ open: false, playerOut: null, teamId: null });
      },
      onError: (err) => toast.error(err?.response?.data?.detail || "Error sustitución"),
    });
  };

  const handleEndQuarter = () => {
    if (!window.confirm("¿Finalizar cuarto?")) return;
    endQuarterMutation.mutate(undefined, {
      onSuccess: (d) => {
        if (d.new_quarter === 5) {
          setOvertimeModalOpen(true);
          toast.success("⏱ Cuarto 4 finalizado");
        } else {
          toast.success(`Cuarto ${d.new_quarter} comenzando`);
          resetTimer(10);
        }
      },
      onError: (err) => toast.error(err?.response?.data?.detail || "Error al finalizar cuarto"),
    });
  };

  const handleFinishGame = () => {
    if (!window.confirm("¿Estás seguro de que deseas finalizar el partido? Esta acción no se puede deshacer.")) return;
    finishGameMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("🏁 Partido finalizado con éxito");
      },
      onError: (err) => toast.error(err?.response?.data?.detail || "Error al finalizar partido"),
    });
  };

  const handleAddOvertime = (overtimeSeconds) => {
    addOvertimeMutation.mutate(overtimeSeconds, {
      onSuccess: (d) => {
        toast.success(`🏀 ${d.message}`);
        setOvertimeModalOpen(false);
        resetTimer(Math.floor(overtimeSeconds / 60));
      },
      onError: (err) => toast.error(err?.response?.data?.detail || "Error al agregar tiempo extra"),
    });
  };

  const handleFinishGameFromModal = () => {
    finishGameMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("🏁 ¡Partido Finalizado!");
        setOvertimeModalOpen(false);
      },
      onError: (err) => toast.error(err?.response?.data?.detail || "Error al finalizar"),
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 animate-pulse">Cargando...</div>;
  }
  if (isError || !game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-red-400">
        <p className="text-xl font-bold">No se pudo cargar el partido.</p>
        <button onClick={() => navigate("/games")} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">← Volver</button>
      </div>
    );
  }

  const openHomeStarters = () => setStartersModal({ open: true, teamId: game.fk_home_id_team, teamName: game.home_team?.name || "Local" });
  const openAwayStarters = () => setStartersModal({ open: true, teamId: game.fk_away_id_team, teamName: game.away_team?.name || "Visitante" });

  const hasHomeStarters = safeGamePlayers.some(
    (gp) => gp.fk_id_team === game?.fk_home_id_team && gp.is_on_court
  );
  const hasAwayStarters = safeGamePlayers.some(
    (gp) => gp.fk_id_team === game?.fk_away_id_team && gp.is_on_court
  );
  const canStartMatch = hasHomeStarters && hasAwayStarters;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-2">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/games")} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700">← Volver</button>
            <span className="text-xs text-slate-500 hidden sm:block">{game.home_team?.name} vs {game.away_team?.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={openHomeStarters} className="px-3 py-1.5 text-xs bg-sky-700 hover:bg-sky-600 text-white rounded-lg">Titulares Local</button>
            <button onClick={openAwayStarters} className="px-3 py-1.5 text-xs bg-orange-700 hover:bg-orange-600 text-white rounded-lg">Titulares Visita</button>
            <button onClick={() => setBoxScoreOpen(true)} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600">📊 Box Score</button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        <Scoreboard
          homeTeam={game.home_team}
          awayTeam={game.away_team}
          liveStatus={liveStatus}
          currentQuarter={game.current_quarter}
          formatTime={formatTime}
          isActive={isActive}
          onToggleTimer={() => {
            if (!canStartMatch) {
              toast.error("Selecciona titulares (5 de Local y 5 de Visita) para iniciar");
              return;
            }
            if (!isActive && game?.status === "PROGRAMADO") {
              startGameMutation.mutate(undefined, {
                onSuccess: () => {
                  toast.success("🚀 Partido en vivo!");
                },
                onError: (err) => toast.error(err?.response?.data?.detail || "Error al iniciar"),
              });
            }
            toggleTimer();
          }}
          onEndQuarter={handleEndQuarter}
          onResetTimer={() => resetTimer(10)}
          isEndingQuarter={endQuarterMutation.isPending}
          onFinishGame={handleFinishGame}
          isFinishingGame={finishGameMutation.isPending}
          gameStatus={game.status}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamPanel label={game.home_team?.name || "Local"} color="sky"
            players={homeOnCourt} statsMap={statsMap}
            onRecordEvent={handleRecordEvent} onOpenSubstitution={handleOpenSub}
            onDefineStarters={openHomeStarters} isRecording={recordEventMutation.isPending}
          />
          <TeamPanel label={game.away_team?.name || "Visitante"} color="orange"
            players={awayOnCourt} statsMap={statsMap}
            onRecordEvent={handleRecordEvent} onOpenSubstitution={handleOpenSub}
            onDefineStarters={openAwayStarters} isRecording={recordEventMutation.isPending}
          />
        </div>
      </div>

      <StartersModal isOpen={startersModal.open}
        onClose={() => setStartersModal({ open: false, teamId: null, teamName: "" })}
        teamName={startersModal.teamName} teamId={startersModal.teamId}
        gamePlayers={gamePlayers} onSaveStarters={handleSaveStarters}
        isLoading={setStartersMutation.isPending}
      />
      <SubstitutionModal isOpen={subModal.open}
        onClose={() => setSubModal({ open: false, playerOut: null, teamId: null })}
        gamePlayers={gamePlayers} teamId={subModal.teamId}
        playerOut={subModal.playerOut}
        onConfirmSubstitution={handleConfirmSub} isLoading={substitutionMutation.isPending}
      />
      <BoxScoreModal isOpen={boxScoreOpen} onClose={() => setBoxScoreOpen(false)}
        game={game} gamePlayers={gamePlayers} boxScore={boxScore}
      />
      <OvertimeModal
        isOpen={overtimeModalOpen}
        onClose={() => setOvertimeModalOpen(false)}
        onAddOvertime={handleAddOvertime}
        onFinishGame={handleFinishGameFromModal}
        isLoading={addOvertimeMutation.isPending || finishGameMutation.isPending}
        homeScore={liveStatus?.score?.home ?? game?.home_score ?? 0}
        awayScore={liveStatus?.score?.away ?? game?.away_score ?? 0}
      />
    </div>
  );
};

export default GameControl;