import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";


/* ================================
   🔐 PROTECTED ROUTE
================================ */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* ================================
   🎨 LAYOUT (Navbar Control)
================================ */
function Layout() {
  const location = useLocation();

  // ❌ halaman tanpa navbar
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen text-foreground">

      {/* Navbar */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔐 PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ❌ fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </div>
  );
}


/* ================================
   🚀 MAIN APP
================================ */
function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;