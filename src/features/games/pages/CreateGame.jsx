import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTeams } from "../../teams/hooks/useTeams";
import { usePlayersByTeam } from "../../players/hooks/usePlayers";
import { useCreateGame } from "../hooks/useGames";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export default function CreateGame() {
    //Estados para cambio dinamico de vista del formulario
    const { search } = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(search);
    const mode = query.get('mode'); // 'now' o 'schedule'
    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [isNow, setIsNow] = useState(false);

    const { data: teams = [] } = useTeams();
    const { mutate: createGame, isLoading: creatingGame } = useCreateGame();

    const [step, setStep] = useState("local");

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
    // 1. Validaciones iniciales
    if (!location.trim()) {
        toast.error("Por favor, ingresa una ubicación");
        return;
    }

    if (!selectedLocalTeam || !selectedVisitorTeam) {
        toast.error("Debes seleccionar ambos equipos");
        return;
    }

    if (selectedLocalTeam === selectedVisitorTeam) {
        toast.error("El equipo local y el visitante no pueden ser el mismo");
        return;
    }

    if (selectedLocalPlayers.length < 5 || selectedVisitorPlayers.length < 5) {
        toast.error("Cada equipo debe tener al menos 5 jugadores seleccionados");
        return;
    }

    // En CreateGame.jsx, dentro de handleCreateGame
    const gamePayload = {
        location: location.trim(),
        date: new Date(date).toISOString().split('.')[0],
        homeTeamId: Number(selectedLocalTeam),    // Coincide con el servicio
        awayTeamId: Number(selectedVisitorTeam),  // Coincide con el servicio
        homePlayers: selectedLocalPlayers.map(Number),
        awayPlayers: selectedVisitorPlayers.map(Number),
    };

    console.log("Enviando Payload:", gamePayload);

    // 3. Ejecución de la mutación (Tanstack Query / UseMutation)
        createGame(gamePayload, {
            onSuccess: (data) => {
                // 'data' debería traer el ID del partido que acaba de crear tu FastAPI
                const gameId = data.id_game || data.id; 

                if (isNow) {
                    toast.success("¡Partido iniciado! Redirigiendo al panel de control...");
                    // Redirigimos a la pantalla de estadísticas en vivo
                    // Asegúrate de que esta ruta esté definida en tu App.js
                    // ✅ Correcto: URL limpia
                    navigate(`/game-control/${gameId}`);
                } else {
                    toast.success("¡Programación guardada con éxito!");
                    // Opcional: Limpiar formulario o redirigir a la lista de juegos
                    // navigate('/scheduled-games');
                }
                
                console.log("Respuesta del servidor:", data);
            },
            onError: (err) => {
                const serverDetails = err.response?.data?.detail;
                console.error("Error detallado del servidor:", serverDetails);

                if (Array.isArray(serverDetails)) {
                    toast.error(`Error de validación en: ${serverDetails[0].loc[1]}`);
                } else {
                    toast.error("Hubo un problema al crear el partido. Revisa la consola.");
                }
            },
        });
    };

    useEffect(() => {
        if (mode === 'now') {
            const today = new Date();
            // Formato requerido por datetime-local: YYYY-MM-DDTHH:mm
            const formattedDate = today.toISOString().slice(0, 16);
            setDate(formattedDate);
            setIsNow(true);
            setIsHeaderOpen(false); // Cerramos el header porque ya está pre-configurado
        } else {
            setIsNow(false);
            setIsHeaderOpen(true);
        }
    }, [mode]);
    return (
        <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen pb-32 font-sans">

            {/* CABECERA DINÁMICA */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="p-5 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
                            {isNow ? "Partido en Vivo" : "Programación de Encuentro"}
                        </span>
                        <h1 className="text-sm font-bold text-gray-800">
                            {isNow ? "Iniciando juego rápido" : "Configura los detalles"}
                        </h1>
                    </div>
                    {!isNow && (
                        <button
                            onClick={() => setIsHeaderOpen(!isHeaderOpen)}
                            className="p-2 text-gray-400"
                        >
                            <span className={`block transform transition-transform ${isHeaderOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                    )}
                </div>

                {/* SECCIÓN DE CONFIGURACIÓN SIEMPRE VISIBLE PARA UBICACIÓN */}
                <div className="px-6 pb-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* UBICACIÓN: Siempre visible */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-wider">
                                Lugar del encuentro
                            </label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ej: Polideportivo Municipal"
                                className="w-full p-4 bg-gray-100 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-green-500 transition-all"
                                required
                            />
                        </div>

                        {/* FECHA Y HORA: Condicional o Colapsable */}
                        {(!isNow || isHeaderOpen) && (
                            <div className="space-y-1 animate-in slide-in-from-right-2 duration-300">
                                <label className={`text-[10px] font-bold ml-2 uppercase tracking-wider ${isNow ? 'text-green-600' : 'text-gray-400'}`}>
                                    {isNow ? "Hora de inicio (Confirmada)" : "Programar Fecha y Hora"}
                                </label>
                                <input
                                    type="datetime-local"
                                    value={date}
                                    readOnly={isNow}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`w-full p-4 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all ${isNow
                                            ? 'bg-green-50 text-green-700 font-bold cursor-default'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Feedback visual sutil para el modo 'Ahora' */}
                    {isNow && !isHeaderOpen && (
                        <p className="text-[9px] text-gray-400 mt-2 ml-2 italic">
                            La fecha se ha configurado automáticamente para hoy.
                        </p>
                    )}
                </div>
            </div>

            <main className="p-6">
                {/* Layout adaptable: Columna en móvil, Dos columnas en Desktop/Horizontal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA: Control de Equipos */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Seleccionar Bando</label>
                            <div className="flex bg-gray-200/50 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => setStep("local")}
                                    className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all ${step === 'local' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    LOCAL
                                </button>
                                <button
                                    onClick={() => setStep("visitor")}
                                    className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all ${step === 'visitor' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    VISITANTE
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Club</label>
                            <select
                                value={currentTeamId || ""}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (step === "local") { setSelectedLocalTeam(val); setSelectedLocalPlayers([]); }
                                    else { setSelectedVisitorTeam(val); setSelectedVisitorPlayers([]); }
                                }}
                                className="w-full p-4 bg-white border-none rounded-2xl shadow-sm text-sm font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Seleccionar equipo...</option>
                                {teams.filter(t => step === "local" ? t.id_team !== selectedVisitorTeam : t.id_team !== selectedLocalTeam).map((t) => (
                                    <option key={t.id_team} value={t.id_team}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Resumen visible en desktop */}
                        <div className="hidden md:block p-6 bg-green-50 rounded-3xl border border-green-100">
                            <p className="text-xs text-green-700 font-medium leading-relaxed">
                                Selecciona los jugadores que formarán parte de la convocatoria para este encuentro.
                            </p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Lista de Jugadores */}
                    <div className="md:col-span-7 space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 leading-none">Convocatoria</h3>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">
                                    {currentSelectedPlayers.length} Seleccionados
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50">
                            <div className="h-[400px] md:h-[500px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                {currentTeamId ? (
                                    loadingPlayers ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-3">
                                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando</span>
                                        </div>
                                    ) : (
                                        teamPlayers.map((player) => {
                                            const isSelected = currentSelectedPlayers.includes(player.id_player);
                                            return (
                                                <button
                                                    key={player.id_player}
                                                    onClick={() => handlePlayerToggle(player.id_player)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${isSelected
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white shadow-sm text-gray-400'}`}>
                                                            {player.number}
                                                        </span>
                                                        <span className="text-sm font-bold tracking-tight">{player.name}</span>
                                                    </div>
                                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-white text-green-600' : 'border-2 border-gray-200'}`}>
                                                        {isSelected && <span className="text-[10px]">L</span>}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full mb-4 flex items-center justify-center text-gray-300 text-2xl font-black">?</div>
                                        <p className="text-xs text-gray-400 font-medium max-w-[200px] leading-normal uppercase tracking-wide">
                                            Selecciona un club para ver los jugadores
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* BOTÓN DE ACCIÓN FIJO */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-40">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleCreateGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-green-200 active:scale-95 text-sm uppercase tracking-widest transition-all"
                    >
                        {isNow ? "¡COMENZAR PARTIDO!" : "GUARDAR PROGRAMACIÓN"}
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