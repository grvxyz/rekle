import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

import UploadArea from "@/components/scan/UploadArea";
import ScanAnalyzing from "@/components/scan/ScanAnalyzing";
import ScanResult from "@/components/scan/ScanResult";

const ScanPage = () => {
  const navigate = useNavigate();

  // Cek login dari sessionStorage langsung (tanpa context agar tidak circular)
  const isLoggedIn = !!sessionStorage.getItem("access_token");

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const [image, setImage]               = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep]                 = useState("upload");
  const [scanResult, setScanResult]     = useState(null);
  const [error, setError]               = useState("");

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFile = (file) => {
    if (!file) return;
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

  const handleAnalyze = async () => {
    // Guest tetap bisa scan — login hanya diperlukan saat klaim poin
    if (!selectedFile) {
      setError("Silakan pilih gambar terlebih dahulu");
      return;
    }

    setError("");
    setStep("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Guest pakai endpoint tanpa auth, user login pakai endpoint yang simpan ke DB & kasih poin
      const endpoint = isLoggedIn ? "/scan/upload" : "/scan/upload-guest";
      const { data } = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setScanResult(data);
      setStep("result");

    } catch (err) {
      console.error("[ScanPage] Analyze error:", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Gagal scan gambar"
      );
      setStep("upload");
    }
  };

  const resetScan = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setSelectedFile(null);
    setScanResult(null);
    setError("");
    setStep("upload");
  };

  return (
    <section className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">

        {step === "upload" && (
          <>
            <h1 className="text-4xl font-bold text-center text-slate-800">
              Scan Sampah AI
            </h1>
            <p className="text-center text-slate-600 mt-3">
              Ambil foto atau unggah gambar sampah untuk diklasifikasikan AI
            </p>

            {/* Info ringan untuk guest — tidak memblokir */}
            {!isLoggedIn && (
              <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-4 rounded-2xl text-center text-sm">
                <p className="font-semibold mb-1">Scan gratis tanpa login!</p>
                <p>
                  Kamu bisa scan sekarang.{" "}
                  <button
                    onClick={() => navigate("/login", { state: { from: "/scan" } })}
                    className="underline font-semibold"
                  >
                    Login
                  </button>
                  {" "}atau{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="underline font-semibold"
                  >
                    daftar
                  </button>
                  {" "}untuk mendapatkan poin dari hasil scan.
                </p>
              </div>
            )}

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

        {step === "analyzing" && <ScanAnalyzing imagePreview={image} />}

        {step === "result" && (
          <ScanResult
            image={image}
            result={scanResult}
            resetScan={resetScan}
            isGuest={!isLoggedIn}
          />
        )}

      </div>
    </section>
  );
};

export default ScanPage;