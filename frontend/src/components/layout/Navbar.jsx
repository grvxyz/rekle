import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../logo.svg";
import Button from "../ui/button.jsx";
import { User, LogOut } from "lucide-react";

function Navbar() {
  const [isLogin, setIsLogin] = useState(false);
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLogin(!!token);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("is_superuser");
    navigate("/login");
  };

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

          <div className="relative" ref={dropdownRef}>

            {!isLogin ? (
              <Button as="a" href="/login" className="px-6 py-2 rounded-full">
                Login
              </Button>
            ) : (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white"
                >
                  <User className="w-5 h-5" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-md overflow-hidden">

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

                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
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
    </header>
  );
}

export default Navbar;