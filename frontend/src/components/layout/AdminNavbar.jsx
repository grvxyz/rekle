import logo from "../../logo.svg";
import { Menu } from "lucide-react";

function AdminNavbar({ setSidebarOpen }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <img
            src={logo}
            alt="REKLE"
            className="w-10 h-10 rounded-xl"
          />

          <div>
            <p className="font-bold text-green-800">
              REKLE Admin
            </p>
            <p className="text-xs text-gray-500">
              Panel Pengelolaan Sistem
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;