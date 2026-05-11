import Button from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Recycle,
  Palette,
  BookOpen,
  MapPin,
} from "lucide-react";

const ScanResult = ({ image, resetScan }) => {
const navigate = useNavigate();
  return (
    <div className="space-y-8 mt-4">

      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Klasifikasi Selesai!
        </h1>

        <p className="text-slate-500 mt-2">
          AI telah menganalisis sampah Anda
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white border rounded-2xl overflow-hidden">
          <img
            src={image}
            alt="Result"
            className="w-full h-80 object-cover"
          />
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-sm text-slate-500">
              Kategori
            </p>

            <div className="inline-block mt-2 px-4 py-2 rounded-xl bg-yellow-100 text-yellow-700 font-semibold">
              Sampah Kertas
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Item Terdeteksi
            </p>

            <h2 className="text-2xl font-bold">
              Majalah
            </h2>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">
                Confidence Score
              </span>

              <span className="font-bold text-yellow-600">
                97%
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-yellow-500 h-3 rounded-full w-[97%]" />
            </div>
          </div>

        <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-6">

            <div>
            <p className="text-sm text-slate-500">
                Waktu Proses
            </p>
            <p className="text-lg font-semibold mt-1">
                2.3 detik
            </p>
            </div>

            <div>
            <p className="text-sm text-slate-500">
                Model AI
            </p>
            <p className="text-lg font-semibold mt-1">
                CNN v2.4
            </p>
            </div>

        </div>

        <div className="mt-4 px-3 py-2 rounded-lg bg-emerald-50 text-sm text-emerald-700">
            ✓ Klasifikasi berhasil dengan akurasi tinggi
        </div>
        </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-1">
            Aksi yang Bisa Dilakukan
        </h3>

        <p className="text-sm text-slate-500 mb-6">
            Berikut beberapa pilihan tindakan yang dapat Anda lakukan.
        </p>

        <div className="grid md:grid-cols-3 gap-4">

            <div className="border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
            </div>

            <h4 className="font-semibold">
                Bank Sampah
            </h4>

            <p className="text-sm text-slate-500 mt-1">
                Temukan lokasi mitra bank sampah terdekat.
            </p>
            </div>


            <div className="border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Palette className="w-5 h-5 text-blue-600" />
            </div>

            <h4 className="font-semibold">
                Reuse / Craft
            </h4>

            <p className="text-sm text-slate-500 mt-1">
                Ubah sampah menjadi barang yang berguna.
            </p>
            </div>


            <div className="border rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-amber-600" />
            </div>

            <h4 className="font-semibold">
                Pelajari Dampak
            </h4>

            <p className="text-sm text-slate-500 mt-1">
                Ketahui manfaat memilah sampah dengan benar.
            </p>
            </div>

        </div>
      </div>

      <div className="flex gap-4">
        <Button
        className="flex-1 bg-emerald-600"
        onClick={() => navigate("/action")}
        >
        Lanjutkan ke Aksi
        </Button>

        <Button
          variant="outline"
          onClick={resetScan}
        >
          Scan Lagi
        </Button>
      </div>
    </div>
  );
};

export default ScanResult;