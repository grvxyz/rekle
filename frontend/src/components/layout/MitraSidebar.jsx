import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Building2, ClipboardList, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const menu = [
  { label: "Dashboard",           path: "/mitra/dashboard",  icon: LayoutDashboard },
  { label: "Verifikasi Setoran",  path: "/mitra/verifikasi", icon: CheckSquare,    badge: true },
  { label: "Profil Mitra",        path: "/mitra/profil",     icon: Building2      },
  { label: "Riwayat Verifikasi",  path: "/mitra/riwayat",    icon: ClipboardList  },
];

const MitraSidebar = () => {
  const navigate          = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // FIX: gunakan endpoint mitra, bukan /actions/pending/count
        // /actions/pending/count hanya untuk superuser (403 jika mitra)
        const { data } = await api.get("/mitra/mine/actions/pending/count");
        setCount(data?.count ?? 0);
      } catch {
        // Jika gagal (belum punya mitra, dsb) cukup set 0, jangan crash
        setCount(0);
      }
    };

    fetchCount();
    const iv = setInterval(fetchCount, 15_000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("is_superuser");
    navigate("/mitra/login");
  };

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r flex flex-col">

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Portal Mitra
          </p>
        </div>

        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition text-sm ${
                  isActive
                    ? "bg-green-100 text-green-800 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>

              {item.badge && count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>

    </aside>
  );
};

export default MitraSidebar;