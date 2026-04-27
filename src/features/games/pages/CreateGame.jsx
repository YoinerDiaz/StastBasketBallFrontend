import { useState } from "react";
import { useTeams } from "../../teams/hooks/useTeams";
import { usePlayersByTeam } from "../../players/hooks/usePlayers";
import { useCreateGame } from "../hooks/useGames";
import { toast } from 'react-toastify';

export default function CreateGame() {
    const { data: teams = [] } = useTeams();
    const { mutate: createGame, isLoading: creatingGame } = useCreateGame();

    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [step, setStep] = useState("local"); 
    const [isHeaderOpen, setIsHeaderOpen] = useState(true);

    const [selectedLocalTeam, setSelectedLocalTeam] = useState(null);
    const [selectedVisitorTeam, setSelectedVisitorTeam] = useState(null);
    const [selectedLocalPlayers, setSelectedLocalPlayers] = useState([]);
    const [selectedVisitorPlayers, setSelectedVisitorPlayers] = useState([]);

    const currentTeamId = step === "local" ? selectedLocalTeam : selectedVisitorTeam;
    const { data: teamPlayers = [], isLoading: loadingPlayers } = usePlayersByTeam(currentTeamId);
    const currentSelectedPlayers = step === "local" ? selectedLocalPlayers : selectedVisitorPlayers;

    const MIN_PLAYERS = 5;

    const handlePlayerToggle = (playerId) => {
        const isLocal = step === "local";
        const selected = isLocal ? selectedLocalPlayers : selectedVisitorPlayers;
        const setSelected = isLocal ? setSelectedLocalPlayers : setSelectedVisitorPlayers;

        if (selected.includes(playerId)) {
            setSelected(selected.filter(id => id !== playerId));
        } else {
            if (selected.length < 12) {
                setSelected([...selected, playerId]);
            } else {
                toast.warning("Límite máximo de 12 jugadores alcanzado");
            }
        }
    };

    const handleCreateGame = () => {
        // Validaciones con Toastify
        if (!date || !location.trim()) {
            toast.error("Faltan datos: Ubicación y Fecha");
            setIsHeaderOpen(true);
            return;
        }
        if (selectedLocalPlayers.length < MIN_PLAYERS) {
            toast.error(`El equipo local necesita al menos ${MIN_PLAYERS} jugadores`);
            setStep("local");
            return;
        }
        if (selectedVisitorPlayers.length < MIN_PLAYERS) {
            toast.error(`El equipo visitante necesita al menos ${MIN_PLAYERS} jugadores`);
            setStep("visitor");
            return;
        }

        createGame({
            location,
            date: new Date(date).toISOString(),
            homeTeamId: selectedLocalTeam,
            awayTeamId: selectedVisitorTeam,
            homePlayers: selectedLocalPlayers,
            awayPlayers: selectedVisitorPlayers,
        }, {
            onSuccess: () => toast.success("¡Partido creado correctamente!"),
            onError: (err) => {
                const msg = err?.response?.data?.detail;
                toast.error(Array.isArray(msg) ? msg[0].msg : (msg || "Error al crear el juego"));
            }
        });
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans">
            
            {/* CONFIGURACIÓN COLAPSABLE */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <button 
                    onClick={() => setIsHeaderOpen(!isHeaderOpen)}
                    className="w-full p-3 flex justify-between items-center text-gray-500"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
                        Configuración General
                    </span>
                    <span className={`text-xs transform transition-transform ${isHeaderOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isHeaderOpen && (
                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Lugar del encuentro"
                            className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        />
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                )}
            </div>

            <main className="p-4 space-y-5">
                {/* TABS DE EQUIPO */}
                <div className="flex bg-gray-200/50 p-1 rounded-2xl">
                    <button 
                        onClick={() => setStep("local")}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${step === 'local' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                    >
                        EQUIPO LOCAL
                    </button>
                    <button 
                        onClick={() => setStep("visitor")}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${step === 'visitor' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                    >
                        VISITANTE
                    </button>
                </div>

                {/* SELECTOR DE CLUB */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Club</label>
                    <select
                        value={currentTeamId || ""}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (step === "local") { setSelectedLocalTeam(val); setSelectedLocalPlayers([]); }
                            else { setSelectedVisitorTeam(val); setSelectedVisitorPlayers([]); }
                        }}
                        className="w-full p-3.5 bg-white border-none rounded-2xl shadow-sm text-sm font-medium"
                    >
                        <option value="">Seleccionar equipo...</option>
                        {teams.filter(t => step === "local" ? t.id_team !== selectedVisitorTeam : t.id_team !== selectedLocalTeam).map((t) => (
                            <option key={t.id_team} value={t.id_team}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* CONTENEDOR DE JUGADORES */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-gray-700">Convocatoria ({currentSelectedPlayers.length})</h3>
                        {currentTeamId && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Scroll para ver más</span>}
                    </div>
                    
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-y-auto h-[300px] p-2 space-y-2 shadow-inner custom-scrollbar">
                        {currentTeamId ? (
                            loadingPlayers ? (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">Cargando...</div>
                            ) : (
                                teamPlayers.map((player) => {
                                    const isSelected = currentSelectedPlayers.includes(player.id_player);
                                    return (
                                        <div
                                            key={player.id_player}
                                            onClick={() => handlePlayerToggle(player.id_player)}
                                            className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isSelected ? 'bg-green-500 text-white shadow-md' : 'bg-gray-50 text-gray-600'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                    {player.number}
                                                </span>
                                                <span className="text-sm font-semibold">{player.name}</span>
                                            </div>
                                            {isSelected && <span className="text-xs">✓</span>}
                                        </div>
                                    );
                                })
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <span className="text-2xl mb-2"></span>
                                <p className="text-[11px] text-gray-400 leading-tight">Selecciona un club para gestionar la lista de jugadores disponibles.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* BARRA DE ACCIÓN FIJA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                <button
                    onClick={handleCreateGame}
                    disabled={creatingGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 disabled:bg-gray-300 transition-all active:scale-95"
                >
                    {creatingGame ? "CREANDO PARTIDO..." : "GUARDAR PARTIDO"}
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}