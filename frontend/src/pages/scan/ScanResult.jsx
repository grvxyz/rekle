import React from "react";
import { useNavigate } from "react-router-dom"; // Gunakan navigasi internal react-router
import { 
  CheckCircleIcon, 
  ArrowPathIcon, 
  MapPinIcon, 
  TrophyIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

const ScanResult = ({ image, result, resetScan }) => {
  const navigate = useNavigate(); // Inisialisasi hook navigasi

  // ─── AMAN: Membaca 'category' ATAU 'result' dari payload FastAPI ───
  const rawCategory = result?.category || result?.result || "Tidak Teridentifikasi";
  
  // Memformat teks: mengganti underscore (_) dengan spasi untuk tampilan UI
  const category = typeof rawCategory === "string" ? rawCategory.replace("_", " ") : "Tidak Teridentifikasi";

  // Ekstraksi dan pengamanan properti lainnya
  const confidence = result?.confidence ? Math.round(result.confidence * 100) : 0;
  const description = result?.description || "Informasi detail mengenai jenis material ini sedang dimuat.";
  const points = result?.points_earned || 0;
  const isRecyclable = result?.is_recyclable ?? true;
  const tips = result?.tips || ["Pastikan sampah dalam keadaan kering", "Bersihkan dari sisa makanan"];

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden mt-6 animate-in fade-in zoom-in duration-500">
      
      {/* HEADER: STATUS DAUR ULANG */}
      <div className={`p-6 text-white flex items-center gap-4 ${isRecyclable ? "bg-emerald-500" : "bg-rose-500"}`}>
        <div className="p-2 bg-white/20 rounded-full">
          {isRecyclable ? (
            <CheckCircleIcon className="w-8 h-8" />
          ) : (
            <ExclamationTriangleIcon className="w-8 h-8" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold leading-none">
            {isRecyclable ? "Layak Daur Ulang" : "Residu / Sulit Daur Ulang"}
          </h2>
          <p className="text-white/80 text-xs mt-1">Identifikasi AI REKLE v1.0</p>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: VISUAL */}
        <div className="space-y-6">
          <div className="relative group">
            {/* FIX: Menggunakan bracket standar Tailwind [4/3] agar rasio aspek terbaca browser */}
            <div className="aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-50 shadow-inner">
              <img 
                src={image} 
                alt="Hasil Scan" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Confidence</p>
                <p className="text-sm font-black text-indigo-600 leading-none">{confidence}%</p>
              </div>
            </div>
          </div>

          {/* KARTU HADIAH */}
          {isRecyclable && (
            /* FIX: Menggunakan bg-gradient-to-br standar agar efek gradasi muncul */
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <TrophyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-indigo-400 uppercase">Potensi Reward</p>
                <p className="text-xl font-black text-indigo-900">{points} Poin</p>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: INFORMASI */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Kategori Sampah</h3>
              <h4 className="text-4xl font-black text-slate-800 capitalize tracking-tight">
                {category}
              </h4>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Analisis Material</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* TIPS PENANGANAN */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase">Instruksi Penanganan:</h5>
              <div className="grid grid-cols-1 gap-2">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {isRecyclable && (
              <button
                onClick={() => navigate("/action")} // Sinkron dengan rute publik /action di App.jsx Anda
                className="bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                <MapPinIcon className="w-5 h-5" />
                Setor Sampah
              </button>
            )}
            <button
              onClick={resetScan}
              className={`px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isRecyclable 
                  ? "bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600" 
                  : "w-full bg-slate-900 hover:bg-black text-white col-span-2"
              }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
              Coba Lagi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScanResult;