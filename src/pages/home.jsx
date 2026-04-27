import ActionWidget from "../components/actionWidget";
import {Users2Icon, Gamepad} from "lucide-react";
export default function Home(){

    return(
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
          title="Juegos"
          description="Iniciar Partidos"
          path="/games"
          icon={<Gamepad />}
          colorClass="bg-blue-100 text-blue-600"
        />
      </div>
      
      </> 
    );
}