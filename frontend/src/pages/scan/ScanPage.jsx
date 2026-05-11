import { useRef, useState } from "react";
import UploadArea from "@/components/scan/UploadArea";
import ScanAnalyzing from "@/components/scan/ScanAnalyzing";
import ScanResult from "@/components/scan/ScanResult";

const ScanPage = () => {
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [step, setStep] = useState("upload");

  const handleFile = (file) => {
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImage(preview);
    setStep("upload");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = () => {
    setStep("analyzing");

    setTimeout(() => {
      setStep("result");
    }, 3000);
  };

  const resetScan = () => {
    setImage(null);
    setStep("upload");
  };

  return (
    <section className="py-18 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {step === "upload" && (
          <>
            <h1 className="text-3xl font-bold text-center mt-4">
              Unggah Gambar Sampahmu
            </h1>

            <p className="text-center text-slate-600 mt-2">
              Ambil foto atau unggah gambar sampah untuk diklasifikasikan AI
            </p>

            <UploadArea
              image={image}
              setImage={setImage}
              fileInputRef={fileInputRef}
              handleDrop={handleDrop}
              handleFile={handleFile}
              handleUploadClick={handleUploadClick}
              handleAnalyze={handleAnalyze}
            />
          </>
        )}

        {step === "analyzing" && (
          <ScanAnalyzing image={image} />
        )}

        {step === "result" && (
          <ScanResult
            image={image}
            resetScan={resetScan}
          />
        )}
      </div>
    </section>
  );
};

export default ScanPage;