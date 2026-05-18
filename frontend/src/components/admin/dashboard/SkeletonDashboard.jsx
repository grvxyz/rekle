const SkeletonDashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 w-56 rounded" />
      <div className="h-16 bg-gray-200 rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-200 rounded-2xl"
          />
        ))}
      </div>

      <div className="h-80 bg-gray-200 rounded-2xl" />
      <div className="h-80 bg-gray-200 rounded-2xl" />
    </div>
  );
};

export default SkeletonDashboard;