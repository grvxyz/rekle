import { useNavigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";

function GuestClaimBlock({ pointsAvailable = 50, message }) {
  const navigate = useNavigate();

  const defaultMessage = pointsAvailable
    ? `Login untuk mengklaim ${pointsAvailable} poin dan melanjutkan aksi.`
    : "Login untuk mengklaim poin dan melanjutkan aksi.";

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Lock className="w-5 h-5 text-amber-600" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-amber-800 text-sm">Fitur ini membutuhkan login</p>
        <p className="text-amber-700 text-sm mt-1">{message || defaultMessage}</p>
      </div>

      <button
        onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
      >
        <LogIn className="w-4 h-4" />
        Login Sekarang
      </button>
    </div>
  );
}

export default GuestClaimBlock;