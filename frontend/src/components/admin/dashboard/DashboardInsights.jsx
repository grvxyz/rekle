const DashboardInsights = ({ insights }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h2 className="font-semibold text-lg mb-4">Insight</h2>

      {insights.length > 0 ? (
        <div className="space-y-2">
          {insights.map((text, index) => (
            <p key={index} className="text-sm text-gray-700">
              • {text}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Belum ada insight</p>
      )}
    </div>
  );
};

export default DashboardInsights;