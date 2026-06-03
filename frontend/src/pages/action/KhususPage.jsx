/**
 * pages/action/KhususPage.jsx
 * Halaman baru — penanganan khusus untuk kaca pecah dan sampah berbahaya.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import ActionSubmitLayout from "@/components/action/ActionSubmitLayout";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_LABEL } from "@/constants/wasteConstants";
import api from "@/lib/axios";

const KHUSUS_STEPS = [
  "Gunakan sarung tangan tebal sebelum menyentuh sampah berbahaya.",
  "Bungkus sampah berlapis dengan koran tebal atau kardus.",
  "Rekatkan rapat dengan lakban — jangan ada bagian yang terbuka.",
  "Tulis label yang jelas: 'KACA PECAH', 'BERBAHAYA', atau jenis sampah di luar bungkusan.",
  "Hubungi dinas kebersihan kota atau mitra khusus untuk penjemputan.",
  "Jangan campurkan dengan sampah plastik atau kertas biasa.",
];

const KhususPage = () => {
  const location     = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah khusus";

  const [handlerName, setHandlerName] = useState("");
  const [notes,       setNotes]       = useState("");

  const handleSubmitAction = async () => {
    const { data } = await api.post("/actions/", {
      action_type:   "khusus",
      route:         handlerName.trim() ? "mitra" : "mandiri",
      prediction_id: predictionId,
      partner_name:  handlerName.trim() || undefined,
      notes:         notes.trim() || undefined,
    });
    return data;
  };

  const formContent = (
    <div className="space-y-4">
      {/* Warning box */}
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">
          Pastikan kamu sudah membungkus sampah ini dengan aman sebelum mencatat aksi.
          Keselamatan kamu dan petugas adalah prioritas.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Diserahkan ke (opsional)
        </span>
        <input
          type="text"
          value={handlerName}
          onChange={(e) => setHandlerName(e.target.value)}
          placeholder="cth: Dinas Kebersihan Kota Yogyakarta"
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Catatan penanganan (opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="cth: Sudah dibungkus berlapis dan diberikan label..."
          rows={2}
          maxLength={300}
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />
      </label>
    </div>
  );

  return (
    <ActionSubmitLayout
      icon={AlertTriangle}
      iconBg="bg-red-100"
      iconColor="text-red-500"
      accentColor="red"
      title="Penanganan Khusus"
      subtitle={`${wasteLabel} butuh perlakuan ekstra — jangan asal buang.`}
      guideTitle="Prosedur Penanganan Aman"
      guideDesc="Sampah jenis ini berbahaya jika tidak ditangani dengan benar. Ikuti langkah ini sebelum membuang."
      guideSteps={KHUSUS_STEPS}
      formContent={formContent}
      formCTA="Lanjut → Upload Foto Bukti"
      onSubmitAction={handleSubmitAction}
      pendingTitle="Penanganan Khusus Tercatat! ⚠️"
      pendingDesc="Aksimu sedang diverifikasi. Poin akan ditambahkan setelah admin menyetujui. Terima kasih sudah menangani sampah berbahaya dengan benar."
      proofLabel="Foto sampah yang sudah dibungkus rapat dengan label yang jelas."
      isLoggedIn={isLoggedIn}
      predictionId={predictionId}
    />
  );
};

export default KhususPage;