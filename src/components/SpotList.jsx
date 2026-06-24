export default function SpotList({
  spots,
  selectedIds,
  onToggle,
  onSpotClick,
  filterText,
  onFilterChange,
}) {
  const filtered = spots.filter((s) =>
    !filterText || s.name.includes(filterText) || (s.style_tags || []).some((t) => t.includes(filterText))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="搜索机位或风格..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white
                     placeholder-gray-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1">
        {filtered.map((spot) => {
          const selected = selectedIds.includes(spot.id);
          return (
            <div
              key={spot.id}
              onClick={() => onSpotClick(spot)}
              className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition
                ${selected ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{spot.name}</div>
                <div className="text-xs text-gray-400">{spot.est_duration || 15}分钟</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(spot); }}
                className={`ml-2 px-2 py-1 rounded text-xs font-medium transition ${
                  selected ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {selected ? '移除' : '选择'}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">暂无匹配机位</p>
        )}
      </div>
    </div>
  );
}
