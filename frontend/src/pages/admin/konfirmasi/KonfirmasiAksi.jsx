import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

import ActionCard from "@/components/admin/konfirmasi/ActionCard";
import SkeletonCards from "@/components/admin/konfirmasi/SkeletonCards";

const KonfirmasiAksi = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk Modal
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, actionId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/actions/pending");

      if (Array.isArray(data)) setActions(data);
      else if (Array.isArray(data.actions)) setActions(data.actions);
      else setActions([]);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Silakan login terlebih dahulu");
      } else if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data aksi");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Fungsi untuk membuka modal
  const openModal = (type, actionId) => {
    setModalConfig({ isOpen: true, type, actionId });
    setRejectReason(""); // Reset alasan tiap kali modal dibuka
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    if (isProcessing) return; // Cegah tutup saat loading
    setModalConfig({ isOpen: false, type: null, actionId: null });
    setRejectReason("");
  };

  // Eksekusi API Berdasarkan Tipe Modal
  const handleProcessAction = async () => {
    const { type, actionId } = modalConfig;

    if (type === "reject" && !rejectReason.trim()) {
      alert("Alasan penolakan tidak boleh kosong.");
      return;
    }

    try {
      setIsProcessing(true);
      
      const payload = type === "approve" 
        ? { status: "approved" } 
        : { status: "rejected", rejection_reason: rejectReason.trim() };

      await api.patch(`/actions/${actionId}/verify`, payload);
      
      // Hapus item dari list setelah berhasil
      setActions((prev) => prev.filter((a) => a.id !== actionId));
      closeModal();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(detail || `Gagal ${type === "approve" ? "menyetujui" : "menolak"} aksi`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Konfirmasi Aksi
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Tinjau dan verifikasi aktivitas pengguna yang menunggu persetujuan.
          </p>
        </div>
        
        {/* Badge Info */}
        {!loading && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 font-semibold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {actions.length} Menunggu Konfirmasi
          </div>
        )}
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* CONTENT LIST */}
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
          <p className="text-sm text-gray-500">Tidak ada aksi pengguna yang menunggu konfirmasi saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onConfirm={() => openModal("approve", action.id)}
              onReject={() => openModal("reject", action.id)}
              isLoading={false} // Loading per item dikontrol oleh skeleton, action processing pindah ke modal
            />
          ))}
        </div>
      )}

      {/* MODAL OVERLAY */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Header Modal */}
            <div className={`p-6 border-b border-gray-100 flex items-center gap-4 ${modalConfig.type === 'approve' ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${modalConfig.type === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {modalConfig.type === 'approve' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalConfig.type === 'approve' ? "Setujui Aksi?" : "Tolak Aksi?"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {modalConfig.type === 'approve' 
                    ? "Pastikan bukti yang diunggah valid." 
                    : "Aksi yang ditolak tidak akan mendapatkan poin."}
                </p>
              </div>
            </div>

            {/* Body Modal (Input Alasan Penolakan) */}
            {modalConfig.type === 'reject' && (
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

            {/* Footer Modal (Buttons) */}
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
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
                  ${modalConfig.type === 'approve' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30' 
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </>
                ) : (
                  modalConfig.type === 'approve' ? "Ya, Setujui" : "Tolak Aksi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KonfirmasiAksi;