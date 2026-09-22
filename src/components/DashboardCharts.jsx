import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

export default function DashboardCharts({ games, teams, players, gamesLoading, teamsLoading, playersLoading }) {
  const statusData = [
    { name: "Programados", value: games.filter(g => ["programado", "scheduled"].includes(g.status?.toLowerCase())).length, color: "#22c55e" },
    { name: "En Progreso", value: games.filter(g => ["en_progreso", "in_progress", "live"].includes(g.status?.toLowerCase())).length, color: "#ef4444" },
    { name: "Finalizados", value: games.filter(g => ["finalizado", "finished"].includes(g.status?.toLowerCase())).length, color: "#6b7280" },
  ];

  const teamData = teams.slice(0, 5).map(team => ({
    name: team.name || `Equipo #${team.id_team}`,
    value: players.filter(p => p.fk_id_team === team.id_team).length || 1
  }));

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px w-8 bg-green-500/60" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Analisis Visual</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico de barras */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Partidos por Estado</h3>
              <p className="text-xs text-gray-400 font-medium">Distribucion actual</p>
            </div>
          </div>

          {gamesLoading ? (
            <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 700 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grafico circular */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Distribucion de Equipos</h3>
              <p className="text-xs text-gray-400 font-medium">Jugadores por equipo</p>
            </div>
          </div>

          {teamsLoading || playersLoading ? (
            <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
          ) : teams.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={teamData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {teamData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {teamData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-gray-500">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <PieChartIcon className="w-10 h-10 text-gray-300" />
              <p className="text-gray-400 text-sm font-bold">No hay equipos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}