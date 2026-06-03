/**
 * pages/action/ReusePage.jsx
 *
 * Fix:
 * - Pakai prediction_id dari location.state (bukan null)
 * - Field ID backend adalah data.id (bukan data.action_id)
 * - Dua step: form → proof upload → done
 * - Error handling proper + loading states
 * - Konsisten dengan pattern ActionSubmitLayout
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import ActionSubmitLayout from "@/components/action/ActionSubmitLayout";
import { useAuth } from "@/context/AuthContext";
import {
  CATEGORY_LABEL,
  REUSE_TIPS,
  DEFAULT_TIPS,
} from "@/constants/wasteConstants";
import api from "@/lib/axios";

const ReusePage = () => {
  const location     = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampahmu";

  const tips = result && REUSE_TIPS[result] ? REUSE_TIPS[result] : DEFAULT_TIPS;

  const [notes, setNotes] = useState("");

  const handleSubmitAction = async () => {
    const { data } = await api.post("/actions/", {
      action_type:   "reuse",
      route:         "mandiri",
      prediction_id: predictionId,
      notes:         notes.trim() || undefined,
    });
    return data; // { id, ... }
  };

  const formContent = (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Ceritakan hasil reuse-mu (opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="cth: Botol kaca jadi vas bunga di meja belajar..."
          rows={3}
          maxLength={400}
          className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <span className="text-xs text-slate-400 text-right block mt-1">
          {notes.length}/400
        </span>
      </label>
    </div>
  );

  return (
    <ActionSubmitLayout
      icon={Sparkles}
      iconBg="bg-amber-100"
      iconColor="text-amber-600"
      accentColor="amber"
      title="Reuse / Kerajinan"
      subtitle={`Pakai ulang ${wasteLabel} — kreatif, gratis, dan berdampak nyata.`}
      guideTitle="Tips Reuse"
      guideDesc="Sebelum dibuang, coba pikirkan: bisa dipakai lagi untuk apa?"
      guideSteps={tips}
      formContent={formContent}
      formCTA="Lanjut → Upload Foto Bukti"
      onSubmitAction={handleSubmitAction}
      pendingTitle="Reuse Tercatat! 🎨"
      pendingDesc="Aksimu sedang diverifikasi admin. Poin akan ditambahkan otomatis setelah disetujui. Terus berkreasi!"
      proofLabel={`Foto hasil reuse ${wasteLabel}-mu sebagai bukti aksi.`}
      isLoggedIn={isLoggedIn}
      predictionId={predictionId}
    />
  );
};

export default ReusePage;