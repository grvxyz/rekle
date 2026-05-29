import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/axios";

import ActionCard from "@/components/admin/konfirmasi/ActionCard";
import ActionDetailModal from "@/components/admin/konfirmasi/ActionDetailModal";
import SkeletonCards from "@/components/admin/konfirmasi/SkeletonCards";

// ─── Interval auto-refresh (ms) ──────────────────────────────
const REFRESH_INTERVAL = 15_000; // 15 detik

const KonfirmasiAksi = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auto-refresh state
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Modal konfirmasi (approve/reject)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, actionId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal detail aksi
  const [detailAction, setDetailAction] = useState(null);

  // ─── Fetch data ──────────────────────────────────────────
  const fetchActions = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      setError("");
      const { data } = await api.get("/actions/pending");

      if (Array.isArray(data)) setActions(data);
      else if (Array.isArray(data.actions)) setActions(data.actions);
      else setActions([]);

      setLastRefreshed(new Date());
    } catch (err) {
      // 401 sudah ditangani interceptor (auto-refresh / force logout)
      // hanya tampilkan error jika bukan silent refresh
      if (!silent) {
        if (err.response?.status === 403) setError("Akses ditolak — halaman ini khusus admin.");
        else if (err.response?.status >= 500) setError("Server error, coba beberapa saat lagi.");
        else if (err.code === "ERR_NETWORK") setError("Tidak dapat terhubung ke server.");
        else if (err.response?.status !== 401) setError("Gagal mengambil data aksi.");
        // 401 → diam saja, interceptor sudah redirect ke /login
      }
    } finally {
      if (!silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  // ─── Auto-refresh setup ───────────────────────────────────
  const resetCountdown = useCallback(() => {
    setCountdown(REFRESH_INTERVAL / 1000);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);
  }, []);

  useEffect(() => {
    fetchActions();

    // Setup auto-refresh interval
    intervalRef.current = setInterval(() => {
      fetchActions(true); // silent refresh
      resetCountdown();
    }, REFRESH_INTERVAL);

    resetCountdown();

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchActions, resetCountdown]);

  // Manual refresh
  const handleManualRefresh = () => {
    fetchActions(true);
    resetCountdown();
  };

  // ─── Modal konfirmasi ─────────────────────────────────────
  const openModal = (type, actionId) => {
    setModalConfig({ isOpen: true, type, actionId });
    setRejectReason("");
  };

  const closeModal = () => {
    if (isProcessing) return;
    setModalConfig({ isOpen: false, type: null, actionId: null });
    setRejectReason("");
  };

  const handleProcessAction = async () => {
    const { type, actionId } = modalConfig;

    if (type === "reject" && !rejectReason.trim()) {
      alert("Alasan penolakan tidak boleh kosong.");
      return;
    }

    try {
      setIsProcessing(true);
      const payload =
        type === "approve"
          ? { status: "approved" }
          : { status: "rejected", rejection_reason: rejectReason.trim() };

      await api.patch(`/actions/${actionId}/verify`, payload);

      // Hapus dari list setelah berhasil
      setActions((prev) => prev.filter((a) => a.id !== actionId));

      // Tutup juga modal detail jika sedang terbuka untuk action yang sama
      if (detailAction?.id === actionId) setDetailAction(null);

      closeModal();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(detail || `Gagal ${type === "approve" ? "menyetujui" : "menolak"} aksi`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Buka modal detail dari dalam modal konfirmasi ────────
  const openConfirmFromDetail = (type) => {
    if (!detailAction) return;
    openModal(type, detailAction.id);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ─── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Konfirmasi Aksi
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Tinjau dan verifikasi aktivitas pengguna yang menunggu persetujuan.
          </p>
        </div>

        {/* Kanan: badge count + auto-refresh indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          {!loading && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {actions.length} Menunggu
            </div>
          )}

          {/* Auto-refresh info */}
          <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-4 py-2 rounded-full border border-slate-100 text-sm font-medium">
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memperbarui...
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Refresh dalam {countdown}dtk
              </>
            )}
            <button
              onClick={handleManualRefresh}
              className="ml-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Refresh sekarang"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* Timestamp terakhir refresh */}
      {lastRefreshed && (
        <p className="text-[11px] text-gray-400 -mt-3">
          Terakhir diperbarui: {lastRefreshed.toLocaleTimeString("id-ID")}
        </p>
      )}

      {/* ─── ERROR ──────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* ─── CONTENT ─────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCards count={5} />
        </div>
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Semua aksi sudah tertinjau</h3>
          <p className="text-sm text-gray-500">
            Tidak ada aksi yang menunggu konfirmasi saat ini.
          </p>
          <button
            onClick={handleManualRefresh}
            className="mt-4 text-sm text-emerald-600 font-semibold hover:underline"
          >
            ↺ Cek lagi sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onConfirm={() => openModal("approve", action.id)}
              onReject={() => openModal("reject", action.id)}
              onViewDetail={(a) => setDetailAction(a)}
              isLoading={isProcessing && modalConfig.actionId === action.id}
            />
          ))}
        </div>
      )}

      {/* ─── MODAL DETAIL ─────────────────────────────── */}
      {detailAction && (
        <ActionDetailModal
          action={detailAction}
          onClose={() => setDetailAction(null)}
          onConfirm={() => { openConfirmFromDetail("approve"); }}
          onReject={() => { openConfirmFromDetail("reject"); }}
        />
      )}

      {/* ─── MODAL KONFIRMASI/TOLAK ────────────────────── */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className={`p-6 border-b border-gray-100 flex items-center gap-4 ${
              modalConfig.type === "approve" ? "bg-emerald-50/50" : "bg-red-50/50"
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                modalConfig.type === "approve"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}>
                {modalConfig.type === "approve" ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalConfig.type === "approve" ? "Setujui Aksi?" : "Tolak Aksi?"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {modalConfig.type === "approve"
                    ? "Pastikan bukti yang diunggah valid dan sesuai."
                    : "Aksi yang ditolak tidak akan mendapatkan poin."}
                </p>
              </div>
            </div>

            {/* Body: input alasan tolak */}
            {modalConfig.type === "reject" && (
              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Foto buram atau sampah tidak sesuai kategori..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50/50"
                  autoFocus
                />
              </div>
            )}

            {/* Footer */}
            <div className="p-6 pt-2 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessAction}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 ${
                  modalConfig.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </>
                ) : modalConfig.type === "approve" ? "Ya, Setujui" : "Tolak Aksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonfirmasiAksi;