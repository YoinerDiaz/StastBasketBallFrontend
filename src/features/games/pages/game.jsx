import { useState } from "react";
import { Link } from "react-router-dom";

export default function Game() {
    const [scheduledGames, setScheduledGames] = useState([]);
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-10 bg-gray-50 min-h-screen">
            
            {/* SECCIÓN 1: PRÓXIMOS PARTIDOS */}
            <section className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <h2 className="text-xl font-black text-gray-800 uppercase">Próximos Juegos</h2>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">CALENDARIO</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scheduledGames.length > 0 ? (
                        scheduledGames.map(game => (
                            <div key={game.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                                {/* Info del juego */}
                                <button className="bg-green-600 text-white text-[10px] font-black px-4 py-3 rounded-2xl">
                                    INICIAR
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 bg-gray-200/30 rounded-[2rem] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                            <p className="text-xs font-bold uppercase tracking-widest">No hay partidos en lista</p>
                        </div>
                    )}
                </div>
            </section>

            <hr className="border-gray-200" />

            {/* SECCIÓN 2: ACCIONES RÁPIDAS */}
            <section className="space-y-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Nuevas Operaciones</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/games/createGame?mode=now" className="flex items-center gap-6 p-6 bg-green-600 rounded-[2.5rem] shadow-xl shadow-green-100 active:scale-95 transition-all">
                        <div className="bg-white/20 p-4 rounded-3xl text-white text-2xl">G</div>
                        <div>
                            <h3 className="text-white font-black uppercase text-sm tracking-wide">Jugar Ahora</h3>
                            <p className="text-green-100 text-xs">Inicia el cronómetro ya</p>
                        </div>
                    </Link>

                    <Link to="/games/createGame?mode=schedule" className="flex items-center gap-6 p-6 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm active:scale-95 transition-all">
                        <div className="bg-gray-100 p-4 rounded-3xl text-gray-500 text-2xl font-bold">C</div>
                        <div>
                            <h3 className="text-gray-800 font-black uppercase text-sm tracking-wide">Programar</h3>
                            <p className="text-gray-400 text-xs">Reserva para después</p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}