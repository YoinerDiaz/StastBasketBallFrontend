import { Routes, Route } from "react-router-dom";
import Teams from "./features/teams/pages/teams";
import TeamsDetails from "./features/teams/pages/teamDetails";
import Home from "./pages/home";
import Game from "./features/games/pages/game";
import CreateGame from "./features/games/pages/CreateGame";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlayerDetail from "./features/players/pages/playerDetail";

function App() {
  return (
    <div className="min-h-screen bg-gray-50"> {/* Sugerencia: Un contenedor base */}
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamsDetails />} />
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/games" element={<Game />} />
        <Route path="/games/createGame" element={<CreateGame />} />
      </Routes>
    </div>
  );
}

export default App;