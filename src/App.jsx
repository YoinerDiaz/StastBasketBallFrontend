import { Routes, Route } from "react-router-dom";
import Teams from "./features/teams/pages/teams";
import TeamsDetails from "./features/teams/pages/teamDetails";
import Home from "./pages/home";
import CreateGame from "./features/games/pages/CreateGame";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamsDetails />} />
        <Route path="/games" element={<CreateGame />} />
      </Routes>
    </>
  )
}

export default App
