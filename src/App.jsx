import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { supabase } from "./api/supabaseClient";

import Home from "./pages/home";
import Teams from "./features/teams/pages/teams";
import TeamsDetails from "./features/teams/pages/teamDetails";
import Game from "./features/games/pages/game";
import CreateGame from "./features/games/pages/CreateGame";
import PlayerDetail from "./features/players/pages/playerDetail";
import GameControl from './features/gameControl/pages/gameControl';
import Login from './components/login';

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
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Routes>
        {/* Ruta pública: Si ya hay sesión activa, manda al Home */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* Rutas privadas: Si no hay sesión, fuerza la redirección a /login */}
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
          element={session ? <Game /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/games/createGame" 
          element={session ? <CreateGame /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/game-control/:gameId" 
          element={session ? <GameControl /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;