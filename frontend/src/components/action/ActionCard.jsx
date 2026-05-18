import { ChevronRight } from "lucide-react";

const ActionCard = ({ item, onSelect }) => {
  const Icon = item.icon;

  return (
    <div
      onClick={onSelect}
      className="
        bg-white border rounded-2xl p-6
        cursor-pointer
        hover:shadow-lg
        hover:-translate-y-1
        transition
        text-center
      "
    >
      <div
        className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-5 mx-auto`}
      >
        <Icon className={`w-7 h-7 ${item.color}`} />
      </div>

      <h3 className="text-xl font-semibold text-slate-800">
        {item.title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {item.desc}
      </p>

      <p className="mt-3 text-emerald-600 font-semibold">
        +{item.points} poin
      </p>

      <div className="mt-6 flex items-center text-emerald-600 font-medium">
        Pilih Aksi
        <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default ActionCard;