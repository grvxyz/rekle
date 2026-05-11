import { LoaderCircle, CheckCircle2 } from "lucide-react";

const ScanAnalyzing = ({ image }) => {
  return (
    <div className="flex flex-col items-center py-20">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-xl text-center">
        
        <img
          src={image}
          alt="Preview"
          className="mx-auto h-60 rounded-xl object-cover"
        />

        <LoaderCircle className="w-12 h-12 text-emerald-600 animate-spin mx-auto mt-8" />

        <h2 className="text-2xl font-bold mt-6">
          AI sedang menganalisis...
        </h2>

        <p className="text-slate-500 mt-2">
          Model CNN sedang memproses gambar Anda
        </p>

        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left space-y-3">
        <p className="text-sm text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Gambar berhasil diunggah
        </p>

        <p className="text-sm text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Menjalankan klasifikasi CNN
        </p>

        <p className="text-sm text-slate-600 flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" />
            Menyiapkan hasil...
        </p>
        </div>
      </div>
    </div>
  );
};

export default ScanAnalyzing;