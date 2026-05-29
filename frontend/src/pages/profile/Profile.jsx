import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../../components/profile/ProfileForm.jsx";
import api from "@/lib/axios";  // ← ganti fetch hardcoded dengan axios instance

function Profile() {
  const navigate = useNavigate();
  const [form,  setForm]  = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");  // ← ganti fetch localhost
        setForm({
          full_name:    data.full_name    || "",
          email:        data.email        || "",
          phone_number: data.phone_number || "",
          city:         data.city         || "",
          bio:          data.bio          || "",
        });
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Terjadi kesalahan");
      }
    };

    fetchUser();
  }, []);

  const handleSave = async (data) => {
    const { data: result } = await api.put("/users/me", data);  // ← ganti fetch localhost

    navigate("/dashboard", {
      state: { message: "Profil berhasil diperbarui!" },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-sm">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-sm underline hover:no-underline"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <ProfileForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}

export default Profile;