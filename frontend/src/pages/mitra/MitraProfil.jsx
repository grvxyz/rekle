import { useEffect, useState, useCallback } from "react";
import { Save, MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";
import api from "@/lib/axios";

// ─── Constants ─────────────────────────────────────────────
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
  { value: "bank_sampah", label: "Bank Sampah" },
  { value: "daur_ulang",  label: "Daur Ulang"  },
  { value: "eco_brick",   label: "Eco Brick"   },
  { value: "kompos",      label: "Kompos"       },
];

const MITRA_TYPE_CONFIG = {
  bank_sampah: { label: "Bank Sampah",  bg: "bg-green-100",  text: "text-green-700"  },
  daur_ulang:  { label: "Daur Ulang",   bg: "bg-blue-100",   text: "text-blue-700"   },
  eco_brick:   { label: "Eco Brick",    bg: "bg-orange-100", text: "text-orange-700" },
  kompos:      { label: "Kompos",       bg: "bg-yellow-100", text: "text-yellow-700" },
};

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition";

const Field = ({ label, icon: Icon, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div className="pb-3 border-b border-gray-100 mb-4">
    <h3 className="text-base font-bold text-gray-900">{children}</h3>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

const MitraProfil = () => {
  const [mitra,   setMitra]   = useState(null);
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [isNew,   setIsNew]   = useState(false);

  const fetchMitra = useCallback(async () => {
    try {
      setLoading(true);
      // Gunakan /mitra/mine — kembalikan mitra milik user yang login
      const { data } = await api.get("/mitra/mine");
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        const m = list[0];
        setMitra(m);
        setForm({
          name:          m.name || "",
          mitra_type:    m.mitra_type || "bank_sampah",
          description:   m.description || "",
          phone:         m.phone || "",
          email:         m.email || "",
          website:       m.website || "",
          address:       m.address || "",
          city:          m.city || "",
          latitude:      m.latitude ?? "",
          longitude:     m.longitude ?? "",
          accepted_waste: m.accepted_waste
            ? m.accepted_waste.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          is_active: m.is_active,
        });
        setIsNew(false);
      } else {
        setIsNew(true);
        setForm({
          name: "", mitra_type: "bank_sampah", description: "",
          phone: "", email: "", website: "",
          address: "", city: "", latitude: "", longitude: "",
          accepted_waste: [], is_active: true,
        });
      }
    } catch (err) {
      setError("Gagal memuat data profil mitra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMitra(); }, [fetchMitra]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const toggleWaste = (value) => {
    const cur = form.accepted_waste;
    set("accepted_waste", cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value]
    );
  };

  const handleSave = async () => {
    if (!form.name.trim())    { setError("Nama mitra wajib diisi"); return; }
    if (!form.address.trim()) { setError("Alamat wajib diisi"); return; }
    if (!form.city.trim())    { setError("Kota wajib diisi"); return; }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        latitude:      form.latitude  !== "" ? parseFloat(form.latitude)  : null,
        longitude:     form.longitude !== "" ? parseFloat(form.longitude) : null,
        accepted_waste: form.accepted_waste.join(","),
      };

      if (isNew) {
        // POST ke /mitra/mine — backend ikat ke user yang sedang login
        const { data } = await api.post("/mitra/mine", payload);
        setMitra(data);
        setIsNew(false);
        setSuccess("✅ Profil mitra berhasil dibuat!");
      } else {
        // PATCH ke /mitra/mine/{id} — hanya bisa edit mitra milik sendiri
        const { data } = await api.patch(`/mitra/mine/${mitra.id}`, payload);
        setMitra(data);
        setSuccess("✅ Profil mitra berhasil diperbarui!");
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const typeConfig = form ? MITRA_TYPE_CONFIG[form.mitra_type] : null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Daftarkan Mitra" : "Profil Mitra"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isNew
              ? "Lengkapi data untuk mendaftarkan mitra Anda"
              : "Kelola informasi dan data mitra Anda"
            }
          </p>
        </div>

        {!isNew && mitra && (
          <div className="flex items-center gap-2">
            {typeConfig && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeConfig.bg} ${typeConfig.text}`}>
                {typeConfig.label}
              </span>
            )}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              mitra.is_active
                ? "text-green-600 border-green-300 bg-green-50"
                : "text-gray-400 border-gray-200 bg-gray-50"
            }`}>
              {mitra.is_active ? "● Aktif" : "● Nonaktif"}
            </span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}
      {isNew && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
          ℹ️ Anda belum memiliki data mitra. Lengkapi form ini untuk mendaftarkan mitra Anda.
        </div>
      )}

      {form && (
        <>
          {/* Section 1: Informasi Dasar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <SectionTitle sub="Nama, tipe, dan deskripsi mitra">
              <Building2 className="inline w-4 h-4 text-gray-600 mr-1.5" />
              Informasi Dasar
            </SectionTitle>

            <Field label="Nama Mitra / Organisasi *">
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Bank Sampah Sejahtera"
                className={inputCls}
              />
            </Field>

            <Field label="Tipe Mitra *">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MITRA_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set("mitra_type", t.value)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      form.mitra_type === t.value
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Deskripsi">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ceritakan tentang mitra Anda..."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Mitra aktif dan dapat menerima setoran
              </label>
            </div>
          </div>

          {/* Section 2: Kontak */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <SectionTitle sub="Nomor telepon, email, dan website">
              <Phone className="inline w-4 h-4 text-gray-600 mr-1.5" />
              Informasi Kontak
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nomor Telepon" icon={Phone}>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className={inputCls}
                />
              </Field>

              <Field label="Email Mitra" icon={Mail}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="info@mitra.com"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Website" icon={Globe}>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://mitra-anda.com (opsional)"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Section 3: Jenis Sampah */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <SectionTitle sub="Pilih jenis sampah yang Anda terima / olah">
              ♻️ Jenis Sampah Diterima
            </SectionTitle>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WASTE_OPTIONS.map((w) => {
                const checked = form.accepted_waste.includes(w.value);
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => toggleWaste(w.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition ${
                      checked
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{w.icon}</span>
                    <span className={`text-xs font-medium ${checked ? "text-green-800" : "text-gray-600"}`}>
                      {w.label}
                    </span>
                    {checked && <span className="text-green-500 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Lokasi */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <SectionTitle sub="Alamat lengkap dan koordinat mitra">
              <MapPin className="inline w-4 h-4 text-gray-600 mr-1.5" />
              Lokasi Mitra
            </SectionTitle>

            <Field label="Alamat Lengkap *">
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Jl. Contoh No. 123, Kel. ..., Kec. ..."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </Field>

            <Field label="Kota / Kabupaten *">
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

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              💡 Klik kanan di Google Maps → "What's here?" untuk mendapatkan koordinat lokasi Anda.
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 shadow-md"
            >
              <Save className="w-4 h-4" />
              {saving
                ? "Menyimpan..."
                : isNew
                ? "Daftarkan Mitra"
                : "Simpan Perubahan"
              }
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MitraProfil;