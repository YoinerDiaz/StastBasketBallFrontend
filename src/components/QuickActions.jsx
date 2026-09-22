import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard, Zap, Trophy, Users, UserPlus, Gamepad, BarChart3, ArrowRight } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const shortcuts = [
    { key: "g + c", label: "Crear juego", path: "/game-control", icon: Gamepad, color: "bg-blue-50 text-blue-600" },
    { key: "t + n", label: "Nuevo equipo", path: "/teams", icon: Users, color: "bg-green-50 text-green-600" },
    { key: "p + n", label: "Nuevo jugador", path: "/players", icon: UserPlus, color: "bg-purple-50 text-purple-600" },
    { key: "l + t", label: "Tabla de posiciones", path: "/leaderboard", icon: Trophy, color: "bg-amber-50 text-amber-600" },
    { key: "e + s", label: "Estadisticas", path: "/statistics", icon: BarChart3, color: "bg-red-50 text-red-600" },
  ];

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key.toLowerCase();
    const shortcut = shortcuts.find(s => s.key.startsWith(key));
    if (shortcut && e.shiftKey) {
      e.preventDefault();
      navigate(shortcut.path);
    }
  }, [navigate, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px w-8 bg-green-500/60" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Accesos Rapidos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Atajos de Teclado</h3>
              <p className="text-xs text-gray-400 font-medium">Presiona Shift + la tecla para navegar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.key}
                onClick={() => navigate(shortcut.path)}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${shortcut.color} flex items-center justify-center flex-shrink-0`}>
                  <shortcut.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{shortcut.label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <kbd className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-md border border-gray-200">Shift</kbd>
                    <span className="text-gray-300 text-xs">+</span>
                    <kbd className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-md border border-gray-200">{shortcut.key.split(" + ")[0]}</kbd>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black">Acciones Rapidas</h3>
              <p className="text-xs text-gray-400 font-medium">Tareas mas comunes</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Iniciar Partido", path: "/game-control", icon: Gamepad, color: "bg-blue-500/20 text-blue-400" },
              { label: "Gestionar Equipos", path: "/teams", icon: Users, color: "bg-green-500/20 text-green-400" },
              { label: "Ver Tabla", path: "/leaderboard", icon: Trophy, color: "bg-amber-500/20 text-amber-400" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-left group"
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold flex-1">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}