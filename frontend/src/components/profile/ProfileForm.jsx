import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import Input from "../ui/input.jsx";
import Label from "../ui/label.jsx";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
} from "lucide-react";

import ProfileHeader from "./ProfileHeader.jsx";

function ProfileForm({ form, setForm, onSave }) {
  const [loading, setLoading] = useState(false);

  // ✏️ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💾 HANDLE SAVE
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(form);
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border p-4">
      <CardHeader>
        <CardTitle className="mb-4">Profile Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* HEADER */}
        <ProfileHeader
          name={form.full_name}
          email={form.email}
        />

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAMA */}
          <Field label="Nama Lengkap" icon={<User size={16} />}>
            <Input
              name="full_name"
              value={form.full_name || ""}
              onChange={handleChange}
            />
          </Field>

          {/* EMAIL (DISABLED) */}
          <Field label="Email" icon={<Mail size={16} />}>
            <Input
              name="email"
              value={form.email || ""}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </Field>

          {/* PHONE */}
          <Field label="Nomor Telepon" icon={<Phone size={16} />}>
            <Input
              name="phone_number"   // ✅ FIXED
              value={form.phone_number || ""}
              onChange={handleChange}
            />
          </Field>

          {/* CITY */}
          <Field label="Kota" icon={<MapPin size={16} />}>
            <Input
              name="city"
              value={form.city || ""}
              onChange={handleChange}
            />
          </Field>

        </div>

        {/* BIO */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <FileText size={16} /> Bio
          </Label>
          <textarea
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800"
            rows={3}
          />
        </div>

        {/* BUTTON */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            <Save size={16} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// 🔹 REUSABLE FIELD
function Field({ label, icon, children }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

export default ProfileForm;