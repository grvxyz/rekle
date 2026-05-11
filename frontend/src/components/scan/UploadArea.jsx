import { Upload } from "lucide-react";
import Button from "@/components/ui/button";

const ScanTips = () => {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
      <div className="bg-white p-4 rounded-xl border">
        <h4 className="font-semibold text-emerald-600">
          Cahaya Cukup
        </h4>
        <p className="text-sm text-slate-500">
          Gunakan pencahayaan yang cukup
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border">
        <h4 className="font-semibold text-emerald-600">
          Fokus pada Objek
        </h4>
        <p className="text-sm text-slate-500">
          Pastikan sampah berada di tengah
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border">
        <h4 className="font-semibold text-emerald-600">
          Satu Objek
        </h4>
        <p className="text-sm text-slate-500">
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
  handleDrop,
  handleFile,
  handleUploadClick,
  handleAnalyze,
}) => {
  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="
          mt-8 p-10 border-2 border-dashed border-slate-300
          rounded-2xl text-center bg-white
          hover:border-emerald-400 transition
        "
      >
        {image ? (
          <img
            src={image}
            alt="Preview"
            className="mx-auto max-h-64 rounded-xl"
          />
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-5 rounded-full bg-emerald-100">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <p className="text-slate-500 font-medium">
              Seret gambarmu ke sini
            </p>

            <p className="text-sm text-slate-400 mt-1">
              atau klik tombol di bawah untuk mengunggah
            </p>
          </>
        )}

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button onClick={handleUploadClick}>
            Pilih File
          </Button>

          <Button variant="outline">
            Gunakan Kamera
          </Button>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />

        <p className="text-sm text-slate-400 mt-4">
          Format yang didukung: JPG, PNG, WebP (maks. 10MB)
        </p>

        <div className="mt-4 flex justify-center gap-3 flex-wrap">
        <Button
            className="bg-emerald-600"
            onClick={handleAnalyze}
            disabled={!image}
        >
            Scan Sekarang
        </Button>

        {image && (
            <Button
            variant="destructive"
            onClick={() => setImage(null)}
            >
            Hapus Foto
            </Button>
        )}
        </div>
      </div>

      <ScanTips />
    </>
  );
};

export default UploadArea;