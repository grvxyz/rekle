import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, MapPin } from "lucide-react";
import ActionCard from "../../components/action/ActionCard";
import ActionConfirmationCard from "../../components/action/ActionConfirmationCard";

const ActionPage = () => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState(null);

  const actions = [
    {
      title: "Daur Ulang",
      desc: "Ubah sampah menjadi sesuatu yang bermanfaat dan bernilai.",
      icon: Recycle,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
      path: "/dashboard",
      points: 60,
    },
    {
      title: "Bank Sampah Mitra",
      desc: "Temukan lokasi bank sampah terdekat untuk setor sampah.",
      icon: MapPin,
      bg: "bg-blue-100",
      color: "text-blue-600",
      path: "/dashboard ",
      points: 75,
    },
  ];

  const handleConfirm = () => {
    if (!selectedAction) return;

    setPoints((prev) => prev + selectedAction.points);

    navigate(selectedAction.path);
  };

  const [points, setPoints] = useState(0);

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-16 mt-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-slate-600">Total Poin Kamu</p>
          <h2 className="text-2xl font-bold text-emerald-600">
            {points} poin
          </h2>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800">
            Pilih Aksi Selanjutnya
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Bagaimana kamu ingin menangani{" "}
            <span className="font-semibold text-slate-700">
              Majalah
            </span>
            ?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {actions.map((item, index) => (
            <ActionCard
              key={index}
              item={item}
              onSelect={() => setSelectedAction(item)}
            />
          ))}
        </div>

        {selectedAction && (
          <div className="mt-8">
            <ActionConfirmationCard
              action={selectedAction}
              onConfirm={handleConfirm}
              onChange={() => setSelectedAction(null)}
            />
          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-10">
          Pilih salah satu aksi untuk melanjutkan
        </p>
      </div>
    </section>
  );
};

export default ActionPage;