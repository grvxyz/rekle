import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import AdminNavbar from "./components/layout/AdminNavbar.jsx";
import AdminSidebar from "./components/layout/AdminSidebar.jsx";

import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";

import ScanPage from "./pages/scan/ScanPage";
import UserDashboard from "./pages/dashboard/Dashboard.jsx";
import Profile from "./pages/profile/Profile.jsx";
import ActionPage from "./pages/action/ActionPage";

import AdminDashboard from "./pages/admin/dashboard/Dashboard.jsx";
import KonfirmasiAksi from "./pages/admin/konfirmasi/KonfirmasiAksi.jsx";
import UserManagement from "./pages/admin/user/UserManagement.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isSuperuser =
    localStorage.getItem("is_superuser") === "true";

  if (!token) return <Navigate to="/login" replace />;
  if (isSuperuser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isSuperuser =
    localStorage.getItem("is_superuser") === "true";

  if (!token) return <Navigate to="/login" replace />;
  if (!isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AdminLayout({ children }) {
  return (
    <div>
      <AdminSidebar />

      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen text-foreground">

      {/* NAVBAR */}
      {!hideLayout &&
        (isAdminPage ? <AdminNavbar /> : <Navbar />)}

      {/* CONTENT */}
      <main className={`flex-1 ${hideLayout ? "" : "pt-18"}`}>
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
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/konfirmasi"
            element={
              <AdminRoute>
                <AdminLayout>
                  <KonfirmasiAksi />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/user"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>
      </main>

      {/* FOOTER (hanya user/public) */}
      {!hideLayout && !isAdminPage && (
        <footer className="text-center py-6 border-t bg-white">
          <p className="text-sm text-gray-400">
            © 2026{" "}
            <span className="font-semibold text-green-800">
              REKLE
            </span>
            . Bangun kebiasaan ramah lingkungan.
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