import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";

// ─── Konstanta ─────────────────────────────────────────────
// Disamakan persis dengan nilai kembalian / enum Backend
const WASTE_OPTIONS = [
  { value: "organik",   label: "Organik",           icon: "🌿" },
  { value: "Plastik",   label: "Plastik",           icon: "♻️" },
  { value: "Kertas",    label: "Kertas",            icon: "📄" },
  { value: "Kardus",    label: "Kardus",            icon: "📦" },
  { value: "Kaca",      label: "Kaca",              icon: "🍾" },
  { value: "Logam",     label: "Logam",             icon: "🥫" },
  { value: "B3",        label: "B3 (Berbahaya)",    icon: "☣️" },
  { value: "Medis",     label: "Limbah Medis",      icon: "💉" },
  { value: "nonsampah", label: "Non-Sampah",        icon: "🚫" },
];

const MITRA_TYPES = [
  { value: "bank_sampah", label: "Bank Sampah",  desc: "Menerima & mengelola setoran sampah dari warga",       color: "green"  },
  { value: "daur_ulang",  label: "Daur Ulang",   desc: "Mengolah sampah menjadi produk baru yang berguna",      color: "blue"   },
  { value: "eco_brick",   label: "Eco Brick",    desc: "Mengumpulkan sampah plastik untuk modul eco brick",     color: "orange" },
  { value: "kompos",      label: "Kompos",       desc: "Mengolah sampah organik menjadi pupuk yang bernilai",   color: "yellow" },
];

const STEPS = ["Akun", "Profil Mitra", "Jenis Sampah", "Lokasi"];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition shadow-sm placeholder:text-gray-400";

const Field = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
      {label} {required && <span className="text-red-500" title="Wajib diisi">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 font-medium">{hint}</p>}
  </div>
);

// ─── Step 1: Akun ──────────────────────────────────────────
const StepAkun = ({ form, set }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mb-3 text-2xl">
          👤
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Buat Akun Kemitraan</h2>
        <p className="text-sm text-gray-500 mt-1">Langkah pertama untuk memperluas dampak positif Anda bersama REKLE.</p>
      </div>

      <Field label="Nama Pengelola (PIC)" required>
        <input
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Masukkan nama lengkap Anda"
          className={inputCls}
        />
      </Field>

      <Field label="Email Operasional" required hint="Alamat ini akan digunakan untuk login ke portal">
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value.toLowerCase())}
          placeholder="email@organisasi.com"
          className={inputCls}
        />
      </Field>

      <Field label="Password" required hint="Gunakan minimal 8 karakter dengan kombinasi angka/huruf">
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
      </Field>

      <Field label="Konfirmasi Password" required>
        <div className="relative">
          <input
            type={showConfirmPwd ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPwd ? "🙈" : "👁️"}
          </button>
        </div>
      </Field>
    </div>
  );
};

// ─── Step 2: Profil Mitra ──────────────────────────────────
const StepProfil = ({ form, set }) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-full mb-3 text-2xl">
        🏢
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Identitas Organisasi</h2>
      <p className="text-sm text-gray-500 mt-1">Beri tahu pengguna siapa Anda dan apa fokus layanan Anda.</p>
    </div>

    <Field label="Nama Entitas / Organisasi" required>
      <input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Contoh: Bank Sampah Sejahtera Abadi"
        className={inputCls}
      />
    </Field>

    <Field label="Kategori Mitra" required>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MITRA_TYPES.map((t) => {
          const selected = form.mitra_type === t.value;
          const colorMap = {
            green:  selected ? "border-emerald-500  bg-emerald-50  text-emerald-800 shadow-md ring-1 ring-emerald-500"  : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30",
            blue:   selected ? "border-blue-500   bg-blue-50   text-blue-800 shadow-md ring-1 ring-blue-500"   : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30",
            orange: selected ? "border-orange-500 bg-orange-50 text-orange-800 shadow-md ring-1 ring-orange-500" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30",
            yellow: selected ? "border-yellow-500 bg-yellow-50 text-yellow-800 shadow-md ring-1 ring-yellow-500" : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/30",
          };
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => set("mitra_type", t.value)}
              className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${colorMap[t.color]}`}
            >
              <p className="font-bold text-[15px]">{t.label}</p>
              <p className="text-xs mt-1 text-gray-500 leading-relaxed opacity-90">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </Field>

    <Field label="Deskripsi Singkat (Opsional)">
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Visi, misi, atau cerita di balik organisasi Anda..."
        rows={3}
        className={inputCls + " resize-none"}
      />
    </Field>

    <div className="grid grid-cols-2 gap-4">
      <Field label="No. Telepon Aktif">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
          placeholder="08123456789"
          className={inputCls}
        />
      </Field>
      <Field label="Website / Sosmed">
        <input
          type="url"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="instagram.com/akun"
          className={inputCls}
        />
      </Field>
    </div>
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mb-3 text-2xl">
          ♻️
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Kapasitas Pengolahan</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih jenis material yang dapat Anda terima atau olah.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WASTE_OPTIONS.map((w) => {
          const checked = form.accepted_waste.includes(w.value);
          return (
            <button
              key={w.value}
              type="button"
              onClick={() => toggleWaste(w.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                checked
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-2xl">{w.icon}</span>
              <div className="flex-1">
                <p className={`text-[15px] font-bold ${checked ? "text-emerald-800" : "text-gray-700"}`}>
                  {w.label}
                </p>
              </div>
              {checked ? (
                <span className="w-5 h-5 flex items-center justify-center bg-emerald-500 text-white rounded-full text-xs font-bold">✓</span>
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-gray-200"></span>
              )}
            </button>
          );
        })}
      </div>

      {form.accepted_waste.length === 0 && (
        <p className="text-xs text-center font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
          ⚠️ Anda wajib memilih minimal satu jenis material yang diterima.
        </p>
      )}
    </div>
  );
};

// ─── Step 4: Lokasi ────────────────────────────────────────
const StepLokasi = ({ form, set }) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur lokasi otomatis.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set("latitude", position.coords.latitude.toFixed(6));
        set("longitude", position.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (error) => {
        console.error("Error Geolocation:", error);
        alert("Gagal mendapatkan lokasi. Pastikan Anda telah memberikan izin akses lokasi pada browser.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 text-red-600 rounded-full mb-3 text-2xl">
          📍
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Titik Lokasi Drop-off</h2>
        <p className="text-sm text-gray-500 mt-1">Akurasi lokasi membantu masyarakat menemukan Anda dengan mudah.</p>
      </div>

      <Field label="Alamat Lengkap" required>
        <textarea
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Jl. Pahlawan No. 10, Kelurahan Maju, Kecamatan Damai..."
          rows={3}
          className={inputCls + " resize-none"}
        />
      </Field>

      <Field label="Kota / Kabupaten Daerah" required>
        <input
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Kota Yogyakarta"
          className={inputCls}
        />
      </Field>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Koordinat Peta</label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isLocating ? "⏳ Melacak..." : "🎯 Gunakan Lokasi Saat Ini"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            placeholder="Latitude (Cth: -7.7956)"
            className={inputCls}
            required
          />
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            placeholder="Longitude (Cth: 110.3695)"
            className={inputCls}
            required
          />
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────
const MitraRegister = () => {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirmPassword: "",
    name: "", mitra_type: "bank_sampah", description: "",
    phone: "", website: "",
    accepted_waste: [],
    address: "", city: "", latitude: "", longitude: "",
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.full_name.trim()) return setError("Nama lengkap wajib diisi") || false;
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return setError("Format email tidak valid") || false;
      if (!form.password)         return setError("Password wajib diisi") || false;
      if (form.password.length < 8) return setError("Password minimal 8 karakter") || false;
      if (form.password !== form.confirmPassword) return setError("Konfirmasi password tidak sama") || false;
    }
    if (step === 1) {
      if (!form.name.trim()) return setError("Nama mitra wajib diisi") || false;
    }
    if (step === 2) {
      if (form.accepted_waste.length === 0) return setError("Pilih minimal satu jenis material sampah") || false;
    }
    if (step === 3) {
      if (!form.address.trim()) return setError("Alamat wajib diisi") || false;
      if (!form.city.trim())    return setError("Kota wajib diisi") || false;
      if (!form.latitude || !form.longitude) return setError("Titik koordinat (Latitude & Longitude) wajib diisi") || false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const parseFastAPIError = (errData) => {
    // Penanganan khusus untuk standard FastAPI/OAS 3.1 HTTPValidationError
    if (errData?.detail && Array.isArray(errData.detail)) {
      const firstError = errData.detail[0];
      const field = firstError.loc[firstError.loc.length - 1];
      return `Kesalahan pada data "${field}": ${firstError.msg}`;
    }
    return errData?.detail || "Terjadi kesalahan pada server. Silakan coba lagi.";
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

      // 2. Login untuk mendapatkan Token
      const { data: loginData } = await api.post("/auth/login", {
        email:    form.email,
        password: form.password,
      });

      sessionStorage.setItem("access_token", loginData.access_token);

      if (loginData.refresh_token) {
        sessionStorage.setItem("refresh_token", loginData.refresh_token);
      }

      sessionStorage.setItem("is_superuser", "false");

      // 3. Buat entitas Mitra ke /api/v1/mitra/mine
      await api.post("/mitra/mine", {
        name:           form.name,
        mitra_type:     form.mitra_type,
        description:    form.description || null,
        phone:          form.phone || null,
        email:          form.email, 
        website:        form.website || null,
        address:        form.address,
        city:           form.city,
        latitude:       parseFloat(form.latitude),
        longitude:      parseFloat(form.longitude),
        // Pastikan backend menerima string yang digabung koma (cth: "Organik,B3,Plastik")
        // Jika backend meminta JSON Array of strings ubah menjadi: form.accepted_waste
        accepted_waste: form.accepted_waste.join(","), 
        is_active:      true, 
      });

      setSuccess(true);

    } catch (err) {
  console.error("REGISTER ERROR:", err);

  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  console.log("DETAIL:", err.response?.data?.detail);

  if (err.response?.status === 422) {
    setError(parseFastAPIError(err.response.data));
  } else {
    setError(
      err.response?.data?.detail ||
      JSON.stringify(err.response?.data) ||
      "Pendaftaran gagal. Pastikan email belum terdaftar."
    );
  }

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
} finally {
  setLoading(false);
} };

  // ─── Success Screen ──────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full text-center border border-emerald-100 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
            Terima kasih telah bergabung! Mitra <strong className="text-emerald-700">{form.name}</strong> berhasil didaftarkan.
            Tunggu verifikasi singkat dari admin sebelum Anda dapat mulai memproses sampah.
          </p>
          <button
            onClick={() => navigate("/mitra/dashboard")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1"
          >
            Masuk ke Portal Mitra →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-2xl">R</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">REKLE</span>
          </Link>
          <p className="text-sm font-medium text-gray-500 mt-2 tracking-wide uppercase">Portal Pendaftaran Kemitraan</p>
        </div>

        {/* Stepper Modern */}
        <div className="relative mb-10 px-2 sm:px-8">
          {/* Garis konektor background */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0" />
          
          {/* Garis progress (Active) */}
          <div 
            className="absolute top-1/2 left-8 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out" 
            style={{ width: `calc(${((step) / (STEPS.length - 1)) * 100}% - 2rem)` }} 
          />

          <div className="relative z-10 flex justify-between">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                    i < step
                      ? "bg-emerald-500 text-white border-2 border-emerald-500"
                      : i === step
                      ? "bg-white text-emerald-600 border-4 border-emerald-500 ring-4 ring-emerald-100"
                      : "bg-white text-gray-300 border-2 border-gray-200"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`absolute -bottom-6 text-[11px] whitespace-nowrap transition-colors duration-300 ${i === step ? "text-emerald-700 font-bold" : "text-gray-400 font-medium"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mt-8">
          {step === 0 && <StepAkun   form={form} set={set} />}
          {step === 1 && <StepProfil form={form} set={set} />}
          {step === 2 && <StepSampah form={form} set={set} />}
          {step === 3 && <StepLokasi form={form} set={set} />}

          {/* Alert Error Box */}
          {error && (
            <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 animate-in slide-in-from-top-2">
              <span className="text-xl">🚨</span>
              <div>
                <h4 className="text-sm font-bold">Terjadi Kesalahan</h4>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Tombol Navigasi Bawah */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10 pt-6 border-t border-gray-100">
            {step > 0 && (
              <button
                type="button"
                onClick={() => { setError(""); setStep((s) => s - 1); }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Kembali
              </button>
            )}

            <div className="flex-1" />

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-md"
              >
                Lanjutkan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </>
                ) : (
                  "Selesaikan Pendaftaran"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Link Login */}
        <p className="text-sm text-center text-gray-500 mt-8">
          Organisasi Anda sudah terdaftar?{" "}
          <Link to="/mitra/login" className="text-emerald-600 font-bold hover:underline">
            Masuk ke Dasbor
          </Link>
        </p>
      </div>
    </div>
  );
};

export default MitraRegister;