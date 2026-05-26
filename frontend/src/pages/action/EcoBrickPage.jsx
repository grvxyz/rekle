/**
 * pages/action/EcoBrickPage.jsx
 * Halaman baru — aksi eco brick untuk plastik campuran.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Package } from "lucide-react";
import ActionSubmitLayout from "@/components/action/ActionSubmitLayout";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_LABEL } from "@/constants/wasteConstants";
import api from "@/lib/axios";

const ECOBRICK_STEPS = [
  "Cuci dan keringkan semua plastik — lembab bikin bata cepat berjamur.",
  "Potong kecil-kecil agar lebih mudah dipadatkan.",
  "Siapkan botol plastik bersih ukuran 600 ml atau 1,5 L.",
  "Masukkan plastik sedikit demi sedikit, padatkan dengan tongkat bambu atau kayu.",
  "Terus isi sampai botol padat keras — minimal 200 gram per botol 600 ml.",
  "Tutup rapat dan timbang. Eco brick siap diserahkan ke komunitas atau mitra.",
];

const EcoBrickPage = () => {
  const location     = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "plastik campuran";

  const [bottleCount, setBottleCount] = useState("");
  const [notes,       setNotes]       = useState("");

  const handleSubmitAction = async () => {
    const notesText = [
      bottleCount ? `${bottleCount} botol eco brick` : "",
      notes.trim(),
    ].filter(Boolean).join(" — ");

    const { data } = await api.post("/actions/", {
      action_type:   "eco_brick",
      route:         "mandiri",
      prediction_id: predictionId,
      notes:         notesText || undefined,
    });
    return data;
  };

  const formContent = (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Berapa botol eco brick yang dibuat?
        </span>
        <input
          type="number"
          min="1"
          max="999"
          value={bottleCount}
          onChange={(e) => setBottleCount(e.target.value)}
          placeholder="cth: 3"
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Catatan (opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="cth: Akan diserahkan ke komunitas eco brick RT..."
          rows={2}
          maxLength={300}
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </label>

      {/* Info tambahan */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-orange-700">
        💡 Satu botol 600 ml padat = sekitar 200 gram plastik terselamatkan dari TPA.
      </div>
    </div>
  );

  return (
    <ActionSubmitLayout
      icon={Package}
      iconBg="bg-orange-100"
      iconColor="text-orange-600"
      accentColor="orange"
      title="Eco Brick"
      subtitle={`${wasteLabel} yang tidak bisa didaur ulang biasa punya tempat di eco brick.`}
      guideTitle="Cara Buat Eco Brick yang Benar"
      guideDesc="Eco brick adalah botol plastik yang dipadatkan penuh plastik bersih — jadi material bangunan alternatif."
      guideSteps={ECOBRICK_STEPS}
      formContent={formContent}
      formCTA="Lanjut → Upload Foto Bukti"
      onSubmitAction={handleSubmitAction}
      pendingTitle="Eco Brick Tercatat! 🧱"
      pendingDesc="Aksimu sedang diverifikasi. Poin akan ditambahkan setelah disetujui. Terus padatkan botol berikutnya!"
      proofLabel="Foto botol eco brick yang sudah penuh dan padat."
      isLoggedIn={isLoggedIn}
      predictionId={predictionId}
    />
  );
};

export default EcoBrickPage;