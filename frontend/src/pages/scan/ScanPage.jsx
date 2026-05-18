import { useRef, useState, useEffect } from "react";
import api from "@/lib/axios";

import UploadArea from "@/components/scan/UploadArea";
import ScanAnalyzing from "@/components/scan/ScanAnalyzing";
import ScanResult from "@/components/scan/ScanResult";

// ======================================================
// SCAN PAGE
// ======================================================

const ScanPage = () => {

  // ── REFS ──────────────────────────────────────────────
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  // ── STATE ─────────────────────────────────────────────
  const [image, setImage]           = useState(null);   // object URL untuk preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep]             = useState("upload"); // "upload" | "analyzing" | "result"
  const [scanResult, setScanResult] = useState(null);
  const [error, setError]           = useState("");

  // ── CLEANUP object URL saat unmount atau ganti gambar ─
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  // ======================================================
  // HANDLE FILE
  // ======================================================

  const handleFile = (file) => {
    if (!file) return;

    // Revoke URL lama sebelum buat yang baru
    if (image) URL.revokeObjectURL(image);

    setImage(URL.createObjectURL(file));
    setSelectedFile(file);
    setError("");
    setStep("upload");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleCameraClick = () => cameraInputRef.current?.click();

  // ======================================================
  // ANALYZE IMAGE
  // ======================================================

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Silakan pilih gambar terlebih dahulu");
      return;
    }

    // Pindah ke step analyzing hanya setelah validasi lokal passed
    setError("");
    setStep("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Pakai axios instance — token & refresh otomatis ditangani interceptor
      const { data } = await api.post("/scan/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setScanResult(data);
      setStep("result");

    } catch (err) {
      console.error("[ScanPage] Analyze error:", err);

      const message =
        err.response?.data?.detail ||
        err.message ||
        "Gagal scan gambar";

      setError(message);
      setStep("upload");
    }
  };

  // ======================================================
  // RESET
  // ======================================================

  const resetScan = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setSelectedFile(null);
    setScanResult(null);
    setError("");
    setStep("upload");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <>
            <h1 className="text-4xl font-bold text-center text-slate-800">
              Scan Sampah AI
            </h1>

            <p className="text-center text-slate-600 mt-3">
              Ambil foto atau unggah gambar sampah untuk diklasifikasikan AI
            </p>

            {error && (
              <div className="mt-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-center text-sm">
                {error}
              </div>
            )}

            <UploadArea
              image={image}
              setImage={setImage}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              handleDrop={handleDrop}
              handleFile={handleFile}
              handleUploadClick={handleUploadClick}
              handleCameraClick={handleCameraClick}
              handleAnalyze={handleAnalyze}
            />
          </>
        )}

        {/* ANALYZING STEP */}
        {step === "analyzing" && (
          <ScanAnalyzing image={image} />
        )}

        {/* RESULT STEP */}
        {step === "result" && (
          <ScanResult
            image={image}
            result={scanResult}
            resetScan={resetScan}
          />
        )}

      </div>
    </section>
  );
};

export default ScanPage;