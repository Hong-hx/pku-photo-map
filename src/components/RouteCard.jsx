export default function RouteCard({ route, onSelect, onLoadRoute }) {
  const timeLabels = { morning: '上午', noon: '正午', afternoon: '下午', dusk: '黄昏', evening: '傍晚' };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:ring-1 hover:ring-amber-500/50 transition cursor-pointer"
         onClick={() => onSelect && onSelect(route)}>
      {route.cover_url && (
        <img src={route.cover_url} alt={route.name} className="w-full h-32 object-cover" />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-base">{route.name}</h3>
          {route.source === 'ai_generated' && (
            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">AI</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-2">{route.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {route.time_slots?.map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
              {timeLabels[t] || t}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{(route.spots || []).length} 个机位</span>
          <span className="text-amber-400 font-semibold">≈{route.total_duration}分钟</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onLoadRoute && onLoadRoute(route); }}
          className="mt-3 w-full py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm
                     hover:bg-amber-500/30 transition"
        >
          加载此路线
        </button>
      </div>
    </div>
  );
}
