import { useState, useMemo } from 'react';
import MapView from '../components/MapView';
import SpotCard from '../components/SpotCard';
import SpotList from '../components/SpotList';
import RouteCard from '../components/RouteCard';
import RoutePlan from '../components/RoutePlan';
import { useSpots } from '../hooks/useSpots';
import { useRoutes } from '../hooks/useRoutes';
import { planRoute } from '../utils/routePlanner';

export default function BrowsePage() {
  const { spots, loading } = useSpots();
  const { routes } = useRoutes();

  const [activeTab, setActiveTab] = useState('spots');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeSpot, setActiveSpot] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [routePlan, setRoutePlan] = useState(null);

  const toggleSpot = (spot) => {
    setSelectedIds((prev) =>
      prev.includes(spot.id) ? prev.filter((id) => id !== spot.id) : [...prev, spot.id]
    );
  };

  const handleGenerateRoute = () => {
    const selectedSpots = spots.filter((s) => selectedIds.includes(s.id));
    if (selectedSpots.length < 1) return;
    const plan = planRoute(selectedSpots);
    setRoutePlan(plan);
    setActiveTab('plan');
  };

  const handleLoadRoute = (route) => {
    const routeSpotIds = (route.spots || []).map((item) => item.spot_id);
    setSelectedIds(routeSpotIds);
    const selectedSpots = spots.filter((s) => routeSpotIds.includes(s.id));
    if (selectedSpots.length > 0) {
      const plan = planRoute(selectedSpots);
      setRoutePlan(plan);
      setActiveTab('plan');
    }
  };

  const selectedSpots = useMemo(
    () => spots.filter((s) => selectedIds.includes(s.id)),
    [spots, selectedIds]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900">
      <div className="flex-1 hidden md:block">
        <MapView
          spots={spots}
          selectedIds={selectedIds}
          onSpotClick={setActiveSpot}
          routePath={routePlan?.ordered}
        />
      </div>

      <div className="w-full md:w-[420px] flex flex-col bg-gray-900 border-l border-gray-700">
        <div className="md:hidden h-[45vh]">
          <MapView
            spots={spots}
            selectedIds={selectedIds}
            onSpotClick={setActiveSpot}
            routePath={routePlan?.ordered}
          />
        </div>

        <div className="flex border-b border-gray-700">
          {[
            { key: 'spots', label: '机位浏览' },
            { key: 'routes', label: '精选路线' },
            { key: 'plan', label: '我的路线' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'spots' && (
            <SpotList
              spots={spots}
              selectedIds={selectedIds}
              onToggle={toggleSpot}
              onSpotClick={setActiveSpot}
              filterText={filterText}
              onFilterChange={setFilterText}
            />
          )}

          {activeTab === 'routes' && (
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onLoadRoute={handleLoadRoute}
                />
              ))}
              {routes.length === 0 && (
                <p className="col-span-full text-center text-gray-500 text-sm py-12">
                  暂无精选路线，敬请期待
                </p>
              )}
            </div>
          )}

          {activeTab === 'plan' && (
            routePlan ? (
              <RoutePlan plan={routePlan} spots={spots} onClear={() => { setRoutePlan(null); setSelectedIds([]); }} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-4">尚未选择机位或生成路线</p>
                <button onClick={() => setActiveTab('spots')} className="text-amber-400 underline">
                  去浏览机位
                </button>
              </div>
            )
          )}
        </div>

        {selectedIds.length > 0 && activeTab !== 'plan' && (
          <div className="border-t border-gray-700 p-3">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span>已选 <strong>{selectedIds.length}</strong> 个机位</span>
              <span className="text-amber-400">
                约{selectedSpots.reduce((sum, s) => sum + (s.est_duration || 15), 0)}分钟
              </span>
            </div>
            <button
              onClick={handleGenerateRoute}
              disabled={selectedIds.length < 1}
              className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-lg
                         hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              生成路线
            </button>
          </div>
        )}
      </div>

      {activeSpot && (
        <SpotCard
          spot={activeSpot}
          isSelected={selectedIds.includes(activeSpot.id)}
          onToggleSelect={toggleSpot}
          onClose={() => setActiveSpot(null)}
        />
      )}
    </div>
  );
}
