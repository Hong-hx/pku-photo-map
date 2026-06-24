export default function RoutePlan({ plan, spots, onClear }) {
  if (!plan || !plan.ordered || plan.ordered.length === 0) return null;

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">📋 拍摄计划</h3>
        <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-400">清空</button>
      </div>

      <div className="flex gap-3 mb-3 text-center">
        <div className="flex-1 bg-gray-800 rounded-lg p-2">
          <div className="text-amber-400 font-bold">{plan.totalDuration}</div>
          <div className="text-xs text-gray-500">总时长(分钟)</div>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg p-2">
          <div className="text-amber-400 font-bold">{plan.totalShoot}</div>
          <div className="text-xs text-gray-500">拍摄</div>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg p-2">
          <div className="text-amber-400 font-bold">{plan.totalWalk}</div>
          <div className="text-xs text-gray-500">步程</div>
        </div>
      </div>

      <div className="space-y-1">
        {plan.ordered.map((spot, i) => (
          <div key={spot.id}>
            <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{spot.name}</div>
                <div className="text-xs text-gray-500">拍摄 ≈{spot.est_duration || 15}分钟</div>
              </div>
            </div>
            {i < plan.ordered.length - 1 && (
              <div className="ml-11 h-6 border-l-2 border-dashed border-gray-600 flex items-center px-3">
                <span className="text-xs text-gray-500">步行 ≈{plan.segments[i]}分钟</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
