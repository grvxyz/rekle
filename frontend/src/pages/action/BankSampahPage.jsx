import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Phone, Globe, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";

const CATEGORY_LABEL = {
  organik: "Sampah Organik", plastik_pet: "Plastik PET", plastik_hdpe: "Plastik HDPE",
  plastik_campuran: "Plastik Campuran", kertas_bersih: "Kertas Bersih",
  kertas_kotor: "Kertas Kotor", kaca_utuh: "Kaca Utuh", kaca_pecah: "Kaca Pecah",
};

// ======================================================
// BANK SAMPAH PAGE
// ======================================================

const BankSampahPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : null;

  const [mitras, setMitras]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [notes, setNotes]                 = useState("");
  const [logLoading, setLogLoading]       = useState(false);
  const [logError, setLogError]           = useState("");
  const [success, setSuccess]             = useState(false);

  useEffect(() => {
    const fetchMitras = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = result
          ? await api.get(`/mitra/by-waste/${result}`)
          : await api.get("/mitra/data");
        setMitras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[BankSampahPage] Fetch error:", err);
        setError("Gagal mengambil data mitra");
      } finally {
        setLoading(false);
      }
    };
    fetchMitras();
  }, [result]);

  const handleLog = async () => {
    if (!selectedMitra) return;
    try {
      setLogLoading(true);
      setLogError("");
      await api.post("/actions/", {
        action_type:   "bank_sampah",
        route:         "mitra",           // ✅ WAJIB — ini jalur mitra
        prediction_id: predictionId ?? undefined,
        partner_name:  selectedMitra.name,
        notes:         notes.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      console.error("[BankSampahPage] Log action error:", err);
      setLogError(err.response?.data?.detail || "Gagal mencatat aksi");
    } finally {
      setLogLoading(false);
    }
  };

  if (success) return (
    <PendingBanner
      mitraName={selectedMitra?.name}
      onHome={() => navigate("/dashboard")}
      onHistory={() => navigate("/history")}
    />
  );

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Bank Sampah Mitra</h1>
          <p className="text-slate-500 text-sm">
            {wasteLabel ? `Mitra yang menerima ${wasteLabel}` : "Semua mitra daur ulang aktif"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm text-center">{error}</div>
        )}

        {loading ? (
          <SkeletonMitras />
        ) : mitras.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-slate-400 text-sm">
            Belum ada mitra yang tersedia untuk jenis sampah ini.
          </div>
        ) : (
          <div className="space-y-3">
            {mitras.map((mitra) => (
              <MitraCard
                key={mitra.id}
                mitra={mitra}
                selected={selectedMitra?.id === mitra.id}
                onSelect={() => setSelectedMitra((prev) => prev?.id === mitra.id ? null : mitra)}
              />
            ))}
          </div>
        )}

        {/* LOG FORM */}
        {selectedMitra && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h2 className="font-semibold text-slate-700">
              Setor ke <span className="text-blue-600">{selectedMitra.name}</span>?
            </h2>
            <p className="text-sm text-slate-500">
              Catat aksimu — poin diberikan setelah diverifikasi admin.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan... (opsional)"
              rows={2}
              maxLength={300}
              className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {logError && <p className="text-sm text-red-500">{logError}</p>}
            <button
              onClick={handleLog}
              disabled={logLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {logLoading ? "Menyimpan..." : "✓ Catat Setor Sampah"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ======================================================
// MITRA CARD
// ======================================================

const MitraCard = ({ mitra, selected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
      selected ? "border-blue-500 shadow-md ring-1 ring-blue-300" : "border-slate-200 hover:shadow-sm hover:border-blue-200"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1 flex-1">
        <h3 className="font-semibold text-slate-800">{mitra.name}</h3>
        {mitra.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{mitra.description}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {mitra.address && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} />{mitra.city ? `${mitra.city} — ` : ""}{mitra.address}
            </span>
          )}
          {mitra.phone && (
            <a href={`tel:${mitra.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Phone size={12} />{mitra.phone}
            </a>
          )}
          {mitra.website && (
            <a href={mitra.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Globe size={12} />Website
            </a>
          )}
        </div>

        {mitra.accepted_waste && (
          <div className="flex flex-wrap gap-1 pt-1">
            {mitra.accepted_waste.split(",").map((w) => (
              <span key={w.trim()} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {CATEGORY_LABEL[w.trim()] ?? w.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
      {selected && <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
    </div>
  </div>
);

// ======================================================
// PENDING BANNER
// Jalur mitra → poin + saldo diberikan setelah admin approve
// ======================================================

const PendingBanner = ({ mitraName, onHome, onHistory }) => (
  <section className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
      <Clock className="w-16 h-16 text-amber-400 mx-auto" />
      <h2 className="text-2xl font-bold text-slate-800">Aksi Tercatat!</h2>
      <p className="text-slate-500 text-sm leading-relaxed">
        Setoran ke <span className="font-semibold text-slate-700">{mitraName}</span> sedang menunggu
        verifikasi admin. Poin dan saldo akan ditambahkan setelah disetujui.
      </p>
      <div className="flex gap-3 pt-2">
        <button onClick={onHistory} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Lihat Riwayat</button>
        <button onClick={onHome} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">Ke Dashboard</button>
      </div>
    </div>
  </section>
);

const SkeletonMitras = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border p-5 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-72" />
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
    ))}
  </div>
);

export default BankSampahPage;