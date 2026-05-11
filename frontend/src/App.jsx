import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";

import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import ScanPage from "@/pages/scan/ScanPage";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ActionPage from "./pages/action/ActionPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen text-foreground">

      {!hideLayout && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={<Profile />} />
          <Route path="/action" element={<ActionPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!hideLayout && (
        <footer className="text-center py-6 border-t bg-white">
          <p className="text-sm text-gray-400">
            © 2026 <span className="font-semibold text-green-800">REKLE</span>. 
            Bangun kebiasaan ramah lingkungan.
          </p>
        </footer>
      )}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;