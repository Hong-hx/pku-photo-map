const statCard = (label, value) => (
  <div className="bg-gray-800 rounded-xl p-5 text-center">
    <div className="text-3xl font-bold text-amber-400">{value}</div>
    <div className="text-sm text-gray-400 mt-1">{label}</div>
  </div>
);

export default function Dashboard({ spots, routes }) {
  const totalSamples = spots.reduce((sum, s) => sum + (s.sample_urls ? s.sample_urls.length : 0), 0);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">数据总览</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCard('总机位数', spots.length)}
        {statCard('样片总数', totalSamples)}
        {statCard('精选路线', routes.length)}
        {statCard('存储用量', '— MB')}
      </div>

      <h3 className="font-bold mb-3">最近添加的机位</h3>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="text-left p-3">名称</th>
              <th className="text-left p-3">坐标</th>
              <th className="text-left p-3">时长</th>
              <th className="text-left p-3">风格</th>
            </tr>
          </thead>
          <tbody>
            {spots.slice(-5).reverse().map((spot) => (
              <tr key={spot.id} className="border-b border-gray-700/50">
                <td className="p-3">{spot.name}</td>
                <td className="p-3 text-gray-400 text-xs">
                  {spot.lng.toFixed(4)}, {spot.lat.toFixed(4)}
                </td>
                <td className="p-3">{spot.est_duration || 15}分钟</td>
                <td className="p-3">
                  {(spot.style_tags || []).map((t) => (
                    <span key={t} className="mr-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{t}</span>
                  ))}
                </td>
              </tr>
            ))}
            {spots.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
