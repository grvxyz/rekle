import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

// ─── Konstanta ─────────────────────────────────────────────
const WASTE_OPTIONS = [
  { value: "organik",          label: "Organik" },
  { value: "plastik_pet",      label: "Plastik PET" },
  { value: "plastik_hdpe",     label: "Plastik HDPE" },
  { value: "plastik_campuran", label: "Plastik Campuran" },
  { value: "kertas_bersih",    label: "Kertas Bersih" },
  { value: "kertas_kotor",     label: "Kertas Kotor" },
  { value: "kaca_utuh",        label: "Kaca Utuh" },
  { value: "kaca_pecah",       label: "Kaca Pecah" },
];

const MITRA_TYPES = [
  { value: "bank_sampah", label: "Bank Sampah" },
  { value: "daur_ulang",  label: "Daur Ulang" },
  { value: "eco_brick",   label: "Eco Brick" },
  { value: "kompos",      label: "Kompos" },
];

const MITRA_TYPE_CONFIG = {
  bank_sampah: { label: "Bank Sampah",  className: "bg-green-100 text-green-700" },
  daur_ulang:  { label: "Daur Ulang",   className: "bg-blue-100 text-blue-700" },
  eco_brick:   { label: "Eco Brick",    className: "bg-orange-100 text-orange-700" },
  kompos:      { label: "Kompos",       className: "bg-yellow-100 text-yellow-700" },
};

const EMPTY_FORM = {
  name: "", description: "", phone: "", email: "",
  website: "", address: "", city: "",
  latitude: "", longitude: "",
  accepted_waste: [],
  mitra_type: "bank_sampah",
  is_active: true,
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

// ======================================================
// FIELD WRAPPER
// ======================================================
const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

// ======================================================
// MODAL FORM (tambah / edit)
// ======================================================
const MitraFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          latitude:  initial.latitude  ?? "",
          longitude: initial.longitude ?? "",
          accepted_waste: initial.accepted_waste
            ? initial.accepted_waste.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const isEdit = Boolean(initial);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleWaste = (value) =>
    setForm((p) => ({
      ...p,
      accepted_waste: p.accepted_waste.includes(value)
        ? p.accepted_waste.filter((v) => v !== value)
        : [...p.accepted_waste, value],
    }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nama mitra wajib diisi"); return; }
    try {
      setSaving(true); setError("");
      const payload = {
        ...form,
        latitude:  form.latitude  !== "" ? parseFloat(form.latitude)  : null,
        longitude: form.longitude !== "" ? parseFloat(form.longitude) : null,
        accepted_waste: form.accepted_waste.join(","),
      };
      if (isEdit) {
        const { data } = await api.patch(`/mitra/data/${initial.id}`, payload);
        onSave(data);
      } else {
        const { data } = await api.post("/mitra/data", payload);
        onSave(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan data mitra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">
            {isEdit ? "Edit Partner" : "Add New Partner"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          <Field label="Nama Mitra *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Bank Sampah Sejahtera" className={inputCls} />
          </Field>

          <Field label="Deskripsi">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Deskripsi singkat..." rows={2} className={inputCls + " resize-none"} />
          </Field>

          <Field label="Tipe Mitra">
            <select value={form.mitra_type} onChange={(e) => set("mitra_type", e.target.value)} className={inputCls}>
              {MITRA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Jenis Sampah yang Diterima">
            <div className="flex flex-wrap gap-2 mt-1">
              {WASTE_OPTIONS.map((w) => {
                const checked = form.accepted_waste.includes(w.value);
                return (
                  <button key={w.value} type="button" onClick={() => toggleWaste(w.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      checked
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                    }`}>
                    {w.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nomor Telepon">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="08xx-xxxx-xxxx" className={inputCls} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="mitra@email.com" type="email" className={inputCls} />
            </Field>
          </div>

          <Field label="Website">
            <input value={form.website} onChange={(e) => set("website", e.target.value)}
              placeholder="https://..." className={inputCls} />
          </Field>

          <Field label="Alamat">
            <textarea value={form.address} onChange={(e) => set("address", e.target.value)}
              placeholder="Alamat lengkap..." rows={2} className={inputCls + " resize-none"} />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Kota">
              <input value={form.city} onChange={(e) => set("city", e.target.value)}
                placeholder="Magelang" className={inputCls} />
            </Field>
            <Field label="Latitude">
              <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)}
                placeholder="-7.47..." type="number" step="any" className={inputCls} />
            </Field>
            <Field label="Longitude">
              <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)}
                placeholder="110.21..." type="number" step="any" className={inputCls} />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <input id="is_active" type="checkbox" checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="w-4 h-4 accent-green-600" />
            <label htmlFor="is_active" className="text-sm text-gray-700">Mitra aktif</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-600 border hover:bg-gray-50 transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50">
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Mitra"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// DETAIL MODAL
// ======================================================
const DetailRow = ({ icon, text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="mt-0.5 shrink-0">{icon}</span>
    <span>{text}</span>
  </div>
);

const MitraDetailModal = ({ mitra, onClose, onToggleActive, onDelete, actionLoading }) => {
  const typeConfig = MITRA_TYPE_CONFIG[mitra.mitra_type] || {
    label: mitra.mitra_type, className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Detail Mitra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-snug">{mitra.name}</h3>
              <span className={`inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full ${typeConfig.className}`}>
                {typeConfig.label}
              </span>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              mitra.is_active
                ? "text-green-600 border-green-300 bg-green-50"
                : "text-gray-400 border-gray-200 bg-gray-50"
            }`}>
              {mitra.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {mitra.description && (
            <p className="text-sm text-gray-500">{mitra.description}</p>
          )}

          <div className="space-y-2">
            {mitra.address && (
              <DetailRow icon="📍" text={`${mitra.address}${mitra.city ? `, ${mitra.city}` : ""}`} />
            )}
            {mitra.phone   && <DetailRow icon="📞" text={mitra.phone} />}
            {mitra.email   && <DetailRow icon="✉️"  text={mitra.email} />}
            {mitra.website && <DetailRow icon="🌐" text={mitra.website} />}
            {(mitra.latitude && mitra.longitude) && (
              <DetailRow icon="🗺️" text={`${mitra.latitude}, ${mitra.longitude}`} />
            )}
          </div>

          {mitra.accepted_waste && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Jenis Sampah Diterima
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mitra.accepted_waste.split(",").map((w) => (
                  <span key={w} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    {w.trim().replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t">
          <button
            onClick={() => { onToggleActive(mitra); onClose(); }}
            disabled={actionLoading === mitra.id}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              mitra.is_active
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {mitra.is_active ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button
            onClick={() => { onDelete(mitra); onClose(); }}
            disabled={actionLoading === mitra.id}
            className="flex-1 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Hapus
          </button>
        </div>

      </div>
    </div>
  );
};

// ======================================================
// PARTNER CARD
// ======================================================
const MitraCard = ({ mitra, actionLoading, onEdit, onViewDetail }) => {
  const typeConfig = MITRA_TYPE_CONFIG[mitra.mitra_type] || {
    label: mitra.mitra_type, className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-snug">{mitra.name}</h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
          mitra.is_active
            ? "text-green-600 border-green-300 bg-green-50"
            : "text-gray-400 border-gray-200 bg-gray-50"
        }`}>
          {mitra.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Tipe */}
      <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${typeConfig.className}`}>
        {typeConfig.label}
      </span>

      {/* Info rows */}
      <div className="space-y-2 text-sm text-gray-600 flex-1">
        {(mitra.address || mitra.city) && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418-4.418-7-7.79-7-11A7 7 0 0112 3a7 7 0 017 7c0 3.21-2.582 6.582-7 11z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            <span className="line-clamp-1">
              {[mitra.address, mitra.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {mitra.phone && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A2.5 2.5 0 015.5 3h.89a1 1 0 01.97.757l.9 3.6a1 1 0 01-.29.99l-1.27 1.14a13.05 13.05 0 006.29 6.29l1.14-1.27a1 1 0 01.99-.29l3.6.9a1 1 0 01.757.97v.89A2.5 2.5 0 0118.5 21C9.44 21 3 14.56 3 5.5z" />
            </svg>
            <span>{mitra.phone}</span>
          </div>
        )}

        {mitra.accepted_waste && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8l-2 4h12l-2-4z" />
            </svg>
            <span className="line-clamp-1">
              {mitra.accepted_waste.split(",").map((w) => w.trim().replace(/_/g, " ")).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Aksi */}
      <div className="flex gap-3">
        <button
          onClick={() => onEdit(mitra)}
          disabled={actionLoading === mitra.id}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onViewDetail(mitra)}
          disabled={actionLoading === mitra.id}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          View Details
        </button>
      </div>

    </div>
  );
};

// ======================================================
// SKELETON CARDS
// ======================================================
const SkeletonCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-28" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="border-t border-gray-100 pt-4 flex gap-3">
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);

// ======================================================
// MAIN PAGE
// ======================================================
const DataMitra = () => {
  const [mitras,        setMitras]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState("");
  const [filterActive,  setFilterActive]  = useState("");
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const [formModal,   setFormModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [detailMitra, setDetailMitra] = useState(null);

  const LIMIT = 20;

  const fetchMitras = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const { data } = await api.get("/mitra/admin/all", {
        params: {
          search:     search     || undefined,
          mitra_type: filterType || undefined,
          is_active:  filterActive !== "" ? filterActive === "true" : undefined,
          skip:       (page - 1) * LIMIT,
          limit:      LIMIT,
        },
      });
      const list = Array.isArray(data) ? data : [];
      setMitras(list);
      setTotalPages(1);
    } catch (err) {
      if (err.response?.status === 401)      setError("Silakan login terlebih dahulu");
      else if (err.response?.status === 403) setError("Akses admin ditolak");
      else                                   setError("Gagal mengambil data mitra");
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterActive, page]);

  useEffect(() => { fetchMitras(); }, [fetchMitras]);
  useEffect(() => { setPage(1); }, [search, filterType, filterActive]);

  const handleToggleActive = async (mitra) => {
    const action = mitra.is_active ? "menonaktifkan" : "mengaktifkan";
    if (!window.confirm(`Yakin ingin ${action} mitra ini?`)) return;
    try {
      setActionLoading(mitra.id);
      await api.patch(`/mitra/data/${mitra.id}/toggle-active`);
      setMitras((prev) =>
        prev.map((m) => m.id === mitra.id ? { ...m, is_active: !m.is_active } : m)
      );
    } catch {
      alert("Gagal mengubah status mitra");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (mitra) => {
    if (!window.confirm(`Yakin ingin menghapus mitra "${mitra.name}"?`)) return;
    try {
      setActionLoading(mitra.id);
      await api.delete(`/mitra/data/${mitra.id}`);
      setMitras((prev) => prev.filter((m) => m.id !== mitra.id));
    } catch {
      alert("Gagal menghapus mitra");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaved = (saved) => {
    setFormModal(false);
    if (editTarget) {
      setMitras((prev) => prev.map((m) => m.id === saved.id ? saved : m));
    } else {
      setMitras((prev) => [saved, ...prev]);
    }
    setEditTarget(null);
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage waste disposal partners and facilities
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormModal(true); }}
          className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
        >
          Add Partner
        </button>
      </div>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama atau kota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Semua Tipe</option>
          {MITRA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Semua Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={fetchMitras}
          className="px-4 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl text-sm">{error}</div>
      )}

      {/* CONTENT */}
      {loading ? (
        <SkeletonCards />
      ) : mitras.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🤝</p>
          <p className="font-medium text-gray-500">Belum ada mitra terdaftar</p>
          <p className="text-sm mt-1">Klik "Add Partner" untuk menambahkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mitras.map((mitra) => (
            <MitraCard
              key={mitra.id}
              mitra={mitra}
              actionLoading={actionLoading}
              onEdit={(m) => { setEditTarget(m); setFormModal(true); }}
              onViewDetail={(m) => setDetailMitra(m)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition">
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition">
            Next →
          </button>
        </div>
      )}

      {/* FORM MODAL */}
      {formModal && (
        <MitraFormModal
          initial={editTarget}
          onClose={() => { setFormModal(false); setEditTarget(null); }}
          onSave={handleSaved}
        />
      )}

      {/* DETAIL MODAL */}
      {detailMitra && (
        <MitraDetailModal
          mitra={detailMitra}
          actionLoading={actionLoading}
          onClose={() => setDetailMitra(null)}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
};

export default DataMitra;