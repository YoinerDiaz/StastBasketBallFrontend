import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGameTimer } from "../hook/useGameTimer"; 
import { useGameData } from "../hook/useGameData"; 
import PlayerRow from "../components/PlayerRow";

const GameControl = () => {
    const { gameId } = useParams();
    const { game, players, isLoading, error } = useGameData(gameId);
    const { formatTime, isActive, toggleTimer } = useGameTimer(10); 

    // ✅ 1. ESTADOS AL PRINCIPIO
    const [homeStarters, setHomeStarters] = React.useState([]);
    const [awayStarters, setAwayStarters] = React.useState([]);
    const [isEditingHome, setIsEditingHome] = React.useState(false);
    const [isEditingAway, setIsEditingAway] = React.useState(false);

    // ✅ 2. USEMEMO
    const homePlayers = useMemo(() => {
        if (!players || !game) return [];
        return players.filter(p => Number(p.fk_id_team) === Number(game.fk_home_id_team));
    }, [players, game]);

    const awayPlayers = useMemo(() => {
        if (!players || !game) return [];
        return players.filter(p => Number(p.fk_id_team) === Number(game.fk_away_id_team));
    }, [players, game]);

    // ✅ 3. FUNCIONES DE APOYO
    const handleSelectStarter = (playerId, teamType) => {
        if (playerId === undefined || playerId === null) {
            console.error("Error: Se intentó seleccionar un jugador sin ID válido");
            return;
        }

        const isHome = teamType === 'home';
        const starters = isHome ? homeStarters : awayStarters;
        const setStarters = isHome ? setHomeStarters : setAwayStarters;

        if (starters.includes(playerId)) {
            setStarters(starters.filter(id => id !== playerId));
        } else {
            if (starters.length < 5) {
                setStarters([...starters, playerId]);
            } else {
                alert("Ya tienes 5 titulares seleccionados");
            }
        }
    };

    const handleAction = (idRelation, type) => {
        console.log(`ACCIÓN: ${type} | ID_RELACIÓN: ${idRelation}`);
    };

    // ✅ 4. RETURNS TEMPRANOS
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl font-black animate-pulse text-gray-500">CARGANDO ESTADÍSTICAS...</div>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center">
            <div className="text-red-500 font-black text-2xl">⚠️ ERROR AL CARGAR PARTIDO</div>
            <p className="text-gray-500">Verifica la conexión con el servidor.</p>
        </div>
    );

    return (
        <div className="w-full px-2 md:px-6 bg-gray-50 min-h-screen">
            
            {/* CABECERA: MARCADOR EN VIVO */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-8 rounded-b-[3rem] shadow-2xl mb-8 border-b-4 border-orange-500 gap-6 w-full">
                
                {/* Equipo Local */}
                <div className="text-center w-full md:w-1/3">
                    <h2 className="text-sm font-bold opacity-50 uppercase tracking-widest text-blue-400">Local</h2>
                    <p className="text-3xl font-black mb-2 uppercase italic text-white">
                        {game?.home_team?.name || game?.home_team_name || "Equipo Local"}
                    </p>
                    <div className="text-8xl font-black text-blue-400 tabular-nums">
                        {game?.home_score ?? 0}
                    </div>
                </div>

                {/* Reloj y Control */}
                <div className="text-center w-full md:w-1/3 order-first md:order-none">
                    <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-inner">
                        <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">
                            Período {game?.current_quarter ?? 1}
                        </p>
                        <p className="text-7xl font-mono font-black text-orange-500 leading-none">
                            {formatTime()}
                        </p>
                    </div>
                    <button 
                        onClick={toggleTimer}
                        className={`mt-4 w-full py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                            isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
                        {isActive ? 'DETENER RELOJ' : 'REANUDAR JUEGO'}
                    </button>
                </div>

                {/* Equipo Visitante */}
                <div className="text-center w-full md:w-1/3">
                    <h2 className="text-sm font-bold opacity-50 uppercase tracking-widest text-red-400">Visitante</h2>
                    <p className="text-3xl font-black mb-2 uppercase italic text-white">
                        {game?.away_team?.name || game?.away_team_name || "Equipo Visitante"}
                    </p>
                    <div className="text-8xl font-black text-red-400 tabular-nums">
                        {game?.away_score ?? 0}
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE TABLAS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-10">
                
                {/* Tabla Local */}
                <div className={`bg-white rounded-3xl shadow-xl border transition-all ${isEditingHome ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} overflow-hidden`}>
                    <div className="bg-blue-600 p-5 text-white font-black flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] opacity-70 uppercase tracking-widest">Nómina Oficial</span>
                            <span className="text-xl uppercase">{game?.home_team?.name || "Local"}</span>
                        </div>
                        
                        <button 
                            onClick={() => setIsEditingHome(!isEditingHome)}
                            className={`px-4 py-2 rounded-xl text-xs uppercase transition-all shadow-lg ${
                                isEditingHome ? 'bg-white text-blue-600' : 'bg-blue-800 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isEditingHome ? '✅ Finalizar' : '📋 Seleccionar Titulares'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-500 border-b font-bold">
                                <tr>
                                    <th className="p-5 text-center">#</th>
                                    <th className="p-5">Jugador</th>
                                    <th className="p-5 text-center">Acciones</th>
                                    <th className="p-5 text-center">PTS</th>
                                    <th className="p-5 text-center">F</th>
                                </tr>
                            </thead>
                            
                            {/* MODO MODO REGLA MODO EDITAR / PlayerRow */}
                            <tbody>
                                {isEditingHome ? (
                                    homePlayers.map(p => {
                                        const currentId = p.fk_id_player;
                                        const isStarter = homeStarters.includes(currentId);
                                        return (
                                            <tr 
                                                key={p.id_game_player} 
                                                onClick={() => handleSelectStarter(currentId, 'home')}
                                                className={`border-b transition-all cursor-pointer hover:bg-blue-50 ${
                                                    isStarter ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'opacity-100'
                                                }`}
                                            >
                                                <td className="p-5 text-center font-bold">{p.player?.number}</td>
                                                <td className="p-5">
                                                    <div className="flex flex-col">
                                                        <span className={`font-black uppercase ${isStarter ? 'text-blue-900' : ''}`}>
                                                            {p.player?.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                            {isStarter ? '🏀 Titular' : 'Banca'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className={`w-5 h-5 rounded-full mx-auto border-2 ${isStarter ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                        {isStarter && <span className="text-white text-[10px] flex items-center justify-center">✓</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center font-black">{p.points || 0}</td>
                                                <td className="p-5 text-center font-black text-red-500">{p.fouls || 0}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    homePlayers.map(p => (
                                        <PlayerRow 
                                            key={p.id_game_player} 
                                            player={{
                                                ...p,
                                                is_on_court: homeStarters.includes(p.fk_id_player)
                                            }} 
                                            onAction={handleAction} 
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabla Visitante */}
                <div className={`bg-white rounded-3xl shadow-xl border transition-all ${isEditingAway ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} overflow-hidden`}>
                    <div className="bg-red-600 p-5 text-white font-black flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] opacity-70 uppercase tracking-widest">Nómina Oficial</span>
                            <span className="text-xl uppercase">{game?.away_team?.name || "Visitante"}</span>
                        </div>
                        
                        <button 
                            onClick={() => setIsEditingAway(!isEditingAway)}
                            className={`px-4 py-2 rounded-xl text-xs uppercase transition-all shadow-lg ${
                                isEditingAway ? 'bg-white text-red-600' : 'bg-red-800 text-white hover:bg-red-700'
                            }`}
                        >
                            {isEditingAway ? '✅ Finalizar' : '📋 Seleccionar Titulares'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-500 border-b font-bold">
                                <tr>
                                    <th className="p-5 text-center">#</th>
                                    <th className="p-5">Jugador</th>
                                    <th className="p-5 text-center">Acciones</th>
                                    <th className="p-5 text-center">PTS</th>
                                    <th className="p-5 text-center">F</th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                {isEditingAway ? (
                                    awayPlayers.map(p => {
                                        const currentId = p.fk_id_player;
                                        const isStarter = awayStarters.includes(currentId);
                                        return (
                                            <tr 
                                                key={p.id_game_player} 
                                                onClick={() => handleSelectStarter(currentId, 'away')}
                                                className={`border-b transition-all cursor-pointer hover:bg-red-50 ${
                                                    isStarter ? 'bg-red-50/50 border-l-4 border-l-red-600' : 'opacity-100'
                                                }`}
                                            >
                                                <td className="p-5 text-center font-bold">{p.player?.number}</td>
                                                <td className="p-5">
                                                    <div className="flex flex-col">
                                                        <span className={`font-black uppercase ${isStarter ? 'text-red-900' : ''}`}>
                                                            {p.player?.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                            {isStarter ? '🏀 Titular' : 'Banca'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className={`w-5 h-5 rounded-full mx-auto border-2 ${isStarter ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
                                                        {isStarter && <span className="text-white text-[10px] flex items-center justify-center">✓</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center font-black">{p.points || 0}</td>
                                                <td className="p-5 text-center font-black text-red-500">{p.fouls || 0}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    awayPlayers.map(p => (
                                        <PlayerRow 
                                            key={p.id_game_player} 
                                            player={{
                                                ...p,
                                                is_on_court: awayStarters.includes(p.fk_id_player)
                                            }} 
                                            onAction={handleAction} 
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GameControl;