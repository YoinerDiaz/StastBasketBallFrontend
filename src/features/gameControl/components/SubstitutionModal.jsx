export default function SubstitutionModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200">
        <h3 className="text-xl font-black uppercase text-[#01050D]">Sustitución de Jugador</h3>
        <p className="text-xs font-bold text-gray-500">Selecciona el jugador que ingresa y el que sale de la cancha.</p>
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-gray-200 font-black text-xs uppercase tracking-widest text-[#01050D] hover:bg-gray-300 transition">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 rounded-2xl bg-[#F26513] font-black text-xs uppercase tracking-widest text-white hover:bg-[#D93D04] transition">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
