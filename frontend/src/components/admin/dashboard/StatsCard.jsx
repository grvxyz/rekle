const StatsCard = ({ title, value }) => (
  <div className="bg-white shadow rounded-2xl p-5">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-3xl font-bold mt-2">
      {value.toLocaleString("id-ID")}
    </h2>
  </div>
);

export default StatsCard;