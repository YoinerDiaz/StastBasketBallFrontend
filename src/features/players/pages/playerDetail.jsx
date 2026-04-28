import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayerStats, usePlayerById } from "../hooks/usePlayers"; // Importamos ambos hooks
import { 
  // Componentes para el Radar (El ADN del jugador)
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 

  // Componentes para el Área Apilada (Composición de puntos)
  AreaChart, Area, 

  // Componentes para el Mix de Barras y Líneas (Impacto)
  BarChart, Bar, Line, 

  // Componentes comunes de estructura y utilidad
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowLeft, User, Trophy, Target, Activity, Loader2, Shield, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Traemos la información básica (Nombre, etc.)
  const { data: playerInfo, isLoading: loadingInfo } = usePlayerById(id);
  
  // 2. Traemos las estadísticas (Carrera e Historial)
  const { career, history } = usePlayerStats(id);

// 1. Datos para los gráficos de historial (Barras, Áreas, Líneas)
  const chartData = useMemo(() => {
    if (!history.data || !Array.isArray(history.data)) return [];
    
    return history.data.map((game, index) => {
      const p2 = Number(game.points_two_made || 0) * 2;
      const p3 = Number(game.points_three_made || 0) * 3;
      const ft = Number(game.free_throw_made || 0);
      
      return {
        name: `J${index + 1}`,
        "Tiros de 2": p2,
        "Triples": p3,
        "Libres": ft,
        "Total": p2 + p3 + ft,
        "Asistencias": Number(game.assists || 0),
        "Rebotes": Number(game.rebounds || 0),
        "Robos": Number(game.steals || 0),
        "Tapones": Number(game.blocks || 0)
      };
    }).reverse();
  }, [history.data]);

// 2. Datos para el RADAR (Promedios de carrera normalizados)
  const radarData = useMemo(() => {
    if (!career.data) return [];
    const d = career.data;
    const games = d.games_played || 1;

    // Calculamos el promedio por partido y aplicamos un factor de escala 
    // para que todas las variables se vean equilibradas en el gráfico
    return [
      { subject: 'Puntos', A: (d.total_points / games), fullMark: 30 },
      { subject: 'Asistencias', A: (d.assists / games) * 2.5, fullMark: 30 },
      { subject: 'Rebotes', A: (d.rebounds / games) * 2, fullMark: 30 },
      { subject: 'Robos', A: (d.steals / games) * 6, fullMark: 30 },
      { subject: 'Tapones', A: (d.blocks / games) * 8, fullMark: 30 },
      { subject: 'Triples', A: (d.p3_made / games) * 5, fullMark: 30 },
    ];
  }, [career.data]);

  console.log("Datos del jugador:", playerInfo);
  // Pantalla de carga combinada
  if (loadingInfo || career.isLoading || history.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#008000]" />
        <p className="text-gray-400 font-medium text-xl">Sincronizando perfil y estadísticas...</p>
      </div>
    );
  }

  const d = career.data || {};
  // Construimos el nombre real desde playerInfo
  const playerName = playerInfo ? `${playerInfo.name}` : `Jugador #${id}`;
  const playerNumber = playerInfo?.number || "00";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8 w-full max-w-full">
      
      {/* Barra de Navegación superior */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#008000] transition font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al Tablero
        </button>
        <span className="text-gray-300 font-mono text-sm tracking-widest uppercase font-bold">Elite Stats System</span>
      </div>

      {/* Header con Foto, Nombre y NÚMERO */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
        
        {/* Decoración de fondo (opcional para estilo) */}
        <div className="absolute top-0 right-0 p-10 opacity-5 select-none pointer-events-none">
            <span className="text-[11rem] font-black leading-none">{playerNumber}</span>
        </div>

        {/* Contenedor de Avatar + Número Flotante */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-[2.5rem] bg-green-50 flex items-center justify-center text-[#008000] border-4 border-white shadow-2xl relative z-10">
            <User className="w-16 h-16" />
          </div>
          
          {/* Badge del Número del Jugador */}
          <div className="absolute -bottom-3 -right-3 bg-[#008000] text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-xl border-4 border-white z-20">
            <span className="text-[10px] font-bold leading-none uppercase opacity-80">No.</span>
            <span className="text-xl font-black leading-none">{playerNumber}</span>
          </div>
        </div>

        {/* Información de Texto */}
        <div className="text-center lg:text-left flex-1 space-y-4 relative z-10">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <span className="bg-green-100 text-[#008000] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Active Roster
                </span>
            </div>
            <h1 className="text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">
              {playerName}
            </h1>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <div className="bg-gray-100 px-6 py-2 rounded-2xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 font-black">{d.minutes || 0} <span className="text-[10px] text-gray-400 uppercase">Minutos Totales</span></span>
            </div>
            <div className="bg-green-600 px-6 py-2 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-100">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="text-white font-black">{d.avg_points || 0} <span className="text-[10px] text-green-200 uppercase">PPG Promedio</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Puntos Carrera", val: d.total_points, icon: Target, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Partidos", val: d.games_played, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Asistencias", val: d.assists, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Rebotes", val: d.rebounds, icon: User, color: "text-green-500", bg: "bg-green-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-xl">
            <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} mb-4`}>
                <stat.icon className="w-8 h-8" />
            </div>
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{stat.val || 0}</span>
            <span className="text-sm text-gray-400 uppercase font-black tracking-widest mt-2">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Grid Secundario (Robos, Tapones, etc.) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {[
            { label: "Robos", val: d.steals, icon: Shield, color: "text-indigo-600" },
            { label: "Tapones", val: d.blocks, icon: Target, color: "text-pink-600" },
            { label: "Faltas", val: d.fouls, icon: AlertCircle, color: "text-red-600" },
            { label: "Pérdidas", val: d.turnovers, icon: Activity, color: "text-amber-700" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`${s.color} bg-gray-50 p-3 rounded-xl`}>
                        <s.icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-gray-400 uppercase font-black tracking-tighter">{s.label}</p>
                </div>
                <p className="text-3xl font-black text-gray-900">{s.val || 0}</p>
            </div>
          ))}
      </div>

      {/* Eficacia de Tiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Tiros de 2 Puntos", made: d.p2_made, att: d.p2_att, hex: "#16a34a" },
          { title: "Lanzamientos Triple", made: d.p3_made, att: d.p3_att, hex: "#2563eb" },
          { title: "Efectividad Libres", made: d.ft_made, att: d.ft_att, hex: "#ea580c" },
        ].map((type, i) => {
          const percent = type.att ? ((type.made / type.att) * 100).toFixed(1) : "0.0";
          return (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{type.title}</h4>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <span className="text-5xl font-black text-gray-900 leading-none">{type.made || 0}</span>
                  <span className="text-2xl text-gray-300 font-bold ml-2">/ {type.att || 0}</span>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black" style={{color: type.hex}}>{percent}%</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Accuracy</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full mt-6 overflow-hidden">
                <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: type.hex }}
                />
              </div>
            </div>
          )
        })}
      </div>

{/* --- SECCIÓN DE ANÁLISIS VISUAL DE ALTO NIVEL --- */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
  
  {/* 1. RADAR: ADN DEL JUGADOR */}
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
    <div className="text-center mb-6">
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Atributos Elite</h3>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Balance de Juego</p>
    </div>
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: '900' }} 
          />
          <Radar
            name="Rendimiento"
            dataKey="A"
            stroke="#008000"
            fill="#008000"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* 2. ÁREA: COMPOSICIÓN DE ANOTACIÓN */}
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 xl:col-span-2">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Evolución de Puntos</h3>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Desglose por tipo de tiro</p>
      </div>
      <Legend 
        verticalAlign="top" 
        align="right" 
        iconType="circle"
        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
      />
    </div>
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradP3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
            <linearGradient id="gradP2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey="Triples" stackId="1" stroke="#3b82f6" strokeWidth={3} fill="url(#gradP3)" />
          <Area type="monotone" dataKey="Tiros de 2" stackId="1" stroke="#10b981" strokeWidth={3} fill="url(#gradP2)" />
          <Area type="monotone" dataKey="Libres" stackId="1" stroke="#f97316" strokeWidth={3} fill="#fff7ed" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* 3. BARRAS + LÍNEA: IMPACTO TOTAL */}
  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 xl:col-span-3">
    <div className="mb-10">
      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Impacto en el Juego</h3>
      <p className="text-gray-400 text-sm font-medium italic">Relación entre anotación masiva y asistencias generadas</p>
    </div>
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 'bold'}} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{fill: '#f9fafb'}} 
            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
          />
          <Legend verticalAlign="bottom" height={36}/>
          <Bar dataKey="Total" name="Puntos Totales" fill="#008000" radius={[12, 12, 0, 0]} barSize={50} />
          <Line 
            type="stepAfter" 
            dataKey="Asistencias" 
            name="Asistencias" 
            stroke="#3b82f6" 
            strokeWidth={4} 
            dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
    </div>
  );
}