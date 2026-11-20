import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActionWidget({ title, icon, path, description, accentColor }) {
  return (
    <Link
      to={path}
      className="group relative flex h-44 flex-col justify-between overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110 ${accentColor}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-base font-black text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-3 flex items-center text-[10px] font-black uppercase tracking-widest text-green-600 opacity-0 transition group-hover:opacity-100">
          Ir ahora <ArrowRight className="ml-1 h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
