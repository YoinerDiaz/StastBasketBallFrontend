import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, ArrowRight, Check, MapPin, Plus, Trash2, Layers, Calendar, Users } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../api/supabaseClient";
import { useTeams } from "../features/teams/hooks/useTeams";

export default function CreateTournamentWizard() {
  const navigate = useNavigate();
  const { data: teamsData = [] } = useTeams();
  const teams = Array.isArray(teamsData) ? teamsData : [];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Libre Masculino",
    format: "Fase de Grupos + Playoffs",
    location: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const [phases, setPhases] = useState([
    {
      name: "Fase Regular",
      type: "group_stage",
      sequence: 1,
      groups: [{ name: "Grupo A" }, { name: "Grupo B" }],
    },
    {
      name: "Playoffs",
      type: "knockout",
      sequence: 2,
      groups: [{ name: "Llave Final" }],
    },
  ]);

  const [teamAssignments, setTeamAssignments] = useState({});
  const [unassignedTeams, setUnassignedTeams] = useState([]);

  useEffect(() => {
    if (teams.length > 0 && unassignedTeams.length === 0) {
      setUnassignedTeams(teams.map((t) => t.id_team));
    }
  }, [teams]);

  const handleGeneralChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        name: `Fase ${phases.length + 1}`,
        type: "knockout",
        sequence: phases.length + 1,
        groups: [{ name: "Grupo Único" }],
      },
    ]);
  };

  const removePhase = (pIndex) => {
    if (phases.length === 1) {
      toast.error("Debe existir al menos una fase");
      return;
    }
    setPhases(phases.filter((_, i) => i !== pIndex));
  };
  const addGroup = (pIndex) => {
    const newPhases = [...phases];
    newPhases[pIndex].groups.push({ name: `Grupo ${String.fromCharCode(65 + newPhases[pIndex].groups.length)}` });
    setPhases(newPhases);
  };

  const removeGroup = (pIndex, gIndex) => {
    const newPhases = [...phases];
    if (newPhases[pIndex].groups.length === 1) {
      toast.error("Cada fase debe tener al menos un grupo");
      return;
    }
    newPhases[pIndex].groups = newPhases[pIndex].groups.filter((_, i) => i !== gIndex);
    setPhases(newPhases);
  };

  const assignTeamToGroup = (teamId, phaseIdx, groupIdx) => {
    const key = `${phaseIdx}-${groupIdx}`;
    const current = teamAssignments[key] || [];
    if (current.includes(teamId)) {
      setTeamAssignments({
        ...teamAssignments,
        [key]: current.filter((id) => id !== teamId),
      });
      setUnassignedTeams([...unassignedTeams, teamId]);
    } else {
      const newAssignments = { ...teamAssignments };
      Object.keys(newAssignments).forEach((k) => {
        newAssignments[k] = newAssignments[k].filter((id) => id !== teamId);
      });
      newAssignments[key] = [...(newAssignments[key] || []), teamId];
      setTeamAssignments(newAssignments);
      setUnassignedTeams(unassignedTeams.filter((id) => id !== teamId));
    }
  };

  const handleSaveTournament = async () => {
    if (!formData.name.trim()) {
      toast.error("Por favor ingresa el nombre del torneo");
      return;
    }

    setIsSubmitting(true);
    try {
      // ── 1. Insertar el torneo con TODOS los campos de la BD ──────────────────
      const { data: tData, error: tError } = await supabase
        .from("tournaments")
        .insert({
          name:       formData.name.trim(),
          category:   formData.category   || null,
          format:     formData.format     || null,
          location:   formData.location.trim() || null,
          start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          end_date:   formData.endDate   ? new Date(formData.endDate).toISOString()   : null,
          status:     "upcoming",
        })
        .select()
        .single();

      if (tError) throw tError;
      const tournamentId = tData.id_tournament;

      // ── 2. Insertar fases en cascada ─────────────────────────────────────────
      for (let pIdx = 0; pIdx < phases.length; pIdx++) {
        const phase = phases[pIdx];
        const { data: pData, error: pError } = await supabase
          .from("tournament_phases")
          .insert({
            fk_id_tournament: tournamentId,
            name:             phase.name,
            type:             phase.type,
            sequence_order:   phase.sequence,
          })
          .select()
          .single();

        if (pError) throw pError;
        const phaseId = pData.id_phase;

        // ── 3. Insertar grupos de esta fase ────────────────────────────────────
        for (let gIdx = 0; gIdx < phase.groups.length; gIdx++) {
          const group = phase.groups[gIdx];
          const { data: gData, error: gError } = await supabase
            .from("tournament_groups")
            .insert({
              fk_id_phase: phaseId,
              name:        group.name,
            })
            .select()
            .single();

          if (gError) throw gError;
          const groupId = gData.id_group;

          // ── 4. Inicializar standings de cada equipo asignado ─────────────────
          // Se incluye el campo `points` (FIBA: 0 al inicio) para que la BD
          // tenga el registro correcto desde el primer momento.
          const assignedTeamIds = teamAssignments[`${pIdx}-${gIdx}`] || [];
          if (assignedTeamIds.length > 0) {
            const standingsRows = assignedTeamIds.map((teamId) => ({
              fk_id_group:     groupId,
              fk_id_team:      teamId,
              games_played:    0,
              wins:            0,
              losses:          0,
              points:          0,   // campo FIBA que antes faltaba
              points_scored:   0,
              points_received: 0,
            }));

            const { error: sError } = await supabase
              .from("tournament_standings")
              .insert(standingsRows);
            if (sError) throw sError;
          }
        }
      }

      toast.success("¡Torneo creado exitosamente!");
      navigate(`/tournaments`);
    } catch (err) {
      console.error("Error al crear torneo:", err);
      // Mostrar el mensaje real de Supabase para facilitar el diagnóstico
      toast.error(`Error: ${err?.message || "Revisa la consola para más detalles."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Validación por paso antes de avanzar ────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("El nombre del torneo es obligatorio.");
        return false;
      }
      if (!formData.startDate) {
        toast.error("La fecha de inicio es obligatoria.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (phases.length === 0) {
        toast.error("Debe haber al menos una fase.");
        return false;
      }
      for (let pIdx = 0; pIdx < phases.length; pIdx++) {
        const phase = phases[pIdx];
        if (!phase.name.trim()) {
          toast.error(`La fase ${pIdx + 1} no tiene nombre.`);
          return false;
        }
        if (phase.groups.length === 0) {
          toast.error(`La fase "${phase.name}" debe tener al menos un grupo.`);
          return false;
        }
        for (let gIdx = 0; gIdx < phase.groups.length; gIdx++) {
          if (!phase.groups[gIdx].name.trim()) {
            toast.error(`Un grupo de la fase "${phase.name}" no tiene nombre.`);
            return false;
          }
        }
      }
      return true;
    }

    if (step === 3) {
      // Solo advertencia: equipos sin asignar no bloquean, pero se avisa.
      if (unassignedTeams.length > 0) {
        toast.warning(
          `Hay ${unassignedTeams.length} equipo(s) sin asignar a ningún grupo. Puedes continuar, pero quedarán fuera del torneo.`,
          { autoClose: 5000 }
        );
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const stepsList = [
    { num: 1, title: "Configuración General", subtitle: "Nombre, categoría y formato" },
    { num: 2, title: "Fases y Grupos", subtitle: "Estructura jerárquica" },
    { num: 3, title: "Asignación de Equipos", subtitle: "Distribución por grupos" },
    { num: 4, title: "Confirmación", subtitle: "Resumen y registro" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#01050D] py-10 px-6 sm:px-8 lg:px-12 w-full flex flex-col space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#01050D] text-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/tournaments")} className="p-3.5 rounded-2xl bg-white/10 hover:bg-[#F26513] transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Trophy className="w-7 h-7 text-[#F26513]" /> Nuevo Torneo Profesional
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración y despliegue de campeonato</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 w-full">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Progreso del asistente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {stepsList.map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div key={s.num} className={`flex items-center gap-4 p-4 rounded-2xl transition border ${isActive ? "border-[#F26513] bg-orange-50/50" : isCompleted ? "border-green-200 bg-green-50/30" : "border-slate-100 bg-[#F2F2F2]/50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${isActive ? "bg-[#F26513] text-white shadow-lg shadow-[#F26513]/40" : isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className={`text-xs font-black uppercase tracking-tight truncate ${isActive ? "text-[#01050D]" : "text-gray-700"}`}>{s.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mt-0.5">{s.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full bg-white rounded-[2.5rem] p-6 sm:p-8 lg:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col gap-8">
          <div className="flex flex-col gap-6 w-full">
            {step === 1 && (
              <div className="flex flex-col gap-6 w-full">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#01050D]">1. Configuración General</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Detalles principales del campeonato</p>
                </div>
                <div className="flex flex-col gap-5 w-full">
                  <div className="w-full flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700">Nombre del Torneo *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleGeneralChange} placeholder="Ej: Liga Mayor de Baloncesto 2026..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F26513]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    <div className="w-full flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">Categoría</label>
                      <select name="category" value={formData.category} onChange={handleGeneralChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F26513]">
                        <option>Libre Masculino</option>
                        <option>Libre Femenino</option>
                        <option>U18 Mixto</option>
                        <option>Veteranos</option>
                      </select>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">Formato Principal</label>
                      <select name="format" value={formData.format} onChange={handleGeneralChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F26513]">
                        <option>Fase de Grupos + Playoffs</option>
                        <option>Todos contra todos (Liga)</option>
                        <option>Eliminación Directa (Playoffs)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    <div className="w-full flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">Ubicación / Sede</label>
                      <input type="text" name="location" value={formData.location} onChange={handleGeneralChange} placeholder="Ej: Coliseo Municipal..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F26513]" />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">Fecha de Inicio</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleGeneralChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F26513]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          {step === 2 && (
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#01050D]">2. Fases y Grupos</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Estructura jerárquica del torneo</p>
                </div>
                <button type="button" onClick={addPhase} className="px-5 py-2.5 rounded-xl bg-[#01050D] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-[#F26513] transition shadow-md">
                  <Plus className="w-4 h-4" /> Agregar Fase
                </button>
              </div>
              <div className="flex flex-col gap-6 w-full">
                {phases.map((phase, pIdx) => (
                  <div key={pIdx} className="p-6 rounded-2xl border border-slate-200 bg-[#F2F2F2]/50 flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <span className="w-8 h-8 rounded-xl bg-[#01050D] text-white flex items-center justify-center font-bold text-xs shrink-0">{pIdx + 1}</span>
                        <input type="text" value={phase.name} onChange={(e) => { const newP = [...phases]; newP[pIdx].name = e.target.value; setPhases(newP); }} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-normal text-slate-900 bg-white flex-1" />
                        <select value={phase.type} onChange={(e) => { const newP = [...phases]; newP[pIdx].type = e.target.value; setPhases(newP); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white">
                          <option value="group_stage">Fase de Grupos</option>
                          <option value="knockout">Eliminatoria</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removePhase(pIdx)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="pl-6 border-l-2 border-slate-200 flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-slate-600">Grupos / Llaves</span>
                        <button type="button" onClick={() => addGroup(pIdx)} className="text-xs font-semibold text-[#F26513] hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Añadir grupo
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                        {phase.groups.map((group, gIdx) => (
                          <div key={gIdx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 w-full">
                            <input type="text" value={group.name} onChange={(e) => { const newP = [...phases]; newP[pIdx].groups[gIdx].name = e.target.value; setPhases(newP); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-normal text-slate-900 bg-white flex-1" />
                            <button type="button" onClick={() => removeGroup(pIdx, gIdx)} className="text-slate-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#01050D]">3. Asignación de Equipos</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Distribuye los equipos disponibles en las fases y grupos</p>
              </div>
              <div className="flex flex-col gap-6 w-full">
                {phases.map((phase, pIdx) => (
                  <div key={pIdx} className="p-6 rounded-2xl border border-slate-200 bg-[#F2F2F2]/50 flex flex-col gap-4 w-full">
                    <h3 className="text-sm font-bold text-[#01050D] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#F26513]" /> {phase.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {phase.groups.map((group, gIdx) => {
                        const assignedIds = teamAssignments[`${pIdx}-${gIdx}`] || [];
                        return (
                          <div key={gIdx} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-3 w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-[#01050D]">{group.name}</span>
                              <span className="text-[11px] font-medium text-slate-500">{assignedIds.length} equipos</span>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              {assignedIds.map((teamId) => {
                                const teamObj = teams.find((t) => t.id_team === teamId);
                                return (
                                  <div key={teamId} className="flex items-center justify-between bg-orange-50/50 px-3 py-2 rounded-lg border border-orange-200 text-xs font-semibold text-[#01050D] w-full">
                                    <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#F26513]" /> {teamObj?.name}</span>
                                    <button type="button" onClick={() => assignTeamToGroup(teamId, pIdx, gIdx)} className="text-red-600 font-bold hover:scale-110 transition">✕</button>
                                  </div>
                                );
                              })}
                            </div>
                            <select onChange={(e) => { if (e.target.value) assignTeamToGroup(Number(e.target.value), pIdx, gIdx); e.target.value = ""; }} defaultValue="" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-normal text-slate-900 bg-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#F26513]">
                              <option value="" disabled>+ Asignar equipo disponible...</option>
                              {teams.filter((t) => unassignedTeams.includes(t.id_team)).map((t) => (
                                <option key={t.id_team} value={t.id_team}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6 w-full">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#01050D]">4. Resumen y Confirmación</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Verifica los datos antes de registrar</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F2F2F2]/70 border border-slate-200 flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div className="w-full flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Nombre del Torneo</span>
                    <p className="text-base font-bold text-[#01050D]">{formData.name || "Sin nombre"}</p>
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Categoría & Formato</span>
                    <p className="text-sm font-semibold text-[#01050D]">{formData.category} — {formData.format}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div className="w-full flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Ubicación</span>
                    <p className="text-sm font-semibold text-[#01050D]">{formData.location || "Por definir"}</p>
                  </div>
                  <div className="w-full flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Fecha de Inicio</span>
                    <p className="text-sm font-semibold text-[#01050D]">{formData.startDate || "Hoy"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between w-full">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gray-200 hover:bg-gray-300 transition text-[#01050D]">Anterior</button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#F26513] hover:bg-[#D93D04] text-white flex items-center gap-2 shadow-lg shadow-[#F26513]/30 transition">Siguiente <ArrowRight className="w-4 h-4" /></button>
            ) : (
              <button type="button" disabled={isSubmitting} onClick={handleSaveTournament} className="px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg shadow-green-600/30 disabled:opacity-50 transition">
                <Trophy className="w-4 h-4" />
                <span>{isSubmitting ? "Registrando en Supabase..." : "Crear Torneo Profesional"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

