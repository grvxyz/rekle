import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Zap, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import dayjs from "dayjs";

// ======================================================
// HELPERS
// ======================================================

const CATEGORY_LABEL = {
  organik:          "Sampah Organik",
  plastik_pet:      "Plastik PET",
  plastik_hdpe:     "Plastik HDPE",
  plastik_campuran: "Plastik Campuran",
  kertas_bersih:    "Kertas Bersih",
  kertas_kotor:     "Kertas Kotor",
  kaca_utuh:        "Kaca Utuh",
  kaca_pecah:       "Kaca Pecah",
};

const ACTION_LABEL = {
  kompos:      "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang:  "Daur Ulang",
  eco_brick:   "Eco Brick",
  reuse:       "Reuse",
  tidak_layak: "Tidak Layak Daur Ulang",
  khusus:      "Penanganan Khusus",
};

const ACTION_COLOR = {
  kompos:      "bg-lime-100 text-lime-700",
  bank_sampah: "bg-blue-100 text-blue-700",
  daur_ulang:  "bg-emerald-100 text-emerald-700",
  eco_brick:   "bg-orange-100 text-orange-700",
  reuse:       "bg-amber-100 text-amber-700",
  tidak_layak: "bg-gray-100 text-gray-600",
  khusus:      "bg-red-100 text-red-600",
};

// ======================================================
// HISTORY PAGE
// ======================================================

const LIMIT = 15;

const HistoryPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("scan"); // "scan" | "action"

  // ── SCAN STATE ────────────────────────────────────────
  const [scans, setScans]           = useState([]);
  const [scanTotal, setScanTotal]   = useState(0);
  const [scanPage, setScanPage]     = useState(1);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError]   = useState("");

  // ── ACTION STATE ──────────────────────────────────────
  const [actions, setActions]         = useState([]);
  const [actionPage, setActionPage]   = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [hasMoreActions, setHasMoreActions] = useState(true);

  // ======================================================
  // FETCH SCAN HISTORY
  // ======================================================

  const fetchScans = useCallback(async () => {
    try {
      setScanLoading(true);
      setScanError("");

      const skip = (scanPage - 1) * LIMIT;
      const { data } = await api.get("/scan/history", {
        params: { skip, limit: LIMIT },
      });

      setScans(Array.isArray(data.items) ? data.items : []);
      setScanTotal(data.total ?? 0);
    } catch (err) {
      console.error("[HistoryPage] Scan fetch error:", err);
      setScanError("Gagal mengambil riwayat scan");
    } finally {
      setScanLoading(false);
    }
  }, [scanPage]);

  // ======================================================
  // FETCH ACTION HISTORY
  // ======================================================

  const fetchActions = useCallback(async () => {
    try {
      setActionLoading(true);
      setActionError("");

      const skip = (actionPage - 1) * LIMIT;
      const { data } = await api.get("/actions/", {
        params: { skip, limit: LIMIT },
      });

      const items = Array.isArray(data) ? data : [];
      setActions(items);
      setHasMoreActions(items.length === LIMIT);
    } catch (err) {
      console.error("[HistoryPage] Action fetch error:", err);
      setActionError("Gagal mengambil riwayat aksi");
    } finally {
      setActionLoading(false);
    }
  }, [actionPage]);

  useEffect(() => { fetchScans(); }, [fetchScans]);
  useEffect(() => { fetchActions(); }, [fetchActions]);

  const scanTotalPages = Math.ceil(scanTotal / LIMIT);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-slate-800">Riwayat</h1>

        {/* TAB */}
        <div className="flex bg-white border rounded-2xl overflow-hidden shadow-sm">
          <TabButton
            active={tab === "scan"}
            onClick={() => setTab("scan")}
            icon={<ScanLine size={16} />}
            label="Scan"
            count={scanTotal}
          />
          <TabButton
            active={tab === "action"}
            onClick={() => setTab("action")}
            icon={<Zap size={16} />}
            label="Aksi"
          />
        </div>

        {/* SCAN TAB */}
        {tab === "scan" && (
          <>
            {scanError && <ErrorBanner message={scanError} />}

            {scanLoading ? (
              <SkeletonList count={5} />
            ) : scans.length === 0 ? (
              <EmptyState
                message="Belum ada riwayat scan"
                action="Scan sekarang"
                onAction={() => navigate("/scan")}
              />
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <ScanCard key={scan.id} scan={scan} />
                ))}
              </div>
            )}

            {/* PAGINATION SCAN */}
            {!scanLoading && scanTotalPages > 1 && (
              <Pagination
                page={scanPage}
                totalPages={scanTotalPages}
                onPrev={() => setScanPage((p) => Math.max(1, p - 1))}
                onNext={() => setScanPage((p) => Math.min(scanTotalPages, p + 1))}
              />
            )}
          </>
        )}

        {/* ACTION TAB */}
        {tab === "action" && (
          <>
            {actionError && <ErrorBanner message={actionError} />}

            {actionLoading ? (
              <SkeletonList count={5} />
            ) : actions.length === 0 ? (
              <EmptyState
                message="Belum ada riwayat aksi"
                action="Pilih aksi"
                onAction={() => navigate("/scan")}
              />
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            )}

            {/* PAGINATION ACTION */}
            {!actionLoading && (actionPage > 1 || hasMoreActions) && (
              <Pagination
                page={actionPage}
                totalPages={null}
                onPrev={() => setActionPage((p) => Math.max(1, p - 1))}
                onNext={() => setActionPage((p) => p + 1)}
                disableNext={!hasMoreActions}
              />
            )}
          </>
        )}

      </div>
    </section>
  );
};

// ======================================================
// SCAN CARD
// ======================================================

const ScanCard = ({ scan }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-slate-800 text-sm">
        {CATEGORY_LABEL[scan.result] ?? scan.result}
      </span>
      <span className="text-xs text-slate-400">
        {dayjs(scan.created_at).format("DD MMM YYYY, HH:mm")}
      </span>
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      {/* Confidence bar */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.round((scan.confidence ?? 0) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {Math.round((scan.confidence ?? 0) * 100)}%
        </span>
      </div>

      {/* Rekomendasi */}
      {scan.recommendation && (
        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full shrink-0">
          → {ACTION_LABEL[scan.recommendation] ?? scan.recommendation}
        </span>
      )}
    </div>

    {/* Not confident warning */}
    {scan.is_confident === false && (
      <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
        ⚠ Hasil kurang yakin, coba foto ulang dengan pencahayaan lebih baik
      </p>
    )}
  </div>
);

// ======================================================
// ACTION CARD
// ======================================================

const ActionCard = ({ action }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            ACTION_COLOR[action.action_type] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {ACTION_LABEL[action.action_type] ?? action.action_type}
        </span>

        {action.partner_name && (
          <span className="text-xs text-slate-500">
            @ {action.partner_name}
          </span>
        )}
      </div>

      <span className="text-xs font-medium text-green-600">
        +{action.points_earned ?? 0} poin
      </span>
    </div>

    {action.notes && (
      <p className="text-xs text-slate-500 italic">"{action.notes}"</p>
    )}

    <p className="text-xs text-slate-400">
      {dayjs(action.created_at).format("DD MMM YYYY, HH:mm")}
    </p>
  </div>
);

// ======================================================
// SUBCOMPONENTS
// ======================================================

const TabButton = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
      active
        ? "bg-green-600 text-white"
        : "text-slate-500 hover:bg-slate-50"
    }`}
  >
    {icon} {label}
    {count > 0 && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100"}`}>
        {count}
      </span>
    )}
  </button>
);

const Pagination = ({ page, totalPages, onPrev, onNext, disableNext = false }) => (
  <div className="flex justify-center gap-2">
    <button
      onClick={onPrev}
      disabled={page === 1}
      className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
    >
      ← Prev
    </button>
    <span className="px-4 py-2 text-sm text-gray-600">
      {totalPages ? `${page} / ${totalPages}` : `Hal. ${page}`}
    </span>
    <button
      onClick={onNext}
      disabled={disableNext || (totalPages && page >= totalPages)}
      className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
    >
      Next →
    </button>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm text-center">
    {message}
  </div>
);

const EmptyState = ({ message, action, onAction }) => (
  <div className="bg-white rounded-2xl border p-10 text-center space-y-3">
    <p className="text-slate-400 text-sm">{message}</p>
    <button
      onClick={onAction}
      className="text-sm text-green-600 font-medium hover:underline"
    >
      {action} →
    </button>
  </div>
);

const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-200 rounded w-64" />
      </div>
    ))}
  </div>
);

export default HistoryPage;