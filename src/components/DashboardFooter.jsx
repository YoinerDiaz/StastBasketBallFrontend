import { GitBranch, Heart, Code2, Shield, Clock, Activity } from "lucide-react";

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  const systemInfo = [
    { label: "Version", value: "1.0.0", icon: Code2 },
    { label: "Estado", value: "Operativo", icon: Activity, color: "text-green-500" },
    { label: "Seguridad", value: "Activa", icon: Shield, color: "text-blue-500" },
  ];

  const quickLinks = [
    { label: "Documentacion", href: "#" },
    { label: "Soporte", href: "#" },
    { label: "Reportar bug", href: "#" },
    { label: "Sugerencias", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Info del sistema */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-gray-400">Sistema</h3>
            <div className="space-y-3">
              {systemInfo.map((info) => (
                <div key={info.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <info.icon className={`w-4 h-4 ${info.color || "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{info.label}</p>
                    <p className="text-sm font-bold">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces rapidos */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-gray-400">Enlaces</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors font-medium py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Sobre el proyecto */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-gray-400">StatsBasket</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sistema de gestion estadistica para baloncesto. Desarrollado para facilitar el control de partidos, equipos y jugadores.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hecho con</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>para el baloncesto</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{currentYear} StatsBasket. Todos los derechos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}