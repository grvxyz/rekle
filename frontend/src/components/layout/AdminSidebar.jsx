import { NavLink } from "react-router-dom";
import {
  CheckCircle,
  Database,
  Brain,
  ClipboardList,
  Handshake,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/axios.js";

function AdminSidebar() {
  const [pendingCount, setPendingCount] = useState(0);

  // 🔥 Fetch pending count
  const fetchPendingCount = async () => {
    try {
      const res = await api.get("/actions/pending/count");
      setPendingCount(res.data.count || 0);
    } catch (err) {
      console.error("Gagal ambil pending count:", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // 🔁 auto refresh tiap 10 detik
    const interval = setInterval(fetchPendingCount, 10000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Menu sekarang DINAMIS
  const menu = [
    {
      label: "Analitik",
      path: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      label: "Persetujuan Aksi",
      path: "/admin/konfirmasi",
      icon: CheckCircle,
      badge: pendingCount, // 🔥 dynamic
    },
    {
      label: "Data Pengguna",
      path: "/admin/user",
      icon: Users,
    },
    {
      label: "Data Mitra",
      path: "/admin/partners",
      icon: Handshake,
    },
    {
      label: "Data Sampah",
      path: "/admin/waste-data",
      icon: Database,
    },
    {
      label: "Monitoring AI",
      path: "/admin/ai-monitoring",
      icon: Brain,
    },
    {
      label: "Pelacakan Aksi",
      path: "/admin/action-tracking",
      icon: ClipboardList,
    },
    {
      label: "Konten",
      path: "/admin/content",
      icon: FileText,
    },
  ];

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r p-4 overflow-y-auto">
      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center justify-between
                px-4 py-3 rounded-xl transition
                ${
                  isActive
                    ? "bg-green-100 text-green-800 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>

              {/* 🔥 Badge Dinamis */}
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;