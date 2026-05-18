import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import logo from "../../logo.svg";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("is_superuser");
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <img src={logo} alt="REKLE" className="w-10 h-10 rounded-xl" />
          <div>
            <p className="font-bold text-green-800">REKLE Admin</p>
            <p className="text-xs text-gray-500">
              Panel Pengelolaan Sistem
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;