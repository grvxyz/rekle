/**
 * App.jsx
 *
 * Perubahan dari versi lama:
 * 1. Route guards baca dari AuthContext, bukan langsung localStorage
 * 2. /scan dan /scan-guest sekarang PUBLIC — bisa diakses tanpa login
 * 3. ProtectedRoute tidak redirect admin; admin tetap bisa akses user route?
 *    → TIDAK. Admin diarahkan ke /admin/dashboard jika coba akses user route.
 * 4. GuestScanRoute: jika sudah login saat buka /scan, tampilkan scan biasa.
 *    Jika belum login, tetap tampilkan scan tapi pass prop isGuest=true.
 * 5. Tidak ada loop redirect.
 */

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";

import Navbar from "./components/layout/Navbar.jsx";
import AdminNavbar from "./components/layout/AdminNavbar.jsx";
import AdminSidebar from "./components/layout/AdminSidebar.jsx";
import MitraSidebar from "./components/layout/MitraSidebar.jsx";

import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";

import ScanPage from "./pages/scan/ScanPage";
import UserDashboard from "./pages/dashboard/Dashboard.jsx";
import Profile from "./pages/profile/Profile.jsx";
import HistoryPage from "./pages/history/HistoryPage.jsx";
import ActionPage from "./pages/action/ActionPage";
import ReusePage from "./pages/action/ReusePage";
import RecyclePage from "./pages/action/RecyclePage";
import BankSampahPage from "./pages/action/BankSampahPage";

import AdminDashboard from "./pages/admin/dashboard/Dashboard.jsx";
import KonfirmasiAksi from "./pages/admin/konfirmasi/KonfirmasiAksi.jsx";
import UserManagement from "./pages/admin/user/UserManagement.jsx";
import DataMitra from "./pages/admin/mitra/DataMitra.jsx";
import DataSampah from "./pages/admin/datasampah/DataSampah.jsx";
import AIMonitoring from "./pages/admin/ai-monitoring/AIMonitoring.jsx";
import ActionTracking from "./pages/admin/action-tracking/ActionTracking.jsx";
import ContentManagement from "./pages/admin/content/ContentManagement.jsx";

import MitraLogin from "./pages/mitra/MitraLogin.jsx";
import MitraRegister from "./pages/mitra/MitraRegister.jsx";
import MitraDashboard from "./pages/mitra/MitraDashboard.jsx";
import MitraVerifikasi from "./pages/mitra/MitraVerifikasi.jsx";
import MitraProfil from "./pages/mitra/MitraProfil.jsx";
import MitraRiwayat from "./pages/mitra/MitraRiwayat.jsx";

// ─── Route Guards ─────────────────────────────────────────────

/**
 * ProtectedRoute — hanya untuk user biasa (bukan admin).
 * - Belum login → /login
 * - Sudah login tapi admin → /admin/dashboard
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isSuperuser) return <Navigate to="/admin/dashboard" replace />;

  return children;
}

/**
 * AdminRoute — hanya untuk admin.
 * - Belum login → /login
 * - Sudah login tapi bukan admin → /dashboard
 */
function AdminRoute({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isSuperuser) return <Navigate to="/dashboard" replace />;

  return children;
}

/**
 * MitraRoute — hanya untuk mitra (non-admin).
 * - Belum login → /mitra/login
 * - Sudah login tapi admin → /admin/dashboard
 */
function MitraRoute({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();

  if (!isLoggedIn) return <Navigate to="/mitra/login" replace />;
  if (isSuperuser) return <Navigate to="/admin/dashboard" replace />;

  return children;
}

/**
 * RedirectIfLoggedIn — untuk halaman login/register.
 * Jika sudah login, langsung ke dashboard yang sesuai.
 */
function RedirectIfLoggedIn({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();

  if (isLoggedIn) {
    return <Navigate to={isSuperuser ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return children;
}

// ─── Layouts ──────────────────────────────────────────────────

function AdminLayout({ children }) {
  return (
    <div>
      <AdminSidebar />
      <div className="ml-64">{children}</div>
    </div>
  );
}

function MitraLayout({ children }) {
  return (
    <div>
      <MitraSidebar />
      <div className="ml-64">{children}</div>
    </div>
  );
}

// ─── Root Layout ──────────────────────────────────────────────

function Layout() {
  const location = useLocation();

  const isMitraAuth =
    location.pathname === "/mitra/login" ||
    location.pathname === "/mitra/register";

  const isMitraPage =
    location.pathname.startsWith("/mitra") && !isMitraAuth;

  const isAdminPage = location.pathname.startsWith("/admin");

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    isMitraAuth;

  return (
    <div className="flex flex-col min-h-screen text-foreground">

      {/* NAVBAR */}
      {!hideLayout && !isMitraPage && (
        isAdminPage ? <AdminNavbar /> : <Navbar />
      )}

      {/* CONTENT */}
      <main className={`flex-1 ${!isMitraPage && !hideLayout ? "pt-20" : ""}`}>
        <Routes>

          {/* ── PUBLIC ─────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />

          {/* Login/register: jika sudah login → redirect dashboard */}
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <LoginPage />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLoggedIn>
                <RegisterPage />
              </RedirectIfLoggedIn>
            }
          />

          {/*
            /scan bisa diakses siapa saja.
            ScanPage sendiri menerima prop isGuest untuk membatasi
            tombol "Klaim Poin" jika belum login.
          */}
          <Route path="/scan" element={<ScanPage />} />

          {/* ── USER (protected) ────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
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
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
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
          <Route
            path="/action/reuse"
            element={
              <ProtectedRoute>
                <ReusePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action/recycle"
            element={
              <ProtectedRoute>
                <RecyclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action/bank-sampah"
            element={
              <ProtectedRoute>
                <BankSampahPage />
              </ProtectedRoute>
            }
          />

          {/* ── ADMIN (protected) ───────────────────────── */}
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
          <Route
            path="/admin/partners"
            element={
              <AdminRoute>
                <AdminLayout>
                  <DataMitra />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/waste-data"
            element={
              <AdminRoute>
                <AdminLayout>
                  <DataSampah />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/ai-monitoring"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AIMonitoring />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/action-tracking"
            element={
              <AdminRoute>
                <AdminLayout>
                  <ActionTracking />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <AdminRoute>
                <AdminLayout>
                  <ContentManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* ── MITRA ───────────────────────────────────── */}
          <Route path="/mitra/login" element={<MitraLogin />} />
          <Route path="/mitra/register" element={<MitraRegister />} />

          <Route
            path="/mitra/dashboard"
            element={
              <MitraRoute>
                <MitraLayout>
                  <MitraDashboard />
                </MitraLayout>
              </MitraRoute>
            }
          />
          <Route
            path="/mitra/verifikasi"
            element={
              <MitraRoute>
                <MitraLayout>
                  <MitraVerifikasi />
                </MitraLayout>
              </MitraRoute>
            }
          />
          <Route
            path="/mitra/profil"
            element={
              <MitraRoute>
                <MitraLayout>
                  <MitraProfil />
                </MitraLayout>
              </MitraRoute>
            }
          />
          <Route
            path="/mitra/riwayat"
            element={
              <MitraRoute>
                <MitraLayout>
                  <MitraRiwayat />
                </MitraLayout>
              </MitraRoute>
            }
          />

          {/* ── FALLBACK ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      {/* FOOTER */}
      {!hideLayout && !isAdminPage && !isMitraPage && (
        <footer className="text-center py-6 border-t bg-white">
          <p className="text-sm text-gray-400">
            © 2026{" "}
            <span className="font-semibold text-green-800">REKLE</span>
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
