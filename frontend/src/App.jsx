/**
 * App.jsx — Updated dengan semua route action baru:
 * /action/kompos, /action/eco-brick, /action/khusus
 */

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "./context/AuthContext.jsx";

import Navbar        from "./components/layout/Navbar.jsx";
import AdminNavbar   from "./components/layout/AdminNavbar.jsx";
import AdminSidebar  from "./components/layout/AdminSidebar.jsx";
import MitraSidebar  from "./components/layout/MitraSidebar.jsx";

import LoginPage    from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage  from "./pages/landing/LandingPage.jsx";

import ScanPage        from "./pages/scan/ScanPage";
import UserDashboard   from "./pages/dashboard/Dashboard.jsx";
import Profile         from "./pages/profile/Profile.jsx";
import HistoryPage     from "./pages/history/HistoryPage.jsx";
import ChallengePage   from "./pages/challenge/ChallengePage.jsx";
import ChallengeDetail from "./pages/challenge/ChallengeDetail.jsx";

// ── Action pages ────────────────────────────────────────────
import ActionPage     from "./pages/action/ActionPage";
import ReusePage      from "./pages/action/ReusePage";
import RecyclePage    from "./pages/action/RecyclePage";
import BankSampahPage from "./pages/action/BankSampahPage";
import KomposPage     from "./pages/action/KomposPage";
import EcoBrickPage   from "./pages/action/EcoBrickPage";
import KhususPage     from "./pages/action/KhususPage";

// ── Admin pages ─────────────────────────────────────────────
import AdminDashboard    from "./pages/admin/dashboard/Dashboard.jsx";
import KonfirmasiAksi    from "./pages/admin/konfirmasi/KonfirmasiAksi.jsx";
import VerifikasiMitra   from "./pages/admin/verifikasi-mitra/VerifikasiMitra.jsx";
import UserManagement    from "./pages/admin/user/UserManagement.jsx";
import DataMitra         from "./pages/admin/mitra/DataMitra.jsx";
import DataSampah        from "./pages/admin/datasampah/DataSampah.jsx";
import AIMonitoring      from "./pages/admin/ai-monitoring/AIMonitoring.jsx";
import ActionTracking    from "./pages/admin/action-tracking/ActionTracking.jsx";
import ContentManagement from "./pages/admin/content/ContentManagement.jsx";

// ── Mitra pages ─────────────────────────────────────────────
import MitraLogin      from "./pages/mitra/MitraLogin.jsx";
import MitraRegister   from "./pages/mitra/MitraRegister.jsx";
import MitraDashboard  from "./pages/mitra/MitraDashboard.jsx";
import MitraVerifikasi from "./pages/mitra/MitraVerifikasi.jsx";
import MitraProfil     from "./pages/mitra/MitraProfil.jsx";
import MitraRiwayat    from "./pages/mitra/MitraRiwayat.jsx";

// ─── Route Guards ──────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isSuperuser) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isSuperuser) return <Navigate to="/dashboard" replace />;
  return children;
}

function MitraRoute({ children }) {
  const { isLoggedIn, isSuperuser, token } = useAuth();
  // Jika token belum diinisialisasi (undefined), tunggu dulu — jangan redirect
  if (token === undefined) return null;
  if (!isLoggedIn) return <Navigate to="/mitra/login" replace />;
  if (isSuperuser) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function RedirectIfLoggedIn({ children }) {
  const { isLoggedIn, isSuperuser } = useAuth();
  if (isLoggedIn) {
    return <Navigate to={isSuperuser ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  return children;
}

// ─── Layouts ───────────────────────────────────────────────────

function AdminLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
}) {

  return (
    <div>
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="ml-0 md:ml-64 pt-16">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        {children}
      </div>
    </div>
  );
}

function MitraLayout({ children }) {
  return (
    <div>
      <MitraSidebar />
      <div className="ml-0 md:ml-64">{children}</div>
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="border-t"
      style={{ background: "#0d1f14", borderColor: "rgba(52,211,153,0.12)" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 mb-8">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p
              className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
            >
              REKLE
            </p>
            <p className="text-xs text-emerald-400/60 max-w-xs leading-relaxed">
              Platform cerdas klasifikasi sampah berbasis AI untuk lingkungan yang lebih baik.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-8 gap-y-3 text-sm">
            <a href="/scan" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Scan</a>
            <a href="/challenge" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Challenge</a>
            <a href="/history" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Riwayat</a>
            <a href="/mitra/register" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Daftar Mitra</a>
            <a href="/mitra/login" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Login Mitra</a>
            <a href="/login" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Masuk</a>
            <a href="/register" className="text-white/40 hover:text-emerald-400 transition-colors duration-200">Daftar</a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px mb-6" style={{ background: "rgba(52,211,153,0.1)" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>
            © 2026{" "}
            <span className="font-bold text-emerald-400/60">REKLE</span>
            . Bangun kebiasaan ramah lingkungan.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Semua sistem berjalan normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root Layout ───────────────────────────────────────────────

function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        isAdminPage
          ? <AdminNavbar setSidebarOpen={setSidebarOpen} />
          : <Navbar />
      )}

      {/* CONTENT */}
      <main className={`flex-1 ${!isMitraPage && !hideLayout ? "" : ""}`}>
        <Routes>

          {/* ── PUBLIC ──────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>}
          />
          <Route
            path="/register"
            element={<RedirectIfLoggedIn><RegisterPage /></RedirectIfLoggedIn>}
          />
          <Route path="/scan" element={<ScanPage />} />

          {/* ── USER (protected) ────────────────────── */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/challenge" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
          <Route path="/challenge/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />

          {/* Action hub */}
          <Route path="/action" element={<ProtectedRoute><ActionPage /></ProtectedRoute>} />

          {/* Action pages */}
          <Route path="/action/reuse"       element={<ProtectedRoute><ReusePage /></ProtectedRoute>} />
          <Route path="/action/recycle"     element={<ProtectedRoute><RecyclePage /></ProtectedRoute>} />
          <Route path="/action/bank-sampah" element={<ProtectedRoute><BankSampahPage /></ProtectedRoute>} />
          <Route path="/action/kompos"      element={<ProtectedRoute><KomposPage /></ProtectedRoute>} />
          <Route path="/action/eco-brick"   element={<ProtectedRoute><EcoBrickPage /></ProtectedRoute>} />
          <Route path="/action/khusus"      element={<ProtectedRoute><KhususPage /></ProtectedRoute>} />

          {/* ── ADMIN (protected) ───────────────────── */}
          <Route path="/admin/dashboard"         element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><AdminDashboard /></AdminLayout></AdminRoute>}/>
          <Route path="/admin/konfirmasi"        element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><KonfirmasiAksi /></AdminLayout></AdminRoute>} />
          <Route path="/admin/verifikasi-mitra"  element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><VerifikasiMitra /></AdminLayout></AdminRoute>} />
          <Route path="/admin/user"              element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><UserManagement /></AdminLayout></AdminRoute>} />
          <Route path="/admin/partners"          element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><DataMitra /></AdminLayout></AdminRoute>} />
          <Route path="/admin/waste-data"        element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><DataSampah /></AdminLayout></AdminRoute>} />
          <Route path="/admin/ai-monitoring"     element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><AIMonitoring /></AdminLayout></AdminRoute>} />
          <Route path="/admin/action-tracking"   element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><ActionTracking /></AdminLayout></AdminRoute>} />
          <Route path="/admin/content"           element={<AdminRoute><AdminLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}><ContentManagement /></AdminLayout></AdminRoute>} />

          {/* ── MITRA ───────────────────────────────── */}
          <Route path="/mitra/login"      element={<MitraLogin />} />
          <Route path="/mitra/register"   element={<MitraRegister />} />
          <Route path="/mitra/dashboard"  element={<MitraRoute><MitraLayout><MitraDashboard /></MitraLayout></MitraRoute>} />
          <Route path="/mitra/verifikasi" element={<MitraRoute><MitraLayout><MitraVerifikasi /></MitraLayout></MitraRoute>} />
          <Route path="/mitra/profil"     element={<MitraRoute><MitraLayout><MitraProfil /></MitraLayout></MitraRoute>} />
          <Route path="/mitra/riwayat"    element={<MitraRoute><MitraLayout><MitraRiwayat /></MitraLayout></MitraRoute>} />

          {/* ── FALLBACK ────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      {/* FOOTER */}
      {!hideLayout && !isAdminPage && !isMitraPage && <Footer />}
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