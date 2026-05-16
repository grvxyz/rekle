import { Upload, Camera, Trash2, Loader2 } from "lucide-react";

import Button from "@/components/ui/button";

const ScanTips = () => {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">

      <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <h4 className="font-semibold text-emerald-600">
          Cahaya Cukup
        </h4>

        <p className="text-sm text-slate-500 mt-2">
          Gunakan pencahayaan yang cukup
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <h4 className="font-semibold text-emerald-600">
          Fokus pada Objek
        </h4>

        <p className="text-sm text-slate-500 mt-2">
          Pastikan sampah berada di tengah
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <h4 className="font-semibold text-emerald-600">
          Satu Objek
        </h4>

        <p className="text-sm text-slate-500 mt-2">
          Unggah 1 jenis sampah dalam 1 waktu
        </p>
      </div>
    </div>
  );
};

const UploadArea = ({
  image,
  setImage,
  fileInputRef,
  cameraInputRef,

  handleDrop,
  handleFile,

  handleUploadClick,
  handleCameraClick,

  handleAnalyze,

  loading,
}) => {

  // =========================
  // HANDLE VALIDATION
  // =========================
  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Format file harus JPG, PNG, atau WebP");
      return false;
    }

    if (file.size > maxSize) {
      alert("Ukuran file maksimal 10MB");
      return false;
    }

    return true;
  };

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const onFileChange = (file) => {
    if (!validateFile(file)) return;

    handleFile(file);
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="
          mt-8
          p-8 md:p-10
          border-2 border-dashed border-slate-300
          rounded-3xl
          text-center
          bg-white
          hover:border-emerald-400
          transition
          shadow-sm
        "
      >

        {/* ========================= */}
        {/* IMAGE PREVIEW */}
        {/* ========================= */}
        {image ? (
          <div>

            <img
              src={image}
              alt="Preview"
              className="
                mx-auto
                w-full
                max-h-105
                object-cover
                rounded-2xl
              "
            />

            <div className="mt-6 flex flex-wrap justify-center gap-4">

              <Button
                onClick={handleUploadClick}
                variant="outline"
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />

                Ganti File
              </Button>

              <Button
                onClick={handleCameraClick}
                variant="outline"
                disabled={loading}
              >
                <Camera className="w-4 h-4 mr-2" />

                Gunakan Kamera
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                    Menganalisa...
                  </>
                ) : (
                  <>
                    Scan Sekarang
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                disabled={loading}
                onClick={() => setImage(null)}
              >
                <Trash2 className="w-4 h-4 mr-2" />

                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <>

            {/* ========================= */}
            {/* ICON */}
            {/* ========================= */}
            <div className="flex justify-center mb-5">

              <div className="p-6 rounded-full bg-emerald-100">
                <Upload className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            {/* ========================= */}
            {/* TEXT */}
            {/* ========================= */}
            <h3 className="text-2xl font-bold text-slate-800">
              Upload Gambar Sampah
            </h3>

            <p className="text-slate-500 mt-3">
              Seret gambar ke area ini atau pilih file
            </p>

            <p className="text-sm text-slate-400 mt-1">
              JPG, PNG, WebP • Maksimal 10MB
            </p>

            {/* ========================= */}
            {/* BUTTON */}
            {/* ========================= */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <Button
                onClick={handleUploadClick}
              >
                <Upload className="w-4 h-4 mr-2" />

                Pilih File
              </Button>

              <Button
                variant="outline"
                onClick={handleCameraClick}
              >
                <Camera className="w-4 h-4 mr-2" />

                Gunakan Kamera
              </Button>
            </div>
          </>
        )}

        {/* ========================= */}
        {/* FILE INPUT */}
        {/* ========================= */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) =>
            onFileChange(e.target.files[0])
          }
        />

        {/* ========================= */}
        {/* CAMERA INPUT */}
        {/* ========================= */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          className="hidden"
          onChange={(e) =>
            onFileChange(e.target.files[0])
          }
        />
      </div>

      <ScanTips />
    </>
  );
};

export default UploadArea;