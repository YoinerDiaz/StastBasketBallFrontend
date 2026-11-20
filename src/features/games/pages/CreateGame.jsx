import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useTeams } from "../../teams/hooks/useTeams";
import { usePlayersByTeam } from "../../players/hooks/usePlayers";
import { useCreateGame } from "../hooks/useGames";
import { toast } from "react-toastify";
import { supabase } from "../../../api/supabaseClient";

export default function CreateGame() {
    const { search, state: routeState } = useLocation();
    const navigate = useNavigate();
    const mode = new URLSearchParams(search).get("mode");

    const fromTournament       = routeState?.fromTournament ?? false;
    const presetPhaseId        = routeState?.phaseId        ?? null;
    const presetGroupId        = routeState?.groupId        ?? null;
    const presetTournamentName = routeState?.tournamentName ?? null;
    const presetPhaseName      = routeState?.phaseName      ?? null;
    const presetGroupName      = routeState?.groupName      ?? null;

    const [locationVal, setLocationVal] = useState("");
    const [date, setDate]               = useState("");
    const [isNow, setIsNow]             = useState(mode === "now");
    const [step, setStep]               = useState("local");

    const [selectedLocalTeam,      setSelectedLocalTeam]      = useState(null);
    const [selectedVisitorTeam,    setSelectedVisitorTeam]    = useState(null);
    const [selectedLocalPlayers,   setSelectedLocalPlayers]   = useState([]);
    const [selectedVisitorPlayers, setSelectedVisitorPlayers] = useState([]);

    const [tournaments,        setTournaments]        = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [phases,             setPhases]             = useState([]);
    const [selectedPhase,      setSelectedPhase]      = useState(null);
    const [groups,             setGroups]             = useState([]);
    const [selectedGroup,      setSelectedGroup]      = useState(null);
    const [tournamentOpen,     setTournamentOpen]     = useState(false);

    const { data: teams = [] }                                  = useTeams();
    const { mutate: createGame, isLoading: creatingGame }       = useCreateGame();
    const currentTeamId                                         = step === "local" ? selectedLocalTeam : selectedVisitorTeam;
    const { data: teamPlayers = [], isLoading: loadingPlayers } = usePlayersByTeam(currentTeamId);
    const currentSelectedPlayers = step === "local" ? selectedLocalPlayers : selectedVisitorPlayers;

    useEffect(() => {
        if (mode === "now") {
            const pad = (n) => String(n).padStart(2, "0");
            const now = new Date();
            setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
            setIsNow(true);
        }
    }, [mode]);

    useEffect(() => {
        if (fromTournament) return;
        supabase
            .from("tournaments")
            .select("id_tournament, name")
            .order("created_at", { ascending: false })
            .then(({ data }) => setTournaments(data || []));
    }, [fromTournament]);

    useEffect(() => {
        if (!selectedTournament) {
            setPhases([]); setSelectedPhase(null); setGroups([]); setSelectedGroup(null);
            return;
        }
        supabase
            .from("tournament_phases")
            .select("id_phase, name, tournament_groups(id_group, name)")
            .eq("fk_id_tournament", selectedTournament)
            .then(({ data }) => {
                setPhases(data || []);
                setSelectedPhase(null); setGroups([]); setSelectedGroup(null);
            });
    }, [selectedTournament]);

    useEffect(() => {
        if (!selectedPhase) { setGroups([]); setSelectedGroup(null); return; }
        const phase = phases.find(p => p.id_phase === Number(selectedPhase));
        setGroups(phase?.tournament_groups || []);
        setSelectedGroup(null);
    }, [selectedPhase, phases]);

    const finalPhaseId = fromTournament ? presetPhaseId : (selectedPhase ? Number(selectedPhase) : null);
    const finalGroupId = fromTournament ? presetGroupId : (selectedGroup ? Number(selectedGroup) : null);

    const handlePlayerToggle = (playerId) => {
        const isLocal     = step === "local";
        const selected    = isLocal ? selectedLocalPlayers   : selectedVisitorPlayers;
        const setSelected = isLocal ? setSelectedLocalPlayers : setSelectedVisitorPlayers;
        if (selected.includes(playerId)) {
            setSelected(selected.filter(id => id !== playerId));
        } else {
            if (selected.length < 12) setSelected([...selected, playerId]);
            else toast.warning("Límite máximo de 12 jugadores alcanzado");
        }
    };

    const handleCreateGame = () => {
        if (!locationVal.trim())                                                   { toast.error("Por favor, ingresa una ubicación"); return; }
        if (!date)                                                                 { toast.error("Por favor, selecciona la fecha y hora"); return; }
        if (isNaN(new Date(date).getTime()))                                       { toast.error("La fecha seleccionada no es válida"); return; }
        if (!selectedLocalTeam || !selectedVisitorTeam)                           { toast.error("Debes seleccionar ambos equipos"); return; }
        if (Number(selectedLocalTeam) === Number(selectedVisitorTeam))            { toast.error("El equipo local y el visitante no pueden ser el mismo"); return; }
        if (selectedLocalPlayers.length < 5 || selectedVisitorPlayers.length < 5) { toast.error("Cada equipo necesita mínimo 5 jugadores"); return; }

        createGame(
            {
                location:               locationVal,
                date:                   new Date(date).toISOString(),
                homeTeamId:             Number(selectedLocalTeam),
                awayTeamId:             Number(selectedVisitorTeam),
                homePlayers:            selectedLocalPlayers,
                awayPlayers:            selectedVisitorPlayers,
                status:                 isNow ? "in_progress" : "SCHEDULED",
                fk_id_tournament_phase: finalPhaseId,
                fk_id_tournament_group: finalGroupId,
            },
            {
                onSuccess: (data) => {
                    toast.success(isNow ? "¡Partido iniciado!" : "Partido programado correctamente");
                    if (isNow && data?.id_game) navigate(`/game-control/${data.id_game}`);
                    else if (fromTournament)    navigate(-1);
                    else                        navigate("/games");
                },
                onError: () => toast.error("Error al crear el partido"),
            }
        );
    };

    const teamName     = (id) => teams.find(t => t.id_team === Number(id))?.name ?? "—";
    const localCount   = selectedLocalPlayers.length;
    const visitorCount = selectedVisitorPlayers.length;

    return (
        <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] flex flex-col">

            {/* HEADER */}
            <header className="bg-[#01050D] text-white px-6 pt-10 pb-20 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 50px,white 50px,white 51px)" }} />
                <div className="relative z-10 max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3.5 rounded-2xl bg-white/10 hover:bg-[#F26513] transition shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            {isNow ? "Iniciar Partido" : "Programar Partido"}
                        </h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {fromTournament
                                ? `${presetTournamentName} · ${presetPhaseName} · ${presetGroupName}`
                                : "Amistoso o asociado a torneo"}
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 -mt-12 relative z-10 pb-36 space-y-5">

                {/* BANNER TORNEO PRE-ASIGNADO */}
                {fromTournament && (
                    <div className="bg-[#F26513] text-white rounded-[1.5rem] p-5 flex items-center gap-4 shadow-lg shadow-[#F26513]/30">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Asociado automáticamente a</p>
                            <p className="font-black text-sm">{presetTournamentName}</p>
                            <p className="text-xs opacity-80 font-bold">{presetPhaseName} — {presetGroupName}</p>
                        </div>
                    </div>
                )}

                {/* FECHA, HORA Y SEDE */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Fecha, hora y sede</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Fecha y hora
                            </span>
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F26513] transition bg-slate-50"
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Sede
                            </span>
                            <input
                                type="text"
                                placeholder="Ej: Coliseo El Campín"
                                value={locationVal}
                                onChange={e => setLocationVal(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:border-[#F26513] transition bg-slate-50"
                            />
                        </label>
                    </div>
                </div>

                {/* SELECTOR OPCIONAL DE TORNEO (si NO viene pre-asignado) */}
                {!fromTournament && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setTournamentOpen(o => !o)}
                            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${finalGroupId ? "bg-[#F26513] text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asociar a torneo</p>
                                    <p className="text-sm font-black text-[#01050D]">
                                        {finalGroupId
                                            ? `${tournaments.find(t => t.id_tournament === Number(selectedTournament))?.name || ""} · ${groups.find(g => g.id_group === Number(selectedGroup))?.name || ""}`
                                            : "Amistoso (sin torneo)"}
                                    </p>
                                </div>
                            </div>
                            {tournamentOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {tournamentOpen && (
                            <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
                                <select
                                    value={selectedTournament ?? ""}
                                    onChange={e => setSelectedTournament(e.target.value || null)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F26513] bg-slate-50"
                                >
                                    <option value="">— Sin torneo (Amistoso) —</option>
                                    {tournaments.map(t => <option key={t.id_tournament} value={t.id_tournament}>{t.name}</option>)}
                                </select>
                                {phases.length > 0 && (
                                    <select
                                        value={selectedPhase ?? ""}
                                        onChange={e => setSelectedPhase(e.target.value || null)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F26513] bg-slate-50"
                                    >
                                        <option value="">— Seleccionar fase —</option>
                                        {phases.map(p => <option key={p.id_phase} value={p.id_phase}>{p.name}</option>)}
                                    </select>
                                )}
                                {groups.length > 0 && (
                                    <select
                                        value={selectedGroup ?? ""}
                                        onChange={e => setSelectedGroup(e.target.value || null)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F26513] bg-slate-50"
                                    >
                                        <option value="">— Seleccionar grupo —</option>
                                        {groups.map(g => <option key={g.id_group} value={g.id_group}>{g.name}</option>)}
                                    </select>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* EQUIPOS Y JUGADORES */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                        {["local", "visitante"].map(s => (
                            <button
                                key={s}
                                onClick={() => setStep(s)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${step === s ? "bg-white text-[#01050D] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {s === "local"
                                    ? `Local${selectedLocalTeam ? " · " + teamName(selectedLocalTeam) : ""}`
                                    : `Visitante${selectedVisitorTeam ? " · " + teamName(selectedVisitorTeam) : ""}`}
                            </button>
                        ))}
                    </div>

                    <select
                        value={step === "local" ? (selectedLocalTeam ?? "") : (selectedVisitorTeam ?? "")}
                        onChange={e => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            if (step === "local") { setSelectedLocalTeam(val); setSelectedLocalPlayers([]); }
                            else                  { setSelectedVisitorTeam(val); setSelectedVisitorPlayers([]); }
                        }}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F26513] transition bg-slate-50"
                    >
                        <option value="">— Seleccionar equipo {step === "local" ? "local" : "visitante"} —</option>
                        {teams
                            .filter(t => step === "local"
                                ? t.id_team !== Number(selectedVisitorTeam)
                                : t.id_team !== Number(selectedLocalTeam))
                            .map(t => <option key={t.id_team} value={t.id_team}>{t.name}</option>)}
                    </select>

                    {currentTeamId && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Jugadores convocados</p>
                                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${currentSelectedPlayers.length >= 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                    {currentSelectedPlayers.length} / 12 {currentSelectedPlayers.length < 5 && "(mín. 5)"}
                                </span>
                            </div>
                            {loadingPlayers ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-[#F26513] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : teamPlayers.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6 font-bold">Este equipo no tiene jugadores registrados</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                    {teamPlayers.map(player => {
                                        const isSelected = currentSelectedPlayers.includes(player.id_player);
                                        return (
                                            <button
                                                key={player.id_player}
                                                onClick={() => handlePlayerToggle(player.id_player)}
                                                className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-150 active:scale-[0.98] ${isSelected ? "bg-green-600 text-white shadow-md shadow-green-100" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg ${isSelected ? "bg-white/20" : "bg-white shadow-sm text-slate-400"}`}>
                                                        {player.number ?? "#"}
                                                    </span>
                                                    <span className="text-sm font-bold">{player.name}</span>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? "bg-white text-green-600" : "border-2 border-slate-200"}`}>
                                                    {isSelected && <span className="text-[9px] font-black">✓</span>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RESUMEN DEL ENCUENTRO */}
                {selectedLocalTeam && selectedVisitorTeam && (
                    <div className="bg-[#01050D] text-white rounded-[2rem] p-6 flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Local</p>
                            <p className="font-black text-sm">{teamName(selectedLocalTeam)}</p>
                            <p className={`text-[10px] mt-0.5 font-bold ${localCount >= 5 ? "text-green-400" : "text-amber-400"}`}>{localCount} jugadores</p>
                        </div>
                        <div className="text-[#F26513] font-black text-xl px-4">VS</div>
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Visitante</p>
                            <p className="font-black text-sm">{teamName(selectedVisitorTeam)}</p>
                            <p className={`text-[10px] mt-0.5 font-bold ${visitorCount >= 5 ? "text-green-400" : "text-amber-400"}`}>{visitorCount} jugadores</p>
                        </div>
                    </div>
                )}
            </main>

            {/* BOTÓN FIJO */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-40">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleCreateGame}
                        disabled={creatingGame}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${isNow ? "bg-[#F26513] shadow-[#F26513]/30 hover:bg-[#D93D04]" : "bg-[#01050D] shadow-slate-900/20 hover:bg-[#F26513]"} text-white ${creatingGame ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {creatingGame ? "Guardando..." : isNow ? "¡Comenzar Partido Ahora!" : "Guardar Programación"}
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}
