/**
 * pages/action/KomposPage.jsx
 * Halaman baru — aksi kompos untuk sampah organik.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Leaf } from "lucide-react";
import ActionSubmitLayout from "@/components/action/ActionSubmitLayout";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_LABEL } from "@/constants/wasteConstants";
import api from "@/lib/axios";

const KOMPOS_STEPS = [
  "Pisahkan sampah organik: sisa sayur, buah, dan daun kering. Hindari daging dan produk susu.",
  "Siapkan wadah kompos (ember tertutup, karung, atau lubang di tanah).",
  "Lapisi dasar dengan tanah atau sekam padi untuk memperlancar udara.",
  "Masukkan sampah organik lapis demi lapis, diselingi daun kering atau sekam.",
  "Aduk seminggu sekali dan jaga kelembaban. Kompos matang dalam 4–8 minggu.",
  "Kalau tidak punya ruang, setor ke mitra bank sampah yang menerima organik.",
];

const KomposPage = () => {
  const location     = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah organik";

  const [method, setMethod] = useState("mandiri"); // mandiri | mitra
  const [notes,  setNotes]  = useState("");

  const handleSubmitAction = async () => {
    const { data } = await api.post("/actions/", {
      action_type:   "kompos",
      route:         method,
      prediction_id: predictionId,
      notes:         notes.trim() || undefined,
    });
    return data;
  };

  const formContent = (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
          Metode Kompos
        </span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "mandiri", label: "Kompos Sendiri", desc: "Di rumah / kebun" },
            { val: "mitra",   label: "Setor ke Mitra", desc: "Via bank sampah" },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setMethod(opt.val)}
              className={`p-3 rounded-xl border text-left transition-all ${
                method === opt.val
                  ? "border-green-500 bg-green-50 ring-1 ring-green-300"
                  : "border-slate-200 hover:border-green-200"
              }`}
            >
              <p className="font-medium text-sm text-slate-800">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Catatan (opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="cth: Pakai komposter ember di balkon..."
          rows={2}
          maxLength={300}
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
      </label>
    </div>
  );

  return (
    <ActionSubmitLayout
      icon={Leaf}
      iconBg="bg-green-100"
      iconColor="text-green-600"
      accentColor="emerald"
      title="Buat Kompos"
      subtitle={`${wasteLabel} bisa jadi pupuk kaya nutrisi — bukan sekadar sampah.`}
      guideTitle="Cara Membuat Kompos di Rumah"
      guideDesc="Kompos adalah cara paling mudah mengolah sisa makanan. Tidak butuh alat khusus."
      guideSteps={KOMPOS_STEPS}
      formContent={formContent}
      formCTA="Lanjut → Upload Foto Bukti"
      onSubmitAction={handleSubmitAction}
      pendingTitle="Kompos Tercatat! 🌱"
      pendingDesc="Aksimu sedang diverifikasi. Poin akan ditambahkan setelah disetujui. Tetap jaga kompostermu!"
      proofLabel="Foto komposter, lubang kompos, atau sampah yang disetor ke mitra."
      isLoggedIn={isLoggedIn}
      predictionId={predictionId}
    />
  );
};

export default KomposPage;