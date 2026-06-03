/**
 * Navbar.jsx
 *
 * Perubahan:
 * - Baca status login dari AuthContext (bukan langsung localStorage)
 * - Tambah tombol "Kembali ke Dashboard" di landing page jika sudah login
 * - Logout pakai context.logout()
 */

import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../logo.svg";
import Button from "../ui/button.jsx";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";

function Navbar() {
  const { isLoggedIn, isSuperuser, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  // Pasang/lepas listener click-outside
  const handleToggle = () => {
    if (!open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const dashboardPath = isSuperuser ? "/admin/dashboard" : "/dashboard";
  const isOnLanding   = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <a href="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="Logo REKLE" className="h-10 w-10 rounded-2xl" />
            <strong className="text-lg font-black tracking-[0.04em]">
              REKLE
            </strong>
          </a>

          <div className="flex items-center gap-3">

            {/*
              Tombol "Kembali ke Dashboard" — hanya muncul:
              - Jika user/admin sudah login
              - Sedang berada di landing page (/)
            */}
            {isLoggedIn && isOnLanding && (
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                onClick={() => navigate(dashboardPath)}
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
                    onClick={handleToggle}
                    className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-md overflow-hidden z-50">

                      {/* Tombol dashboard di dalam dropdown juga */}
                      <button
                        onClick={() => {
                          navigate(dashboardPath);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>

                      {/* Profile — hanya tampil untuk user biasa */}
                      {!isSuperuser && (
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                      )}

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

        </div>
      </div>
    </header>
  );
}

export default Navbar;
