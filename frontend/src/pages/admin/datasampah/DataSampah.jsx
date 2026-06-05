import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { buildImageUrl } from "@/lib/imageURL";
import dayjs from "dayjs";

// ======================================================
// CONSTANTS
// ======================================================

const LIMIT = 10;

const CATEGORY_CONFIG = {
  B3:        { label: "B3",         className: "bg-red-100 text-red-700 border border-red-200" },
  Kaca:      { label: "Kaca",       className: "bg-cyan-100 text-cyan-700 border border-cyan-200" },
  Kardus:    { label: "Kardus",     className: "bg-amber-100 text-amber-700 border border-amber-200" },
  Kertas:    { label: "Kertas",     className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  Logam:     { label: "Logam",      className: "bg-slate-100 text-slate-700 border border-slate-200" },
  Medis:     { label: "Medis",      className: "bg-pink-100 text-pink-700 border border-pink-200" },
  Plastik:   { label: "Plastik",    className: "bg-blue-100 text-blue-700 border border-blue-200" },
  nonsampah: { label: "Non-Sampah", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  organik:   { label: "Organik",    className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
};

const RECOMMENDATION_LABEL = {
  kompos:      "Dikompos",
  daur_ulang:  "Didaur Ulang",
  eco_brick:   "Eco Brick",
  reuse:       "Digunakan Ulang",
  tidak_layak: "Tidak Layak",
  khusus:      "Penanganan Khusus",
};

// ======================================================
// HELPERS
// ======================================================

function getCategoryConfig(result) {
  return (
    CATEGORY_CONFIG[result] || {
      label: result || "-",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    }
  );
}

function getConfidenceColor(confidence) {
  if (!confidence)           return "bg-gray-300";
  if (confidence >= 0.9)     return "bg-green-500";
  if (confidence >= 0.75)    return "bg-green-400";
  if (confidence >= 0.6)     return "bg-yellow-400";
  return "bg-red-400";
}

// ======================================================
// SKELETON ROW
// ======================================================

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[40, 80, 120, 60, 100, 80, 100, 60].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 bg-gray-100 rounded animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

// ======================================================
// IMAGE THUMBNAIL
// ======================================================

function ImageThumb({ path }) {
  const [hasError, setHasError] = useState(false);
  const src = buildImageUrl(path);

  useEffect(() => {
    setHasError(false);
  }, [path]);

  if (!src || hasError) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <ImageIcon className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="scan"
      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
      onError={() => setHasError(true)}
    />
  );
}

// ======================================================
// CONFIRM DIALOG
// ======================================================

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Hapus Data Scan?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// PAGINATION COMPONENT
// ======================================================

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const base =
    "inline-flex items-center justify-center min-w-[32px] h-8 px-1 rounded-lg text-xs font-medium border transition-all duration-150 select-none";
  const inactive =
    "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 cursor-pointer";
  const active =
    "bg-green-600 text-white border-green-600 shadow-sm cursor-default";
  const disabled =
    "bg-white text-gray-300 border-gray-100 cursor-not-allowed";

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      {/* First */}
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        aria-label="Halaman pertama"
        className={`${base} ${page === 1 ? disabled : inactive}`}
      >
        <ChevronsLeft className="w-3.5 h-3.5" />
      </button>

      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Sebelumnya"
        className={`${base} ${page === 1 ? disabled : inactive}`}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Page numbers */}
      {getPages().map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-400 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => p !== page && onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Berikutnya"
        className={`${base} ${page === totalPages ? disabled : inactive}`}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Last */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Halaman terakhir"
        className={`${base} ${page === totalPages ? disabled : inactive}`}
      >
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

const DataSampah = () => {
  const [scans, setScans]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [filterOpen, setFilterOpen]         = useState(false);
  const [filterCategory, setFilterCategory] = useState("semua");
  const [total, setTotal]                   = useState(0);

  // Pagination
  const [page, setPage]                     = useState(1);

  // Delete state
  const [deletingId, setDeletingId]         = useState(null);
  const [confirmId, setConfirmId]           = useState(null);
  const [deleteError, setDeleteError]       = useState("");

  // ======================================================
  // FETCH
  // ======================================================

  const fetchScans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let data;
      try {
        const res = await api.get("/admin/scans", {
          params: { skip: 0, limit: 200 },
        });
        data = res.data;
      } catch {
        const res = await api.get("/scan/history", {
          params: { skip: 0, limit: 200 },
        });
        data = res.data;
      }

      const items = Array.isArray(data) ? data : data.items || [];
      setScans(items);
      setTotal(data.total ?? items.length);
    } catch (err) {
      console.error("Fetch scans error:", err);
      if (err.response?.status === 401)      setError("Silakan login terlebih dahulu.");
      else if (err.response?.status === 403) setError("Akses admin ditolak.");
      else                                   setError("Gagal mengambil data scan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, 30_000);
    return () => clearInterval(interval);
  }, [fetchScans]);

  // Reset ke page 1 saat filter/search berubah
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory]);

  // ======================================================
  // DELETE HANDLER
  // ======================================================

  const handleDeleteConfirm = useCallback(async () => {
    const id = confirmId;
    setConfirmId(null);

    try {
      setDeletingId(id);
      setDeleteError("");
      await api.delete(`/admin/scans/${id}`);
      setScans((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Delete scan error:", err);
      setDeleteError(
        err.response?.data?.detail || "Gagal menghapus data scan."
      );
    } finally {
      setDeletingId(null);
    }
  }, [confirmId]);

  // ======================================================
  // FILTER + SEARCH + PAGINATION (client-side)
  // ======================================================

  const filtered = scans.filter((item) => {
    const matchSearch =
      !search ||
      item.result?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.user_id).includes(search) ||
      item.recommendation?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      filterCategory === "semua" || item.result === filterCategory;

    return matchSearch && matchCategory;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);
  const startEntry  = filtered.length === 0 ? 0 : (safePage - 1) * LIMIT + 1;
  const endEntry    = Math.min(safePage * LIMIT, filtered.length);

  const categoryOptions = ["semua", ...Object.keys(CATEGORY_CONFIG)];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* CONFIRM DIALOG */}
      {confirmId !== null && (
        <ConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">
              Data Klasifikasi Sampah
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                {total.toLocaleString("id-ID")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Monitor dan tinjau hasil scan AI
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1 text-gray-400">
              <Search className="w-4 h-4 shrink-0" />
              <input
                type="text"
                placeholder="Cari kategori, user ID, rekomendasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition
                ${filterOpen || filterCategory !== "semua"
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {filterCategory !== "semua" && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          </div>

          {filterOpen && (
            <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 rounded-b-2xl">
              {categoryOptions.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition
                      ${filterCategory === cat
                        ? "bg-green-600 text-white border-green-600"
                        : cfg
                          ? `${cfg.className} hover:opacity-80`
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                  >
                    {cfg ? cfg.label : "Semua"}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ERROR FETCH */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ERROR DELETE */}
        {deleteError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError("")}
              className="ml-4 text-red-400 hover:text-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Gambar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-40">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rekomendasi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status AI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {/* Loading skeleton */}
                {loading &&
                  [...Array(LIMIT)].map((_, i) => <SkeletonRow key={i} />)}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Brain className="w-10 h-10 opacity-25" />
                        <p className="text-sm font-medium text-gray-500">
                          {search || filterCategory !== "semua"
                            ? "Tidak ada data yang cocok dengan filter."
                            : "Belum ada data scan."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading &&
                  paginated.map((item) => {
                    const catCfg     = getCategoryConfig(item.result);
                    const pct        = item.confidence
                      ? (item.confidence * 100).toFixed(1)
                      : 0;
                    const barColor   = getConfidenceColor(item.confidence);
                    const recLabel   =
                      RECOMMENDATION_LABEL[item.recommendation] ||
                      item.recommendation ||
                      "-";
                    const isDeleting = deletingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/70 transition-colors duration-100 ${
                          isDeleting ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        {/* Gambar */}
                        <td className="px-4 py-3">
                          <ImageThumb path={item.image_path} />
                        </td>

                        {/* Kategori */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catCfg.className}`}
                          >
                            {catCfg.label}
                          </span>
                        </td>

                        {/* Confidence */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 w-36">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor} transition-all`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-10 text-right tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        </td>

                        {/* User ID */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500">
                            #{item.user_id}
                          </span>
                        </td>

                        {/* Rekomendasi */}
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {recLabel}
                        </td>

                        {/* Status AI */}
                        <td className="px-4 py-3">
                          {item.is_confident ? (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-xs font-medium text-emerald-600">
                                Akurat
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                              <span className="text-xs font-medium text-yellow-600">
                                Kurang Yakin
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Waktu */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
                            {item.created_at
                              ? dayjs(item.created_at).format(
                                  "DD-MM-YYYY HH:mm"
                                )
                              : "-"}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setConfirmId(item.id)}
                              disabled={isDeleting}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 transition
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isDeleting ? "Menghapus..." : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* FOOTER — entry info + pagination */}
          {!loading && (
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">

              {/* Kiri: info + model */}
              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-400">
                  {filtered.length === 0 ? (
                    "Tidak ada data"
                  ) : (
                    <>
                      Menampilkan{" "}
                      <span className="font-semibold text-gray-600">
                        {startEntry}–{endEntry}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-gray-600">
                        {filtered.length.toLocaleString("id-ID")}
                      </span>{" "}
                      scan
                    </>
                  )}
                </p>
                <div className="hidden sm:flex items-center gap-1 text-gray-400">
                  <Brain className="w-3.5 h-3.5" />
                  <span className="text-xs">MobileNetV2</span>
                </div>
              </div>

              {/* Kanan: pagination */}
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DataSampah;