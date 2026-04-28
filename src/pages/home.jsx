import ActionWidget from "../components/actionWidget";
import { Users2Icon, Gamepad } from "lucide-react";
export default function Home() {

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <ActionWidget
          title="Equipos"
          description="Gestionar equipos"
          path="/teams"
          icon={<Users2Icon />}
          colorClass="bg-green-100 text-green-600"
        />
        <ActionWidget
        title="Gestión de Partidos"
        description="Programa o inicia un encuentro"
        path="/games"
        icon={<Gamepad />}
        colorClass="bg-green-100 text-green-600"
      />
      </div>

    </>
  );
}