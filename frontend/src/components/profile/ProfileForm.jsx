import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
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

// ======================================================
// VALIDASI
// ======================================================

function validate(form) {
  const errors = {};

  if (!form.full_name?.trim()) {
    errors.full_name = "Nama lengkap wajib diisi";
  }

  if (form.phone_number && !/^[0-9+\-\s()]{7,20}$/.test(form.phone_number)) {
    errors.phone_number = "Format nomor telepon tidak valid";
  }

  if (form.bio && form.bio.length > 300) {
    errors.bio = `Bio terlalu panjang (${form.bio.length}/300)`;
  }

  return errors;
}

// ======================================================
// PROFILE FORM
// ======================================================

function ProfileForm({ form, setForm, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedForm, setSavedForm] = useState(form);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      await onSave(form);
      setSavedForm(form);
    } catch (err) {
      console.error(err);
      setErrors({
        _server:
          err.response?.data?.detail || err.message || "Gagal menyimpan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border p-4">
      {/* ✓ FIX: Tombol Kembali di bagian atas */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Kembali
        </button>
      </div>

      <CardHeader>
        <CardTitle className="mb-4">Profile Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* HEADER */}
        <ProfileHeader name={form.full_name} email={form.email} />

        {/* SERVER ERROR */}
        {errors._server && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errors._server}
          </div>
        )}

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NAMA */}
          <Field label="Nama Lengkap" icon={<User size={16} />} error={errors.full_name}>
            <Input
              name="full_name"
              value={form.full_name || ""}
              onChange={handleChange}
              aria-invalid={!!errors.full_name}
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
          <Field
            label="Nomor Telepon"
            icon={<Phone size={16} />}
            error={errors.phone_number}
          >
            <Input
              name="phone_number"
              value={form.phone_number || ""}
              onChange={handleChange}
              inputMode="tel"
              aria-invalid={!!errors.phone_number}
            />
          </Field>

          {/* CITY */}
          <Field label="Kota" icon={<MapPin size={16} />} error={errors.city}>
            <Input
              name="city"
              value={form.city || ""}
              onChange={handleChange}
            />
          </Field>
        </div>

        {/* BIO */}
        <Field label="Bio" icon={<FileText size={16} />} error={errors.bio}>
          <textarea
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 resize-none ${
              errors.bio ? "border-red-400" : ""
            }`}
            rows={3}
            maxLength={300}
            aria-invalid={!!errors.bio}
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {(form.bio || "").length}/300
          </p>
        </Field>

        {/* ✓ FIX: Button section dengan Batal dan Simpan */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isDirty}
            className="flex-1 gap-2"
          >
            <Save size={16} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ======================================================
// REUSABLE FIELD
// ======================================================

function Field({ label, icon, error, children }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

export default ProfileForm;