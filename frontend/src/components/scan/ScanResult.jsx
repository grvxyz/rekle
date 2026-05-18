import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import {
  Recycle,
  Palette,
  BookOpen,
  MapPin,
  Brain,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const ScanResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data hasil scan dari ScanAnalyzing via navigate state
  const result = location.state?.result;

  // Jika tidak ada data (misal akses langsung URL), redirect ke scan
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-slate-500">Tidak ada hasil scan.</p>
        <Button onClick={() => navigate("/scan")}>Kembali ke Scan</Button>
      </div>
    );
  }

  // =========================
  // FORMAT PERCENT
  // =========================
  const confidencePercent = result?.confidence
    ? (result.confidence * 100).toFixed(2)
    : 0;

  // =========================
  // CATEGORY COLOR
  // =========================
  const getCategoryColor = (label) => {
    const lower = label?.toLowerCase() || "";
    if (lower.includes("plastik"))  return "bg-blue-100 text-blue-700";
    if (lower.includes("kertas"))   return "bg-yellow-100 text-yellow-700";
    if (lower.includes("logam"))    return "bg-slate-200 text-slate-700";
    if (lower.includes("organik"))  return "bg-emerald-100 text-emerald-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="space-y-8 mt-4">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <Recycle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Klasifikasi Selesai!</h1>
        <p className="text-slate-500 mt-3">AI berhasil menganalisis gambar sampah Anda</p>
      </div>

      {/* ========================= */}
      {/* MAIN CONTENT */}
      {/* ========================= */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* IMAGE */}
        {result?.image_path && (
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
            <img
              src={`http://127.0.0.1:8000/${result.image_path}`}
              alt="Result"
              className="w-full h-105 object-cover"
            />
          </div>
        )}

        {/* RESULT CARD */}
        <div className="bg-white border rounded-3xl p-6 space-y-6 shadow-sm">

          {/* CATEGORY */}
          <div>
            <p className="text-sm text-slate-500">Kategori Sampah</p>
            <div className={`inline-block mt-2 px-4 py-2 rounded-xl font-semibold ${getCategoryColor(result?.result)}`}>
              {result?.result || "-"}
            </div>
          </div>

          {/* HASIL DETEKSI */}
          <div>
            <p className="text-sm text-slate-500">Hasil Deteksi</p>
            <h2 className="text-3xl font-bold mt-1">{result?.result}</h2>
          </div>

          {/* CONFIDENCE */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Confidence Score</span>
              <span className="font-bold text-emerald-600">{confidencePercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>

          {/* AI STATUS */}
          <div className="pt-5 border-t">
            <div className="grid grid-cols-2 gap-5">

              <div>
                <p className="text-sm text-slate-500">Status AI</p>
                <div className="flex items-center gap-2 mt-1">
                  {result?.is_confident ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-600">Akurat</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-600">Kurang Yakin</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">AI Model</p>
                <div className="flex items-center gap-2 mt-1">
                  <Brain className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold">MobileNetV2</span>
                </div>
              </div>
            </div>

            <div className="mt-5 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
              ✓ Klasifikasi berhasil diproses oleh AI dengan tingkat akurasi {confidencePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* RECOMMENDATION */}
      {/* ========================= */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm">
        <h3 className="text-2xl font-bold mb-3">Rekomendasi AI</h3>
        <p className="text-slate-600 leading-relaxed">
          {result?.recommendation || "Tidak ada rekomendasi"}
        </p>
      </div>

      {/* ========================= */}
      {/* ALL SCORES */}
      {/* ========================= */}
      {result?.all_scores && Object.keys(result.all_scores).length > 0 && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">Semua Prediksi AI</h3>
          <div className="space-y-5">
            {Object.entries(result.all_scores)
              .sort(([, a], [, b]) => b - a)
              .map(([label, score]) => {
                const percent = (score * 100).toFixed(2);
                const isTop = label === result.result;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className={`capitalize font-medium ${isTop ? "text-emerald-600" : ""}`}>
                        {label} {isTop && "✓"}
                      </span>
                      <span className={`font-semibold ${isTop ? "text-emerald-600" : ""}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isTop ? "bg-emerald-500" : "bg-blue-400"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* AKSI */}
      {/* ========================= */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm">
        <h3 className="text-2xl font-bold mb-2">Aksi yang Bisa Dilakukan</h3>
        <p className="text-sm text-slate-500 mb-6">
          Pilih tindakan lanjutan untuk mengelola sampah ini.
        </p>
        <div className="grid md:grid-cols-3 gap-4">

          <div className="border rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-lg">Bank Sampah</h4>
            <p className="text-sm text-slate-500 mt-2">Temukan lokasi mitra pengelolaan sampah.</p>
          </div>

          <div className="border rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-lg">Reuse / Craft</h4>
            <p className="text-sm text-slate-500 mt-2">Jadikan sampah menjadi barang kreatif dan berguna.</p>
          </div>

          <div className="border rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-lg">Pelajari Dampak</h4>
            <p className="text-sm text-slate-500 mt-2">Pelajari manfaat pemilahan sampah.</p>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* BUTTONS */}
      {/* ========================= */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate("/action", { state: { scanResult: result } })}
        >
          Lanjutkan ke Aksi
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/scan")}
        >
          Scan Lagi
        </Button>
      </div>
    </div>
  );
};

export default ScanResult;