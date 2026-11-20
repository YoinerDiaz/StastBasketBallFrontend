import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { supabase } from "./api/supabaseClient";

import UpcomingGames from "./features/games/pages/UpcomingGames";
import TeamsDetails from "./features/teams/pages/teamDetails";
import Teams from "./features/teams/pages/teams";
import Home from "./pages/home";
import CreateTournamentWizard from "./pages/CreateTournamentWizard";
import TournamentsList from "./pages/TournamentsList";
import TournamentDetail from "./pages/TournamentDetail";

import GameControl from './features/gameControl/pages/gameControl';
import CreateGame from "./features/games/pages/CreateGame";
import PlayerDetail from "./features/players/pages/playerDetail";
// IMPORTANTE: Asegúrate de ajustar esta ruta al archivo real de tu GameSummary
import Login from './components/login';
import GameSummary from './features/games/pages/GameSummary';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600 font-medium">
        Cargando autenticación...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* Rutas privadas */}
        <Route 
          path="/" 
          element={session ? <Home /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/teams" 
          element={session ? <Teams /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/teams/:teamId" 
          element={session ? <TeamsDetails /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/players/:id" 
          element={session ? <PlayerDetail /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/games" 
          element={session ? <UpcomingGames /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/games/createGame" 
          element={session ? <CreateGame /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/game-control/:gameId" 
          element={session ? <GameControl /> : <Navigate to="/login" replace />} 
        />
        {/* RUTA AÑADIDA */}
        <Route 
          path="/game-summary/:gameId" 
          element={session ? <GameSummary /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tournaments/create" 
          element={session ? <CreateTournamentWizard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tournaments" 
          element={session ? <TournamentsList /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tournaments/:id" 
          element={session ? <TournamentDetail /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;