import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSpots } from '../hooks/useSpots';
import { useRoutes } from '../hooks/useRoutes';
import LoginForm from '../components/LoginForm';
import Dashboard from '../admin/Dashboard';
import SpotEditor from '../admin/SpotEditor';
import SampleUploader from '../admin/SampleUploader';
import RouteEditor from '../admin/RouteEditor';

export default function AdminPage() {
  const { user, loading, signIn, signOut } = useAuth();
  const { spots, refetch: refetchSpots } = useSpots();
  const { routes, refetch: refetchRoutes } = useRoutes();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!user) return <LoginForm onLogin={signIn} />;

  const navItems = [
    { path: '/admin', label: '总览', exact: true },
    { path: '/admin/spots', label: '机位管理' },
    { path: '/admin/samples', label: '样片上传' },
    { path: '/admin/routes', label: '路线编辑' },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      <div className={`${sidebarOpen ? 'w-48' : 'w-14'} bg-gray-800 border-r border-gray-700
                        flex flex-col transition-all duration-200`}>
        <div className="p-3 border-b border-gray-700 flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white text-lg">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          {sidebarOpen && <span className="font-bold text-sm">编辑后台</span>}
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 text-sm hover:bg-gray-700 transition ${
                sidebarOpen ? '' : 'text-center text-lg'
              }`}
            >
              {sidebarOpen ? item.label : item.label.slice(0, 2)}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-red-400">
            {sidebarOpen ? '退出登录' : '退出'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard spots={spots} routes={routes} />} />
          <Route path="/spots" element={<SpotEditor spots={spots} onRefresh={refetchSpots} />} />
          <Route path="/samples" element={<SampleUploader spots={spots} onRefresh={refetchSpots} />} />
          <Route path="/routes" element={
            <RouteEditor routes={routes} spots={spots} onRefresh={refetchRoutes} />
          } />
        </Routes>
      </div>
    </div>
  );
}
