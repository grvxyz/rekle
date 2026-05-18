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

const menu = [
  {
    label: "Persetujuan Aksi",
    path: "/admin/action-approvals",
    icon: CheckCircle,
    badge: 6,
  },
  {
    label: "Data Pengguna",
    path: "/admin/users",
    icon: Users,
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
    label: "Mitra",
    path: "/admin/partners",
    icon: Handshake,
  },
  {
    label: "Konten",
    path: "/admin/content",
    icon: FileText,
  },
  {
    label: "Analitik",
    path: "/admin/dashboard",
    icon: BarChart3,
  },
];

function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-green-800 mb-6">
        Panel Admin
      </h2>

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

              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
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