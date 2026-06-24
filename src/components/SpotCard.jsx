import SampleGallery from './SampleGallery';

export default function SpotCard({ spot, onClose, onToggleSelect, isSelected }) {
  if (!spot) return null;

  const timeLabels = { morning: '上午', noon: '正午', afternoon: '下午', dusk: '黄昏' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
         onClick={onClose}>
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold">{spot.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>

          {spot.sample_urls && spot.sample_urls.length > 0 && (
            <SampleGallery urls={spot.sample_urls} />
          )}

          <div className="mt-3 space-y-2 text-sm text-gray-300">
            <div>
              <span className="text-gray-500">预估时长：</span>
              <span className="text-amber-400 font-semibold">{spot.est_duration || 15} 分钟</span>
            </div>
            {spot.recommended_time && spot.recommended_time.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-gray-500">推荐时段：</span>
                {spot.recommended_time.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                    {timeLabels[t] || t}
                  </span>
                ))}
              </div>
            )}
            {spot.style_tags && spot.style_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-gray-500">风格：</span>
                {spot.style_tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{t}</span>
                ))}
              </div>
            )}
            {spot.tips && (
              <div>
                <span className="text-gray-500">拍摄建议：</span>
                <p className="mt-1 text-gray-400">{spot.tips}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => onToggleSelect(spot)}
            className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm transition ${
              isSelected
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-amber-500 text-black hover:bg-amber-400'
            }`}
          >
            {isSelected ? '从已选列表中移除' : '+ 加入拍摄计划'}
          </button>
        </div>
      </div>
    </div>
  );
}
