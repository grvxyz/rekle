const SkeletonTable = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <div
              key={j}
              className="h-6 bg-gray-200 rounded flex-1"
              style={{
                flexGrow: j === 2 ? 2 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;