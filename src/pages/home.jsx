import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Gamepad, LineChart, Users2Icon, Trophy, LogOut } from "lucide-react";
import ActionWidget from "../components/actionWidget";
import { useGames } from "../features/games/hooks/useGames";
import { usePlayers } from "../features/players/hooks/usePlayers";
import { useTeams } from "../features/teams/hooks/useTeams";
import { supabase } from "../api/supabaseClient";

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const target = Number(value) || 0;
  
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const increment = Math.max(1, Math.ceil(target / 36));
    const timer = setInterval(() => {
      setCount((current) => {
        if (current + increment >= target) {
          clearInterval(timer);
          return target;
        }
        return current + increment;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [target]);

  return target === 0 ? "0" : <span>{count}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: gamesData = [] } = useGames();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const { data: teamsData = [] } = useTeams();
  const { data: playersData = [] } = usePlayers();
  
  const games = Array.isArray(gamesData) ? gamesData : [];
  const teams = Array.isArray(teamsData) ? teamsData : [];
  const players = Array.isArray(playersData) ? playersData : [];
  const liveGames = games.filter((game) => [1, "in_progress", "live"].includes(String(game.status || '').toLowerCase()));
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: "Equipos", value: teams.length, color: "text-green-600 bg-green-50" },
    { label: "Jugadores", value: players.length, color: "text-blue-600 bg-blue-50" },
    { label: "Partidos", value: games.length, color: "text-purple-600 bg-purple-50" },
    { label: "En vivo", value: liveGames.length, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pb-24 pt-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 50px,rgba(255,255,255,.08) 50px,rgba(255,255,255,.08) 51px),repeating-linear-gradient(0deg,transparent,transparent 50px,rgba(255,255,255,.08) 50px,rgba(255,255,255,.08) 51px)" 
        }} />
        
        {/* Top Navbar */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-black text-xs">S</div>
            <span className="text-sm font-black uppercase tracking-tighter">Stats Basketball</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-green-500/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-green-300">Panel de administración</p>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Bienvenido</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">Administra equipos, partidos y estadísticas de baloncesto desde un solo lugar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/games/createGame")} className="rounded-2xl bg-green-600 px-6 py-3 font-bold transition hover:bg-green-500 shadow-lg shadow-green-600/20">Nuevo partido</button>
              <button onClick={() => navigate("/tournaments")} className="rounded-2xl bg-[#F26513] text-white px-6 py-3 font-bold transition hover:bg-[#D93D04] flex items-center gap-2 shadow-lg">
                <Trophy className="w-4 h-4" />
                Torneos
              </button>
              <button onClick={() => navigate("/tournaments/create")} className="rounded-2xl bg-white text-[#01050D] px-6 py-3 font-bold transition hover:bg-gray-100 flex items-center gap-2 shadow-lg">
                <Trophy className="w-4 h-4 text-[#F26513]" />
                Nuevo Torneo
              </button>
              <button onClick={() => navigate("/teams")} className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-bold backdrop-blur transition hover:bg-white/20">Ver equipos</button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-widest text-green-300">{currentTime.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="mt-2 text-5xl font-black tabular-nums">{currentTime.toLocaleTimeString("es-ES")}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> Sistema en línea
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className={`mb-4 inline-flex rounded-2xl px-3 py-1 text-xs font-black uppercase tracking-widest ${metric.color}`}>
                {metric.label}
              </span>
              <p className="text-4xl font-black text-gray-950">
                <AnimatedCounter value={metric.value} />
              </p>
            </article>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-black text-gray-950">Acciones rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionWidget 
              title="Equipos" 
              description="Gestionar equipos" 
              path="/teams" 
              icon={<Users2Icon className="h-6 w-6" />} 
              accentColor="bg-green-100 text-green-600" 
            />
            <ActionWidget 
              title="Partidos" 
              description="Ver listado de encuentros" 
              path="/games" 
              icon={<Gamepad className="h-6 w-6" />} 
              accentColor="bg-blue-100 text-blue-600" 
            />
            <ActionWidget 
              title="Nuevo partido" 
              description="Programar un encuentro" 
              path="/games/createGame" 
              icon={<CalendarPlus className="h-6 w-6" />} 
              accentColor="bg-purple-100 text-purple-600" 
            />
            <ActionWidget 
              title="Control en vivo" 
              description="Administrar partidos" 
              path="/games" 
              icon={<LineChart className="h-6 w-6" />} 
              accentColor="bg-amber-100 text-amber-600" 
            />
          </div>
        </section>
      </main>
    </div>

  );
}