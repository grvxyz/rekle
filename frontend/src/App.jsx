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
import ScanPage from "./pages/scan/ScanPage";
import UserDashboard from "./pages/dashboard/Dashboard.jsx";
import AdminDashboard from "./pages/admin/dashboard/Dashboard.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ActionPage from "./pages/action/ActionPage";

// 🔐 Protected Route (login wajib, superuser diarahkan ke admin)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";

  if (!token) return <Navigate to="/login" replace />;
  if (isSuperuser) return <Navigate to="/admin/dashboard" replace />;

  return children;
}

// 🔒 Admin Route (superuser only)
function AdminRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";

  if (!token) return <Navigate to="/login" replace />;
  if (!isSuperuser) return <Navigate to="/dashboard" replace />;

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

          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* USER */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/action"
            element={
              <ProtectedRoute>
                <ActionPage />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      {!hideLayout && (
        <footer className="text-center py-6 border-t bg-white">
          <p className="text-sm text-gray-400">
            © 2026{" "}
            <span className="font-semibold text-green-800">REKLE</span>. 
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