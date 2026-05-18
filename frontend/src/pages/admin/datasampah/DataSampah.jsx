import { useEffect, useState, useCallback } from "react";
import { Search, Filter, Image as ImageIcon, CheckCircle2, AlertTriangle, Brain } from "lucide-react";
import api from "@/lib/axios";
import dayjs from "dayjs";

// ======================================================
// CONSTANTS
// ======================================================

const CATEGORY_CONFIG = {
  organik:          { label: "Organik",        className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  plastik_pet:      { label: "Plastik PET",     className: "bg-blue-100 text-blue-700 border border-blue-200" },
  plastik_hdpe:     { label: "Plastik HDPE",    className: "bg-blue-100 text-blue-700 border border-blue-200" },
  plastik_campuran: { label: "Plastik",         className: "bg-blue-100 text-blue-700 border border-blue-200" },
  kertas_bersih:    { label: "Kertas",          className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  kertas_kotor:     { label: "Kertas Kotor",    className: "bg-orange-100 text-orange-700 border border-orange-200" },
  kaca_utuh:        { label: "Kaca",            className: "bg-cyan-100 text-cyan-700 border border-cyan-200" },
  kaca_pecah:       { label: "Kaca Pecah",      className: "bg-red-100 text-red-700 border border-red-200" },
  "Tidak dikenali": { label: "Tidak Dikenali",  className: "bg-gray-100 text-gray-600 border border-gray-200" },
};

const RECOMMENDATION_LABEL = {
  kompos:       "Dikompos",
  daur_ulang:   "Didaur Ulang",
  eco_brick:    "Eco Brick",
  reuse:        "Digunakan Ulang",
  tidak_layak:  "Tidak Layak",
  khusus:       "Penanganan Khusus",
};

// ======================================================
// HELPERS
// ======================================================

function getCategoryConfig(result) {
  return CATEGORY_CONFIG[result] || {
    label: result || "-",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };
}

function getConfidenceColor(confidence) {
  if (!confidence) return "bg-gray-300";
  if (confidence >= 0.9)  return "bg-green-500";
  if (confidence >= 0.75) return "bg-green-400";
  if (confidence >= 0.6)  return "bg-yellow-400";
  return "bg-red-400";
}

// ======================================================
// SKELETON
// ======================================================

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: i === 0 ? 40 : i === 3 ? 120 : 80 }} />
        </td>
      ))}
    </tr>
  );
}

// ======================================================
// IMAGE THUMBNAIL
// ======================================================

function ImageThumb({ path }) {
  const [error, setError] = useState(false);
  const src = path ? `http://127.0.0.1:8000/${path}` : null;

  if (!src || error) {
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
      onError={() => setError(true)}
    />
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

const DataSampah = () => {
  const [scans, setScans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("semua");
  const [total, setTotal]         = useState(0);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchScans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Admin menggunakan endpoint scan history semua user
      // GET /api/v1/admin/scans (jika tersedia) atau fallback ke scan/history
      // Coba endpoint admin dulu
      let data;
      try {
        const res = await api.get("/admin/scans", { params: { skip: 0, limit: 50 } });
        data = res.data;
      } catch {
        // Fallback: pakai scan history milik admin sendiri
        const res = await api.get("/scan/history", { params: { skip: 0, limit: 50 } });
        data = res.data;
      }

      const items = Array.isArray(data) ? data : (data.items || []);
      setScans(items);
      setTotal(data.total ?? items.length);

    } catch (err) {
      console.error("Fetch scans error:", err);
      if (err.response?.status === 401) setError("Silakan login terlebih dahulu.");
      else if (err.response?.status === 403) setError("Akses admin ditolak.");
      else setError("Gagal mengambil data scan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // ======================================================
  // FILTER & SEARCH
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

  const categoryOptions = [
    "semua",
    ...Object.keys(CATEGORY_CONFIG),
  ];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Klasifikasi Sampah</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor dan tinjau hasil scan AI</p>
        </div>

        {/* ── SEARCH & FILTER BAR ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 text-gray-400">
              <Search className="w-4 h-4 shrink-0" />
              <input
                type="text"
                placeholder="Cari berdasarkan kategori, rekomendasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition
                ${filterOpen || filterCategory !== "semua"
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Filter Dropdown */}
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

        {/* ── ERROR ── */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">Gambar</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">User ID</th>
                  <th className="px-4 py-3 font-medium">Rekomendasi</th>
                  <th className="px-4 py-3 font-medium">Status AI</th>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">

                {/* Loading */}
                {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400 text-sm">
                      {search || filterCategory !== "semua"
                        ? "Tidak ada data yang cocok dengan filter."
                        : "Belum ada data scan."}
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!loading && filtered.map((item) => {
                  const catCfg   = getCategoryConfig(item.result);
                  const pct      = item.confidence ? (item.confidence * 100).toFixed(1) : 0;
                  const barColor = getConfidenceColor(item.confidence);
                  const recLabel = RECOMMENDATION_LABEL[item.recommendation] || item.recommendation || "-";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Gambar */}
                      <td className="px-4 py-3">
                        <ImageThumb path={item.image_path} />
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catCfg.className}`}>
                          {catCfg.label}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-32.5">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3 text-gray-700">
                        #{item.user_id}
                      </td>

                      {/* Rekomendasi */}
                      <td className="px-4 py-3 text-gray-600">
                        {recLabel}
                      </td>

                      {/* Status AI */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.is_confident ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600">Akurat</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-medium text-yellow-600">Kurang Yakin</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {item.created_at
                          ? dayjs(item.created_at).format("DD-MM-YYYY HH:mm:ss")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER ── */}
          {!loading && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
              <span>
                Menampilkan {filtered.length} dari {total} scan
              </span>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Brain className="w-3.5 h-3.5" />
                <span>MobileNetV2</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DataSampah;