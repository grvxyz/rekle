const ActionConfirmationCard = ({
  action,
  onConfirm,
  onChange,
}) => {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">
        Konfirmasi Aksi
      </h3>

      <p className="mt-2 text-slate-600">
        Kamu memilih <strong>{action.title}</strong>. Konfirmasi untuk klaim poin.
      </p>

      <p className="mt-2 text-emerald-600 font-semibold">
        +{action.points} poin
      </p>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onConfirm}
          className="
            px-5 py-2
            bg-emerald-600
            text-white
            rounded-xl
            hover:bg-emerald-700
            transition
          "
        >
          Konfirmasi Aksi
        </button>

        <button
          onClick={onChange}
          className="
            px-5 py-2
            border
            rounded-xl
            hover:bg-slate-100
            transition
          "
        >
          Ganti Aksi
        </button>
      </div>
    </div>
  );
};

export default ActionConfirmationCard;