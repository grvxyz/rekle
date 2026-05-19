import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";

// ─── Konstanta ─────────────────────────────────────────────
const WASTE_OPTIONS = [
  { value: "organik",          label: "Organik",          icon: "🌿" },
  { value: "plastik_pet",      label: "Plastik PET",      icon: "♻️" },
  { value: "plastik_hdpe",     label: "Plastik HDPE",     icon: "🧴" },
  { value: "plastik_campuran", label: "Plastik Campuran", icon: "🛍️" },
  { value: "kertas_bersih",    label: "Kertas Bersih",    icon: "📄" },
  { value: "kertas_kotor",     label: "Kertas Kotor",     icon: "📰" },
  { value: "kaca_utuh",        label: "Kaca Utuh",        icon: "🪟" },
  { value: "kaca_pecah",       label: "Kaca Pecah",       icon: "🔮" },
];

const MITRA_TYPES = [
  { value: "bank_sampah", label: "Bank Sampah",  desc: "Menerima & mengelola setoran sampah dari warga",       color: "green"  },
  { value: "daur_ulang",  label: "Daur Ulang",   desc: "Mengolah sampah menjadi produk baru yang berguna",      color: "blue"   },
  { value: "eco_brick",   label: "Eco Brick",    desc: "Mengumpulkan sampah plastik untuk eco brick",           color: "orange" },
  { value: "kompos",      label: "Kompos",       desc: "Mengolah sampah organik menjadi kompos/pupuk",          color: "yellow" },
];

const STEPS = ["Akun", "Profil Mitra", "Jenis Sampah", "Lokasi"];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition";

const Field = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

// ─── Step 1: Akun ──────────────────────────────────────────
const StepAkun = ({ form, set }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <span className="text-4xl">🔑</span>
      <h2 className="text-xl font-bold text-gray-900 mt-2">Buat Akun Mitra</h2>
      <p className="text-sm text-gray-500 mt-1">Data untuk login ke portal mitra REKLE</p>
    </div>

    <Field label="Nama Lengkap" required>
      <input
        value={form.full_name}
        onChange={(e) => set("full_name", e.target.value)}
        placeholder="Nama pengelola / PIC mitra"
        className={inputCls}
      />
    </Field>

    <Field label="Email" required hint="Digunakan untuk login ke portal mitra">
      <input
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        placeholder="email@mitra.com"
        className={inputCls}
      />
    </Field>

    <Field label="Password" required hint="Minimal 8 karakter">
      <input
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        placeholder="••••••••"
        className={inputCls}
      />
    </Field>

    <Field label="Konfirmasi Password" required>
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(e) => set("confirmPassword", e.target.value)}
        placeholder="••••••••"
        className={inputCls}
      />
    </Field>
  </div>
);

// ─── Step 2: Profil Mitra ──────────────────────────────────
const StepProfil = ({ form, set }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <span className="text-4xl">🏢</span>
      <h2 className="text-xl font-bold text-gray-900 mt-2">Profil Mitra</h2>
      <p className="text-sm text-gray-500 mt-1">Informasi tentang usaha / organisasi Anda</p>
    </div>

    <Field label="Nama Mitra / Organisasi" required>
      <input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Contoh: Bank Sampah Sejahtera"
        className={inputCls}
      />
    </Field>

    <Field label="Tipe Mitra" required>
      <div className="grid grid-cols-2 gap-3">
        {MITRA_TYPES.map((t) => {
          const selected = form.mitra_type === t.value;
          const colorMap = {
            green:  selected ? "border-green-500  bg-green-50  text-green-800"  : "border-gray-200 hover:border-green-300",
            blue:   selected ? "border-blue-500   bg-blue-50   text-blue-800"   : "border-gray-200 hover:border-blue-300",
            orange: selected ? "border-orange-500 bg-orange-50 text-orange-800" : "border-gray-200 hover:border-orange-300",
            yellow: selected ? "border-yellow-500 bg-yellow-50 text-yellow-800" : "border-gray-200 hover:border-yellow-300",
          };
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => set("mitra_type", t.value)}
              className={`rounded-xl border-2 p-3 text-left transition ${colorMap[t.color]}`}
            >
              <p className="font-semibold text-sm">{t.label}</p>
              <p className="text-xs mt-0.5 text-gray-500 leading-snug">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </Field>

    <Field label="Deskripsi">
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Ceritakan sedikit tentang mitra Anda..."
        rows={3}
        className={inputCls + " resize-none"}
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="No. Telepon">
        <input
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="08xx-xxxx-xxxx"
          className={inputCls}
        />
      </Field>
      <Field label="Email Mitra">
        <input
          type="email"
          value={form.mitra_email}
          onChange={(e) => set("mitra_email", e.target.value)}
          placeholder="info@mitra.com"
          className={inputCls}
        />
      </Field>
    </div>

    <Field label="Website">
      <input
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        placeholder="https://mitra-anda.com (opsional)"
        className={inputCls}
      />
    </Field>
  </div>
);

// ─── Step 3: Jenis Sampah ──────────────────────────────────
const StepSampah = ({ form, set }) => {
  const toggleWaste = (value) => {
    const current = form.accepted_waste;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set("accepted_waste", updated);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-4xl">♻️</span>
        <h2 className="text-xl font-bold text-gray-900 mt-2">Jenis Sampah</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih sampah yang Anda terima / olah</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WASTE_OPTIONS.map((w) => {
          const checked = form.accepted_waste.includes(w.value);
          return (
            <button
              key={w.value}
              type="button"
              onClick={() => toggleWaste(w.value)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                checked
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-xl">{w.icon}</span>
              <div>
                <p className={`text-sm font-medium ${checked ? "text-green-800" : "text-gray-700"}`}>
                  {w.label}
                </p>
              </div>
              {checked && (
                <span className="ml-auto text-green-500 font-bold">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {form.accepted_waste.length === 0 && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg p-2">
          ⚠️ Pilih minimal satu jenis sampah yang Anda terima
        </p>
      )}
    </div>
  );
};

// ─── Step 4: Lokasi ────────────────────────────────────────
const StepLokasi = ({ form, set }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <span className="text-4xl">📍</span>
      <h2 className="text-xl font-bold text-gray-900 mt-2">Lokasi Mitra</h2>
      <p className="text-sm text-gray-500 mt-1">Agar pengguna dapat menemukan Anda</p>
    </div>

    <Field label="Alamat Lengkap" required>
      <textarea
        value={form.address}
        onChange={(e) => set("address", e.target.value)}
        placeholder="Jl. Contoh No. 123, Kel. ..., Kec. ..."
        rows={3}
        className={inputCls + " resize-none"}
      />
    </Field>

    <Field label="Kota / Kabupaten" required>
      <input
        value={form.city}
        onChange={(e) => set("city", e.target.value)}
        placeholder="Yogyakarta"
        className={inputCls}
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="Latitude" hint="Contoh: -7.7956">
        <input
          type="number"
          step="any"
          value={form.latitude}
          onChange={(e) => set("latitude", e.target.value)}
          placeholder="-7.7956"
          className={inputCls}
        />
      </Field>
      <Field label="Longitude" hint="Contoh: 110.3695">
        <input
          type="number"
          step="any"
          value={form.longitude}
          onChange={(e) => set("longitude", e.target.value)}
          placeholder="110.3695"
          className={inputCls}
        />
      </Field>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
      💡 <strong>Tips:</strong> Klik kanan di Google Maps → "What's here?" untuk mendapatkan koordinat.
    </div>
  </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────
const MitraRegister = () => {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    // akun
    full_name: "", email: "", password: "", confirmPassword: "",
    // profil mitra
    name: "", mitra_type: "bank_sampah", description: "",
    phone: "", mitra_email: "", website: "",
    // sampah
    accepted_waste: [],
    // lokasi
    address: "", city: "", latitude: "", longitude: "",
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.full_name.trim()) return setError("Nama lengkap wajib diisi") || false;
      if (!form.email.trim())     return setError("Email wajib diisi") || false;
      if (!form.password)         return setError("Password wajib diisi") || false;
      if (form.password.length < 8) return setError("Password minimal 8 karakter") || false;
      if (form.password !== form.confirmPassword) return setError("Konfirmasi password tidak cocok") || false;
    }
    if (step === 1) {
      if (!form.name.trim()) return setError("Nama mitra wajib diisi") || false;
    }
    if (step === 2) {
      if (form.accepted_waste.length === 0) return setError("Pilih minimal satu jenis sampah") || false;
    }
    if (step === 3) {
      if (!form.address.trim()) return setError("Alamat wajib diisi") || false;
      if (!form.city.trim())    return setError("Kota wajib diisi") || false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      // 1. Daftarkan akun user
      await api.post("/auth/register", {
        email:     form.email,
        password:  form.password,
        full_name: form.full_name,
      });

      // 2. Login untuk dapat token
      const { data: loginData } = await api.post("/auth/login", {
        email:    form.email,
        password: form.password,
      });

      localStorage.setItem("access_token", loginData.access_token);
      if (loginData.refresh_token) {
        localStorage.setItem("refresh_token", loginData.refresh_token);
      }
      localStorage.setItem("is_superuser", "false");

      // 3. Buat data mitra menggunakan endpoint /mitra/mine
      //    (diikat ke user yang sedang login via token)
      await api.post("/mitra/mine", {
        name:           form.name,
        mitra_type:     form.mitra_type,
        description:    form.description || null,
        phone:          form.phone || null,
        email:          form.mitra_email || null,
        website:        form.website || null,
        address:        form.address,
        city:           form.city,
        latitude:       form.latitude !== "" ? parseFloat(form.latitude)  : null,
        longitude:      form.longitude !== "" ? parseFloat(form.longitude) : null,
        accepted_waste: form.accepted_waste.join(","),
        is_active:      true,
      });

      setSuccess(true);

    } catch (err) {
      // Bersihkan token jika ada error saat buat mitra
      // agar user bisa coba login ulang
      setError(err.response?.data?.detail || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ──────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Selamat! Mitra <strong>{form.name}</strong> telah berhasil terdaftar di REKLE.
            Akun Anda sedang dalam proses verifikasi oleh admin.
          </p>
          <button
            onClick={() => navigate("/mitra/dashboard")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Masuk ke Portal Mitra →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-xl font-black text-gray-900">REKLE</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Daftar sebagai Mitra Pengelola Sampah</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                    ? "bg-green-600 text-white ring-4 ring-green-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1 ${i === step ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar — dimulai dari 25% di step 0 agar terlihat ada progress */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-8">
          <div
            className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {step === 0 && <StepAkun  form={form} set={set} />}
          {step === 1 && <StepProfil form={form} set={set} />}
          {step === 2 && <StepSampah form={form} set={set} />}
          {step === 3 && <StepLokasi form={form} set={set} />}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => { setError(""); setStep((s) => s - 1); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                ← Kembali
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                Lanjut →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Mendaftarkan..." : "🎉 Daftar Sekarang"}
              </button>
            )}
          </div>
        </div>

        {/* Login link */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Sudah punya akun mitra?{" "}
          <Link to="/mitra/login" className="text-green-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default MitraRegister;