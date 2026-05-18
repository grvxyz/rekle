import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Trophy,
  Lightbulb,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Konstanta ──────────────────────────────────────────────

const CONTENT_TYPES = [
  { value: "all",       label: "All" },
  { value: "tip",       label: "Tips" },
  { value: "challenge", label: "Challenges" },
  { value: "reward",    label: "Rewards" },
];

const STATUS_OPTIONS = ["published", "active", "draft", "inactive"];

const TYPE_CONFIG = {
  tip: {
    label: "Tips",
    badgeCls: "bg-blue-100 text-blue-700",
    icon: <Lightbulb className="w-5 h-5 text-green-600" />,
    bgIcon: "bg-green-50",
  },
  challenge: {
    label: "Challenge",
    badgeCls: "bg-purple-100 text-purple-700",
    icon: <Trophy className="w-5 h-5 text-green-600" />,
    bgIcon: "bg-green-50",
  },
  reward: {
    label: "Reward",
    badgeCls: "bg-yellow-100 text-yellow-700",
    icon: <FileText className="w-5 h-5 text-green-600" />,
    bgIcon: "bg-green-50",
  },
};

const STATUS_CONFIG = {
  published: { label: "Published", cls: "text-green-600" },
  active:    { label: "Active",    cls: "text-green-600" },
  draft:     { label: "Draft",     cls: "text-gray-500"  },
  inactive:  { label: "Inactive",  cls: "text-gray-400"  },
};

// FIX #1: Gunakan "type" bukan "content_type" agar sesuai schema backend
const EMPTY_FORM = {
  title: "",
  description: "",
  type: "tip",      // ✅ was: content_type
  status: "draft",
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

// ─── Helper: parse error detail dari Pydantic/FastAPI ───────
// FIX #2: detail bisa berupa string atau array of objects — jangan render mentah
const parseErrorDetail = (err) => {
  const detail = err.response?.data?.detail;
  if (!detail) return "Gagal menyimpan konten. Periksa koneksi atau coba lagi.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Pydantic v2 validation error: [{loc, msg, type, input}, ...]
    return detail.map((e) => e.msg ?? JSON.stringify(e)).join(", ");
  }
  return "Gagal menyimpan konten. Periksa koneksi atau coba lagi.";
};

// ─── Skeleton ───────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-gray-200 rounded-full" />
        <div className="w-20 h-5 bg-gray-100 rounded-full" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
      <div className="h-3 bg-gray-100 rounded w-28" />
      <div className="flex gap-2">
        <div className="w-14 h-8 bg-gray-100 rounded-xl" />
        <div className="w-16 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Field wrapper ──────────────────────────────────────────

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

// ─── Modal Form (tambah / edit) ─────────────────────────────

const ContentFormModal = ({ initial, onClose, onSave }) => {
  // FIX #3: Saat edit, pastikan field "type" ada (item dari API pakai "type")
  const [form, setForm] = useState(
    initial
      ? {
          title:       initial.title       ?? "",
          description: initial.description ?? "",
          type:        initial.type        ?? "tip",  // ✅ was: content_type
          status:      initial.status      ?? "draft",
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const isEdit = Boolean(initial);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Judul konten wajib diisi");
      return;
    }
    try {
      setSaving(true);
      setError("");

      let result;
      if (isEdit) {
        // PUT /api/v1/admin/content/{id}
        const { data } = await api.put(`/admin/content/${initial.id}`, form);
        result = data;
      } else {
        // POST /api/v1/admin/content
        const { data } = await api.post("/admin/content", form);
        result = data;
      }
      onSave(result);
    } catch (err) {
      console.error("Save content error:", err);
      // FIX #2: Selalu hasilkan string, bukan object/array
      setError(parseErrorDetail(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Konten" : "Tambah Konten"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {/* error dijamin string, aman di-render */}
              {error}
            </div>
          )}

          <Field label="Judul">
            <input
              className={inputCls}
              placeholder="Masukkan judul konten..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Deskripsi singkat konten..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipe">
              <select
                className={inputCls}
                value={form.type}                          // ✅ was: form.content_type
                onChange={(e) => set("type", e.target.value)} // ✅ was: "content_type"
              >
                <option value="tip">Tips</option>
                <option value="challenge">Challenge</option>
                <option value="reward">Reward</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s]?.label ?? s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? "Simpan" : "Tambah"}
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Content Card ────────────────────────────────────────────

const ContentCard = ({ item, onEdit, onDelete, deleting }) => {
  // FIX #4: item dari API pakai "type", bukan "content_type"
  const type   = TYPE_CONFIG[item.type]   ?? TYPE_CONFIG.tip;    // ✅ was: item.content_type
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.draft;

  const createdAt = item.created_at
    ? new Date(item.created_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "numeric", year: "numeric",
      })
    : "-";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${type.bgIcon} flex items-center justify-center shrink-0`}>
          {type.icon}
        </div>

        {/* Title + desc */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.title}</p>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
            {item.description}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${type.badgeCls}`}>
            {type.label}
          </span>
          <span className={`text-xs font-medium ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">Created {createdAt}</p>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            disabled={deleting === item.id}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition"
          >
            {deleting === item.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────

const ContentManagement = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [activeType, setActiveType] = useState("all");
  const [search, setSearch]         = useState("");

  const [modal, setModal]           = useState(null); // null | "create" | item
  const [deleting, setDeleting]     = useState(null);

  // ── Fetch ────────────────────────────────────────────────

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (activeType !== "all") params.type = activeType;
      if (search.trim())        params.search = search.trim();

      const { data } = await api.get("/admin/content", { params });

      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error("Fetch content error:", err);
      if (err.response?.status === 401)      setError("Silakan login terlebih dahulu");
      else if (err.response?.status === 403) setError("Akses admin ditolak");
      else                                   setError("Gagal mengambil data konten");
    } finally {
      setLoading(false);
    }
  }, [activeType, search]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // ── Save (create / edit) ─────────────────────────────────

  const handleSave = (saved) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModal(null);
  };

  // ── Delete ───────────────────────────────────────────────

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus konten "${item.title}"?`
    );
    if (!confirmed) return;

    try {
      setDeleting(item.id);
      await api.delete(`/admin/content/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Delete content error:", err);
      alert("Gagal menghapus konten");
    } finally {
      setDeleting(null);
    }
  };

  // ── Filtered list (client-side fallback) ─────────────────
  // FIX #5: filter pakai item.type, bukan item.content_type
  const filtered = items.filter((item) => {
    const matchType   = activeType === "all" || item.type === activeType; // ✅ was: item.content_type
    const matchSearch =
      !search.trim() ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage eco tips, challenges, and rewards
          </p>
        </div>

        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          + Create Content
        </button>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeType === t.value
                ? "bg-green-600 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari konten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-56"
          />
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Content List ─────────────────────────────────── */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)

        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada konten</p>
            <p className="text-sm text-gray-400 mt-1">
              Klik "+ Create Content" untuk menambahkan konten baru
            </p>
          </div>

        ) : (
          filtered.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={(i) => setModal(i)}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────── */}
      {modal && (
        <ContentFormModal
          initial={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

    </div>
  );
};

export default ContentManagement;