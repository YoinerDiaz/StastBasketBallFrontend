import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActionWidget({ title, icon, path, colorClass, description }){
return(
        <Link
      to={path}
      className={`
        group relative overflow-hidden rounded-[2rem] p-6 h-40
        bg-white border border-gray-100 shadow-sm
        hover:shadow-xl hover:border-[#f2743a]/20 hover:-translate-y-1
        transition-all duration-300 flex flex-col justify-between
      `}
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-colors ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-gray-800 font-bold text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
        <div className="flex items-center text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity p-1">
          Ir ahora <ArrowRight className="ml-1 w-3 h-3" />
        </div>
      </div>
    </Link>
);
} 
