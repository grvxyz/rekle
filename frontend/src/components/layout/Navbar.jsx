import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../logo.svg";
import Button from "../ui/button.jsx";
import { User, LogOut, LayoutDashboard, Menu, X, Trophy, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";

function Navbar() {
  const { isLoggedIn, isSuperuser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [visible, setVisible]           = useState(true);
  const [scrolled, setScrolled]         = useState(false);

  const location    = useLocation();
  const navigate    = useNavigate();
  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);

  const dashboardPath = isSuperuser ? "/admin/dashboard" : "/dashboard";
  const isOnLanding   = location.pathname === "/";

  // ── Hide/show on scroll ────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;

    setScrolled(currentY > 10);

    if (currentY < 10) {
      setVisible(true);
    } else if (currentY > lastScrollY.current + 8) {
      setVisible(false);
      setDropdownOpen(false);
      setMobileOpen(false);
    } else if (currentY < lastScrollY.current - 8) {
      setVisible(true);
    }

    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Click outside dropdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // ── Tutup menu saat route berubah ─────────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const goTo = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${scrolled ? "bg-white/95 shadow-sm backdrop-blur-md" : "bg-white/80 backdrop-blur-md"}
          ${visible ? "translate-y-0" : "-translate-y-full"}
          border-b
        `}
      >
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* ── Logo ── */}
            <a href="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="Logo REKLE" className="h-9 w-9 rounded-2xl" />
              <strong className="text-lg font-black tracking-[0.04em]">REKLE</strong>
            </a>

            {/* ── Desktop nav ── */}
            <div className="hidden sm:flex items-center gap-3">

              {isLoggedIn && isOnLanding && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  onClick={() => goTo(dashboardPath)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Kembali ke Dashboard
                </Button>
              )}

              <div className="relative" ref={dropdownRef}>
                {!isLoggedIn ? (
                  <Button as="a" href="/login" className="px-6 py-2 rounded-full">
                    Login
                  </Button>
                ) : (
                  <>
                    <button
                      onClick={() => setDropdownOpen((p) => !p)}
                      className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-md overflow-hidden z-50">

                        <button
                          onClick={() => goTo(dashboardPath)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>

                        {/* Menu khusus user biasa */}
                        {!isSuperuser && (
                          <>
                            <button
                              onClick={() => goTo("/challenge")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              <Trophy className="w-4 h-4" />
                              Challenge
                            </button>

                            <button
                              onClick={() => goTo("/history")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              <ClipboardList className="w-4 h-4" />
                              Riwayat
                            </button>

                            <button
                              onClick={() => goTo("/profile")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </button>
                          </>
                        )}

                        <div className="border-t my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Mobile: hamburger ── */}
            <div className="flex sm:hidden items-center gap-2">
              {!isLoggedIn ? (
                <Button as="a" href="/login" className="px-4 py-1.5 rounded-full text-sm">
                  Login
                </Button>
              ) : (
                <button
                  onClick={() => setMobileOpen((p) => !p)}
                  className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                  aria-label="Menu"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── Mobile dropdown menu ── */}
        <div
          className={`
            sm:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
            bg-white border-t
          `}
        >
          <div className="px-4 py-2 space-y-1">

            {/* Dashboard — label berubah sesuai halaman */}
            <button
              onClick={() => goTo(dashboardPath)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              {isOnLanding ? "Kembali ke Dashboard" : "Dashboard"}
            </button>

            {/* Menu khusus user biasa */}
            {!isSuperuser && (
              <>
                <button
                  onClick={() => goTo("/challenge")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50"
                >
                  <Trophy className="w-4 h-4" />
                  Challenge
                </button>

                <button
                  onClick={() => goTo("/history")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50"
                >
                  <ClipboardList className="w-4 h-4" />
                  Riwayat
                </button>

                <button
                  onClick={() => goTo("/profile")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-50"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </>
            )}

            <div className="border-t my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[57px]" />
    </>
  );
}

export default Navbar;