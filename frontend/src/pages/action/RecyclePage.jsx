/**
 * pages/action/RecyclePage.jsx
 * Refactored dengan ActionSubmitLayout — konsisten dengan semua action page.
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Recycle } from "lucide-react";
import ActionSubmitLayout from "@/components/action/ActionSubmitLayout";
import { useAuth } from "@/context/AuthContext";
import {
  CATEGORY_LABEL,
  RECYCLE_INFO,
  DEFAULT_INFO,
} from "@/constants/wasteConstants";
import api from "@/lib/axios";

const RecyclePage = () => {
  const location     = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah";
  const info         = (result && RECYCLE_INFO[result]) ? RECYCLE_INFO[result] : DEFAULT_INFO;

  const [partnerName, setPartnerName] = useState("");
  const [notes,       setNotes]       = useState("");

  const handleSubmitAction = async () => {
    const { data } = await api.post("/actions/", {
      action_type:   "daur_ulang",
      route:         "mitra",
      prediction_id: predictionId,
      partner_name:  partnerName.trim() || undefined,
      notes:         notes.trim() || undefined,
    });
    return data;
  };

  const formContent = (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Disetor ke mana? (opsional)
        </span>
        <input
          type="text"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="cth: Bank Sampah Induk Jogja"
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Catatan tambahan (opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan detail aksimu..."
          rows={2}
          maxLength={300}
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
      </label>
    </div>
  );

  return (
    <ActionSubmitLayout
      icon={Recycle}
      iconBg="bg-emerald-100"
      iconColor="text-emerald-600"
      accentColor="emerald"
      title="Daur Ulang"
      subtitle={`Setor ${wasteLabel} ke fasilitas daur ulang dan tukar jadi nilai nyata.`}
      guideTitle="Cara Daur Ulang yang Benar"
      guideDesc={info.desc}
      guideSteps={info.steps}
      formContent={formContent}
      formCTA="Lanjut → Upload Foto Bukti"
      onSubmitAction={handleSubmitAction}
      pendingTitle="Daur Ulang Tercatat! ♻️"
      pendingDesc="Aksimu sedang diverifikasi. Poin akan ditambahkan setelah admin menyetujui. Terima kasih sudah mendaur ulang!"
      proofLabel={`Foto saat menyerahkan ${wasteLabel} ke fasilitas atau bank sampah.`}
      isLoggedIn={isLoggedIn}
      predictionId={predictionId}
    />
  );
};

export default RecyclePage;