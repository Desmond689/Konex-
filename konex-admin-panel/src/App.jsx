import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import RequireStaff from "./components/RequireStaff";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Staff from "./pages/Staff";
import Squads from "./pages/Squads";
import Games from "./pages/Games";
import GameForm from "./pages/GameForm";
import Audit from "./pages/Audit";
import Landing from "./pages/Landing";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route
            element={
              <RequireStaff>
                <Layout />
              </RequireStaff>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/squads" element={<Squads />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/new" element={<GameForm />} />
            <Route path="/games/:id" element={<GameForm />} />
            <Route path="/audit" element={<Audit />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
