import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../../components/profile/ProfileForm.jsx";

function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil data profil");
        }

        const data = await res.json();
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          city: data.city || "",
          bio: data.bio || "",
        });
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  const handleSave = async (data) => {
    const res = await fetch("http://localhost:8000/api/v1/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.detail || "Gagal update");
    }

    // ✓ FIX: Redirect ke dashboard setelah sukses
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