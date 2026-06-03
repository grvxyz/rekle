/**
 * ChallengeDetail.jsx — Mobile-first responsive version
 *
 * Perubahan dari versi original:
 * - Safe area inset untuk iPhone notch/home bar (env(safe-area-inset-*))
 * - Bottom sheet sticky untuk tombol submit di mobile
 * - Touch target minimal 44px untuk semua interactive element
 * - Font size minimal 16px pada input agar tidak auto-zoom di iOS
 * - Padding horizontal adaptif (px-4 mobile → px-6 tablet)
 * - Stack layout di mobile, grid di tablet+
 * - Progress bar lebih tebal agar mudah dibaca
 * - Card badge wrap dengan gap yang lebih rapi
 * - Sticky bottom action bar dengan blur backdrop
 * - Textarea resize hanya vertikal (resize-y) agar tidak keluar viewport
 * - Select native untuk mobile (lebih accessible dari custom dropdown)
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams }       from "react-router-dom";
import { calculateChallengeProgress }   from "@/utils/challengeProgress";
import api                              from "../../lib/axios.js";

const TYPE_META = {
  scan:   { label: "Scan Sampah", icon: "📷", hint: "Challenge ini diselesaikan dengan melakukan scan sampah di aplikasi." },
  action: { label: "Aksi Nyata",  icon: "♻️", hint: "Lakukan aksi pengelolaan sampah (kompos, daur ulang, dll) dan lampirkan bukti." },
  points: { label: "Kumpul Poin", icon: "⭐", hint: "Kumpulkan poin dari berbagai aktivitas untuk menyelesaikan challenge ini." },
};

const ACTION_TYPES = [
  { value: "kompos",     label: "Kompos",           icon: "🌱" },
  { value: "daur_ulang", label: "Daur Ulang",        icon: "♻️" },
  { value: "eco_brick",  label: "Eco Brick",         icon: "🧱" },
  { value: "reuse",      label: "Reuse/Pakai Ulang", icon: "🔄" },
  { value: "khusus",     label: "Lainnya",            icon: "📦" },
];

const ROUTES = [
  { value: "mandiri", label: "Mandiri",  desc: "Saya kelola sendiri",     icon: "🏠" },
  { value: "mitra",   label: "Mitra",    desc: "Lewat mitra daur ulang",  icon: "🤝" },
];

/* ─── Loading Skeleton ─────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-safe-top pb-safe-bottom"
         style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))" }}>
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded-full" />
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-gray-200 rounded-lg" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-20 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-11 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function ChallengeDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge]       = useState(null);
  const [user, setUser]                 = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [predictions, setPredictions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);

  const [form, setForm] = useState({
    prediction_id: "",
    action_type:   "",
    route:         "mandiri",
    partner_name:  "",
    notes:         "",
  });

  const [proofFile, setProofFile]       = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const fileRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

  /* ── fetch ── */
  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: userData }, { data: contents }] = await Promise.all([
          api.get("/users/me"),
          api.get("/content?type=challenge"),
        ]);
        setUser(userData);

        const contentList = Array.isArray(contents)
          ? contents
          : contents.items ?? contents.data ?? [];

        const found = contentList.find((c) => String(c.id) === String(id));
        if (!found) { setNotFound(true); return; }
        setChallenge(found);

        const defaultType =
          found.challenge_type === "scan"   ? "khusus"     :
          found.challenge_type === "action" ? "daur_ulang" : "khusus";
        setForm((f) => ({ ...f, action_type: defaultType }));

        try {
          const { data: actData } = await api.get("/actions/activity?limit=200");
          const items = Array.isArray(actData) ? actData : actData?.items ?? [];
          setActivityData(items);
          setPredictions(items.filter((item) => item.type === "scan"));
        } catch { /* opsional */ }

      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ── file handler ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  /* ── submit ── */
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
      const payload = {
        action_type: form.action_type,
        route:       form.route,
        notes:       form.notes.trim() || `Challenge: ${challenge.title}`,
        ...(form.prediction_id ? { prediction_id: parseInt(form.prediction_id, 10) } : {}),
        ...(form.route === "mitra" ? { partner_name: form.partner_name.trim() } : {}),
      };

      const { data: actionData } = await api.post("/actions/", payload);
      const actionId = actionData?.id ?? actionData?.action?.id;

      if (proofFile && actionId) {
        try {
          const fd = new FormData();
          fd.append("file", proofFile);
          await api.post(`/actions/${actionId}/proof`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (proofErr) {
          console.warn("Upload bukti gagal:", proofErr);
        }
      }

      const pointsEarned =
        actionData?.points_earned ??
        actionData?.action?.points_earned ??
        challenge.reward_points ?? 0;

      setResult({ success: true, actionId, points: pointsEarned });

    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg =
        typeof detail === "string" ? detail :
        Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") :
        err?.response?.data?.message ?? "Gagal mengirim aksi. Coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── states ── */
  if (loading) return <Skeleton />;

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-6"
         style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="text-5xl">🔍</div>
      <p className="text-gray-600 font-medium text-center">Challenge tidak ditemukan.</p>
      <button
        onClick={() => navigate("/challenge")}
        className="min-h-[44px] px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl"
      >
        ← Kembali ke daftar challenge
      </button>
    </div>
  );

  if (result?.success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4"
         style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Aksi Berhasil Dikirim!</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Aksimu sudah masuk dan menunggu verifikasi admin.
          Kamu akan mendapatkan poin setelah disetujui.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="text-xs text-amber-600 font-medium mb-1">Potensi Poin</p>
          <p className="text-4xl font-black text-amber-600">+{result.points}</p>
          <p className="text-xs text-amber-500 mt-1">setelah diverifikasi admin</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/challenge")}
            className="min-h-[48px] w-full bg-green-600 text-white font-semibold py-3 rounded-xl text-sm"
          >
            Lihat Challenge Lain
          </button>
          <button
            onClick={() => navigate("/history")}
            className="min-h-[44px] w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
          >
            Lihat Riwayat Aksi
          </button>
        </div>
      </div>
    </div>
  );

  /* ── derived ── */
  const typeMeta = TYPE_META[challenge.challenge_type] ?? { label: challenge.challenge_type, icon: "🏆", hint: "" };
  const isDone   = challenge.completed;
  const progress = calculateChallengeProgress(activityData, challenge);
  const target   = challenge.target ?? null;
  const pct      = target ? Math.min(100, Math.round((progress / target) * 100)) : null;
  const isActive = challenge.status === "active";
  const showForm = !isDone && isActive;

  /* ── main ── */
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingTop:    "env(safe-area-inset-top)",
        /* reserve space for sticky bottom bar when form visible */
        paddingBottom: showForm ? "calc(80px + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-8 space-y-4">

        {/* ── Back ── */}
        <button
          onClick={() => navigate("/challenge")}
          className="flex items-center gap-1.5 text-sm text-gray-500 active:text-gray-800 min-h-[44px]"
        >
          <span className="text-base">←</span>
          <span>Challenge</span>
        </button>

        {/* ── Info Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* accent bar */}
          <div className={`h-1.5 ${
            challenge.challenge_type === "scan"   ? "bg-gradient-to-r from-blue-400 to-blue-500" :
            challenge.challenge_type === "action" ? "bg-gradient-to-r from-green-400 to-emerald-500" :
            "bg-gradient-to-r from-amber-400 to-yellow-400"
          }`} />

          <div className="p-5 sm:p-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`
                inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border
                ${challenge.challenge_type === "scan"   ? "bg-blue-50 text-blue-700 border-blue-200" :
                  challenge.challenge_type === "action" ? "bg-green-50 text-green-700 border-green-200" :
                  "bg-yellow-50 text-yellow-700 border-yellow-200"}
              `}>
                <span>{typeMeta.icon}</span> {typeMeta.label}
              </span>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                challenge.status === "active"   ? "bg-emerald-100 text-emerald-700" :
                challenge.status === "inactive" ? "bg-gray-100 text-gray-500" :
                "bg-orange-100 text-orange-600"
              }`}>
                {challenge.status === "active" ? "● Aktif" :
                 challenge.status === "inactive" ? "Nonaktif" : "Draft"}
              </span>

              {isDone && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  ✓ Selesai
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
              {challenge.title}
            </h1>

            {challenge.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{challenge.description}</p>
            )}

            {typeMeta.hint && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-500 mb-4 flex gap-2">
                <span className="shrink-0">ℹ️</span>
                <span>{typeMeta.hint}</span>
              </div>
            )}

            {/* Stats — stack on mobile, side-by-side on sm+ */}
            <div className={`grid gap-3 mb-4 ${target !== null ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="bg-amber-50 rounded-xl p-3.5 text-center">
                <p className="text-xs text-amber-500 font-medium mb-0.5">Reward Poin</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-600">
                  ⭐ {challenge.reward_points ?? 0}
                </p>
              </div>
              {target !== null && (
                <div className="bg-blue-50 rounded-xl p-3.5 text-center">
                  <p className="text-xs text-blue-500 font-medium mb-0.5">Target</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-600">{target}</p>
                  <p className="text-xs text-blue-400">{typeMeta.label}</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {pct !== null && (
              <div>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                  <span>Progress kamu</span>
                  <span className="font-semibold tabular-nums">
                    {progress} / {target}
                    <span className="text-green-600 ml-1">({pct}%)</span>
                  </span>
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

        {/* ── State Blocks / Form ── */}
        {isDone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-emerald-700 font-semibold text-lg mb-1">🎊 Challenge Selesai!</p>
            <p className="text-emerald-600 text-sm">
              Kamu sudah menyelesaikan challenge ini. Cek challenge lain!
            </p>
          </div>

        ) : !isActive ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">
              {challenge.status === "draft"
                ? "Challenge ini masih dalam draft dan belum dapat diikuti."
                : "Challenge ini sedang tidak aktif."}
            </p>
          </div>

        ) : (
          /* ── Form Aksi ── */
          <form
            id="action-form"
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-0.5">📝 Laporkan Aksimu</h2>
              <p className="text-xs text-gray-500">
                Isi form berikut untuk melaporkan aksi yang sudah kamu lakukan.
              </p>
            </div>

            {/* ── Tipe Aksi ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Tipe Aksi <span className="text-red-500">*</span>
              </label>
              {/* 2-col grid on all sizes — enough for emoji + short label */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ACTION_TYPES.map((at) => (
                  <button
                    key={at.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, action_type: at.value }))}
                    className={`
                      min-h-[52px] flex items-center gap-2 text-xs font-medium px-3 py-2.5 rounded-xl border transition-all text-left
                      ${form.action_type === at.value
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 active:bg-gray-50"}
                    `}
                  >
                    <span className="text-base leading-none">{at.icon}</span>
                    <span className="leading-tight">{at.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Jalur ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Jalur Pengelolaan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROUTES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, route: r.value }))}
                    className={`
                      min-h-[56px] flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-xl border transition-all
                      ${form.route === r.value
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 active:bg-gray-50"}
                    `}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{r.label}</span>
                    <span className={`text-[10px] leading-tight ${form.route === r.value ? "text-green-100" : "text-gray-400"}`}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Nama Mitra ── */}
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
                  /* font-size 16px mencegah auto-zoom di iOS */
                  className="w-full text-base border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[48px]"
                  style={{ fontSize: "16px" }}
                />
              </div>
            )}

            {/* ── Scan Terkait ── */}
            {predictions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Scan Terkait{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                {/* Native select — best UX on mobile */}
                <div className="relative">
                  <select
                    value={form.prediction_id}
                    onChange={(e) => setForm((f) => ({ ...f, prediction_id: e.target.value }))}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[48px]"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">-- Pilih hasil scan --</option>
                    {predictions.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} — {p.title ?? "Tidak diketahui"} ({new Date(p.created_at).toLocaleDateString("id-ID")})
                      </option>
                    ))}
                  </select>
                  {/* custom caret */}
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                </div>
              </div>
            )}

            {/* ── Catatan ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Catatan{" "}
                <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ceritakan apa yang kamu lakukan..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* ── Upload Bukti ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Foto Bukti{" "}
                <span className="text-gray-400 font-normal">(opsional, tapi disarankan)</span>
              </label>

              {proofPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={proofPreview}
                    alt="Preview bukti"
                    className="w-full object-cover"
                    style={{ maxHeight: "220px" }}
                  />
                  <button
                    type="button"
                    onClick={() => { setProofFile(null); setProofPreview(null); }}
                    /* 44px touch target */
                    className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <span className="bg-red-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                      ✕
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-7 text-center active:border-green-400 active:bg-green-50 transition-colors min-h-[100px]"
                >
                  <p className="text-3xl mb-1">📸</p>
                  <p className="text-xs text-gray-500 font-medium">Ketuk untuk upload foto bukti</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, HEIC</p>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"          /* buka kamera langsung di mobile */
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Reward preview — visible in form on desktop; hidden on mobile (shown in sticky bar) */}
            <div className="hidden sm:flex bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 items-center justify-between">
              <span className="text-xs text-amber-600">Potensi reward setelah verifikasi</span>
              <span className="text-lg font-black text-amber-600">⭐ +{challenge.reward_points ?? 0}</span>
            </div>

            {/* Desktop submit button — hidden on mobile (sticky bar used instead) */}
            <button
              type="submit"
              disabled={submitting}
              className={`
                hidden sm:block w-full py-3.5 rounded-xl font-bold text-sm transition-all
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

      {/* ── Sticky Bottom Bar (mobile only, form only) ── */}
      {showForm && (
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 pt-3 z-50"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            {/* Points pill */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1 shrink-0">
              <span className="text-xs text-amber-500">+</span>
              <span className="text-sm font-black text-amber-600">{challenge.reward_points ?? 0}</span>
              <span className="text-xs text-amber-500">poin</span>
            </div>

            {/* Submit triggers the form via form="action-form" */}
            <button
              type="submit"
              form="action-form"
              disabled={submitting}
              className={`
                flex-1 min-h-[48px] rounded-xl font-bold text-sm transition-all
                ${submitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white active:bg-green-700 active:scale-[0.98]"}
              `}
            >
              {submitting ? "Mengirim..." : "Kirim Aksi →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}