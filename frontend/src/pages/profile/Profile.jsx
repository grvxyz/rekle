import { useEffect, useState } from "react";
import ProfileForm from "../../components/profile/ProfileForm.jsx";

function Profile() {
  const [form, setForm] = useState(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("http://localhost:8000/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
        setForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        city: data.city || "",
        bio: data.bio || "",
        });
    };

    fetchUser();
  }, []);

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

    alert("Profil berhasil diperbarui!");
    };

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
        <ProfileForm form={form} setForm={setForm} onSave={handleSave} />
      </div>
    </div>
  );
}

export default Profile;