import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">编辑者登录</h2>
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                       focus:outline-none focus:border-amber-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                       focus:outline-none focus:border-amber-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-amber-500 text-black font-bold rounded-lg
                     hover:bg-amber-400 disabled:opacity-50 transition"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}
