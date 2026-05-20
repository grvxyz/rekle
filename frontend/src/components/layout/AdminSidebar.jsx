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
} from "lucide-react";

const menu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
  { label: "Persetujuan Aksi", path: "/admin/konfirmasi", icon: CheckCircle, badge: 6 },
  { label: "Data Pengguna", path: "/admin/user", icon: Users },
  { label: "Data Mitra", path: "/admin/partners", icon: Handshake },
  { label: "Data Sampah", path: "/admin/waste-data", icon: Database },
  { label: "Monitoring AI", path: "/admin/ai-monitoring", icon: Brain },
  { label: "Pelacakan Aksi", path: "/admin/action-tracking", icon: ClipboardList },
  { label: "Konten", path: "/admin/content", icon: FileText },
];

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("is_superuser");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r flex flex-col">

      {/* MENU */}
      <nav className="space-y-2 p-4 flex-1 overflow-y-auto">
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

              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT SECTION */}
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