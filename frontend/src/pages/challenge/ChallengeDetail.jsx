/**
 * ChallengeDetail.jsx
 *
 * Halaman detail satu challenge.
 * - Menampilkan info lengkap: judul, deskripsi, tipe, target, reward
 * - Form untuk submit aksi (POST /actions/) dengan proof image opsional
 * - Poin otomatis dihitung dari reward_points challenge
 *
 * Route: /challenge/:id
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams }       from "react-router-dom";

import api from "../../lib/axios.js";

// ── helpers ───────────────────────────────────────────────────────────────────
const TYPE_META = {
  scan:   { label: "Scan Sampah", icon: "📷", hint: "Challenge ini diselesaikan dengan melakukan scan sampah di aplikasi." },
  action: { label: "Aksi Nyata",  icon: "♻️", hint: "Lakukan aksi pengelolaan sampah (kompos, daur ulang, dll) dan lampirkan bukti." },
  points: { label: "Kumpul Poin", icon: "⭐", hint: "Kumpulkan poin dari berbagai aktivitas untuk menyelesaikan challenge ini." },
};

const ACTION_TYPES = [
  { value: "kompos",      label: "Kompos" },
  { value: "daur_ulang",  label: "Daur Ulang" },
  { value: "eco_brick",   label: "Eco Brick" },
  { value: "reuse",       label: "Reuse / Pakai Ulang" },
  { value: "khusus",      label: "Lainnya" },
];

const ROUTES = [
  { value: "mandiri", label: "Mandiri (saya kelola sendiri)" },
  { value: "mitra",   label: "Mitra (lewat mitra daur ulang)" },
];

// ── komponen utama ────────────────────────────────────────────────────────────
export default function ChallengeDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  // data
  const [challenge, setChallenge]   = useState(null);
  const [user, setUser]             = useState(null);
  const [predictions, setPredictions] = useState([]);   // untuk dropdown prediction_id
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  // form
  const [form, setForm] = useState({
    prediction_id: "",
    action_type:   "",
    route:         "mandiri",
    partner_name:  "",
    notes:         "",
  });
  const [proofFile, setProofFile]   = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const fileRef = useRef(null);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null); // { success, message, points }
  const [error, setError]           = useState(null);

  // ── fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: userData }, { data: contents }] = await Promise.all([
          api.get("/users/me"),
          api.get("/content?type=challenge"),
        ]);
        setUser(userData);

        const found = contents.find((c) => String(c.id) === String(id));
        if (!found) { setNotFound(true); return; }
        setChallenge(found);

        // Set default action_type sesuai challenge_type
        const defaultType =
          found.challenge_type === "scan"   ? "khusus" :
          found.challenge_type === "action" ? "daur_ulang" : "khusus";

        setForm((f) => ({ ...f, action_type: defaultType }));

        // Fetch riwayat scan user untuk dropdown prediction_id
        try {
          const { data: scanData } = await api.get("/predictions/history");
          const items = scanData?.items ?? scanData ?? [];
          setPredictions(items.slice(0, 20));
        } catch { /* tidak wajib */ }

      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── proof image ─────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.action_type) { setError("Pilih tipe aksi terlebih dahulu."); return; }
    if (!form.route)        { setError("Pilih jalur pengelolaan."); return; }
    if (form.route === "mitra" && !form.partner_name.trim()) {
      setError("Nama mitra wajib diisi jika memilih jalur mitra.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. POST /actions/ — prediction_id opsional
      const payload = {
        action_type:  form.action_type,
        route:        form.route,
        notes:        form.notes.trim() || `Challenge: ${challenge.title}`,
        ...(form.prediction_id ? { prediction_id: parseInt(form.prediction_id) } : { prediction_id: null }),
        ...(form.route === "mitra" ? { partner_name: form.partner_name.trim() } : {}),
      };

      // Jika prediction_id kosong, backend mungkin tidak terima null —
      // fallback: kirim tanpa field tsb
      if (!payload.prediction_id) delete payload.prediction_id;

      const { data: actionData } = await api.post("/actions/", payload);
      const actionId = actionData?.id ?? actionData?.action?.id;

      // 2. Upload proof jika ada
      if (proofFile && actionId) {
        try {
          const fd = new FormData();
          fd.append("file", proofFile);
          await api.post(`/actions/${actionId}/proof`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (proofErr) {
          console.warn("Upload bukti gagal (action tetap tersimpan):", proofErr);
        }
      }

      const pointsEarned =
        actionData?.points_earned ??
        actionData?.action?.points_earned ??
        challenge.reward_points ??
        0;

      setResult({
        success: true,
        actionId,
        points: pointsEarned,
      });

    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Gagal mengirim aksi. Coba lagi.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ── states ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400 animate-pulse">Memuat detail challenge...</p>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <p className="text-gray-500">Challenge tidak ditemukan.</p>
      <button onClick={() => navigate("/challenge")} className="text-green-600 text-sm underline">
        ← Kembali ke daftar challenge
      </button>
    </div>
  );

  // ── success state ────────────────────────────────────────────────────────────
  if (result?.success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Aksi Berhasil Dikirim!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Aksimu sudah masuk dan menunggu verifikasi admin.
          Kamu akan mendapatkan poin setelah disetujui.
        </p>

        {/* Reward preview */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 inline-block w-full">
          <p className="text-xs text-amber-600 font-medium mb-1">Potensi Poin</p>
          <p className="text-3xl font-black text-amber-600">+{result.points}</p>
          <p className="text-xs text-amber-500 mt-0.5">setelah diverifikasi admin</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/challenge")}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Lihat Challenge Lain
          </button>
          <button
            onClick={() => navigate("/history")}
            className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Lihat Riwayat Aksi
          </button>
        </div>
      </div>
    </div>
  );

  // ── main render ──────────────────────────────────────────────────────────────
  const typeMeta = TYPE_META[challenge.challenge_type] ?? { label: challenge.challenge_type, icon: "🏆", hint: "" };
  const isDone   = challenge.completed;
  const progress = challenge.current ?? 0;
  const target   = challenge.target  ?? null;
  const pct      = target ? Math.min(100, Math.round((progress / target) * 100)) : null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-16">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back */}
        <button
          onClick={() => navigate("/challenge")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span>←</span> Kembali ke Challenge
        </button>

        {/* ── Card Info Challenge ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />

          <div className="p-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full border
                ${challenge.challenge_type === "scan"   ? "bg-blue-50 text-blue-700 border-blue-200" :
                  challenge.challenge_type === "action" ? "bg-green-50 text-green-700 border-green-200" :
                  "bg-yellow-50 text-yellow-700 border-yellow-200"}
              `}>
                {typeMeta.icon} {typeMeta.label}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                challenge.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}>
                {challenge.status === "active" ? "● Aktif" : challenge.status}
              </span>
              {isDone && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  ✓ Selesai
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h1>

            {challenge.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{challenge.description}</p>
            )}

            {/* Hint tipe */}
            {typeMeta.hint && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 mb-5">
                ℹ️ {typeMeta.hint}
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-xs text-amber-500 font-medium mb-1">Reward Poin</p>
                <p className="text-2xl font-black text-amber-600">⭐ {challenge.reward_points ?? 0}</p>
              </div>
              {target && (
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-blue-500 font-medium mb-1">Target</p>
                  <p className="text-2xl font-black text-blue-600">{target}</p>
                  <p className="text-xs text-blue-400">{typeMeta.label}</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {pct !== null && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress kamu</span>
                  <span className="font-semibold">{progress} / {target} ({pct}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Form Aksi ── */}
        {isDone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-emerald-700 font-semibold text-lg mb-1">🎊 Challenge Selesai!</p>
            <p className="text-emerald-600 text-sm">Kamu sudah menyelesaikan challenge ini. Cek challenge lain!</p>
          </div>
        ) : challenge.status !== "active" ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">Challenge ini sedang tidak aktif.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900">📝 Laporkan Aksimu</h2>
            <p className="text-xs text-gray-500 -mt-3">
              Isi form berikut untuk melaporkan aksi yang sudah kamu lakukan. Admin akan memverifikasi dan memberikan poin.
            </p>

            {/* Tipe Aksi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tipe Aksi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ACTION_TYPES.map((at) => (
                  <button
                    key={at.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, action_type: at.value }))}
                    className={`
                      text-xs font-medium px-3 py-2 rounded-lg border text-left transition-all
                      ${form.action_type === at.value
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-400"}
                    `}
                  >
                    {at.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jalur */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Jalur Pengelolaan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ROUTES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, route: r.value }))}
                    className={`
                      text-xs font-medium px-3 py-2.5 rounded-lg border text-left transition-all
                      ${form.route === r.value
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-400"}
                    `}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Mitra (kondisional) */}
            {form.route === "mitra" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Mitra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.partner_name}
                  onChange={(e) => setForm((f) => ({ ...f, partner_name: e.target.value }))}
                  placeholder="Nama mitra / drop point"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            )}

            {/* Scan terkait (opsional) */}
            {predictions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Scan Terkait <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <select
                  value={form.prediction_id}
                  onChange={(e) => setForm((f) => ({ ...f, prediction_id: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">-- Pilih hasil scan --</option>
                  {predictions.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.result ?? "Tidak diketahui"} ({new Date(p.created_at).toLocaleDateString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Catatan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ceritakan apa yang kamu lakukan..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Upload Bukti */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Foto Bukti <span className="text-gray-400 font-normal">(opsional tapi disarankan)</span>
              </label>

              {proofPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={proofPreview} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setProofFile(null); setProofPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-green-400 transition-colors"
                >
                  <p className="text-2xl mb-1">📸</p>
                  <p className="text-xs text-gray-500">Klik untuk upload foto bukti</p>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* Reward preview */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-amber-600">Potensi reward setelah verifikasi</span>
              <span className="text-lg font-black text-amber-600">⭐ +{challenge.reward_points ?? 0}</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`
                w-full py-3.5 rounded-xl font-bold text-sm transition-all
                ${submitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"}
              `}
            >
              {submitting ? "Mengirim..." : "Kirim Aksi & Klaim Poin →"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}