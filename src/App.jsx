import { Routes, Route } from 'react-router-dom';
import BrowsePage from './pages/BrowsePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BrowsePage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}
