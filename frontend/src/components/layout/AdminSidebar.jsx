import { NavLink, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Database,
  Brain,
  ClipboardList,
  Handshake,
  FileText,
  BarChart3,
  Users,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import api from "../../lib/axios.js";
import { useAuth } from "@/context/AuthContext.jsx";

function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const [pendingActionCount, setPendingActionCount] = useState(0);
  const [pendingMitraCount,  setPendingMitraCount]  = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchCounts = useCallback(async () => {
    try {
      const [actionRes, mitraRes] = await Promise.allSettled([
        api.get("/actions/pending/count"),
        api.get("/admin/mitra/pending/count"),
      ]);

      if (actionRes.status === "fulfilled") {
        setPendingActionCount(actionRes.value.data.count || 0);
      }
      if (mitraRes.status === "fulfilled") {
        setPendingMitraCount(mitraRes.value.data.count || 0);
      }
    } catch (err) {
      console.error("Gagal ambil pending count:", err);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 10_000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const menu = [
    { label: "Dashboard",        path: "/admin/dashboard",        icon: BarChart3                              },
    { label: "Persetujuan Aksi", path: "/admin/konfirmasi",       icon: CheckCircle, badge: pendingActionCount },
    { label: "Verifikasi Mitra", path: "/admin/verifikasi-mitra", icon: ShieldCheck, badge: pendingMitraCount  },
    { label: "Data Pengguna",    path: "/admin/user",             icon: Users                                  },
    { label: "Data Mitra",       path: "/admin/partners",         icon: Handshake                              },
    { label: "Data Sampah",      path: "/admin/waste-data",       icon: Database                               },
    { label: "Monitoring AI",    path: "/admin/ai-monitoring",    icon: Brain                                  },
    { label: "Pelacakan Aksi",   path: "/admin/action-tracking",  icon: ClipboardList                         },
    { label: "Konten",           path: "/admin/content",          icon: FileText                               },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed left-0
        top-[72px]
        h-[calc(100vh-72px)]
        w-64
        bg-white border-r flex flex-col z-50
        transition-transform duration-300
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <nav className="space-y-2 p-4 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition
                ${isActive
                  ? "bg-green-100 text-green-800 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;