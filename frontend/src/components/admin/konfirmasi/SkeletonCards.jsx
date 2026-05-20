const SkeletonCards = ({ count = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow p-5 space-y-3"
        >
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded-xl" />

          <div className="flex gap-3">
            <div className="h-10 flex-1 bg-gray-200 rounded-xl" />
            <div className="h-10 flex-1 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCards;