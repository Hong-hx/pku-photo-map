import { useState } from 'react';
import { createRoute, updateRoute, deleteRoute } from '../hooks/useRoutes';
import { supabase } from '../lib/supabase';

const TIME_SLOT_OPTIONS = ['morning', 'noon', 'afternoon', 'dusk', 'evening'];
const TIME_SLOT_LABELS = { morning: '上午', noon: '正午', afternoon: '下午', dusk: '黄昏', evening: '傍晚' };

export default function RouteEditor({ routes, spots, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const startNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', time_slots: [], spots: [], source: 'manual' });
    setCoverFile(null);
  };

  const startEdit = (route) => {
    setEditing(route);
    setForm({
      name: route.name,
      description: route.description || '',
      time_slots: route.time_slots || [],
      spots: route.spots || [],
      source: route.source || 'manual',
    });
    setCoverFile(null);
  };

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const addSpotToRoute = (spotId) => {
    if (form.spots.find((s) => s.spot_id === spotId)) return;
    setForm({ ...form, spots: [...form.spots, { spot_id: spotId, order: form.spots.length }] });
  };

  const removeSpotFromRoute = (spotId) => {
    setForm({
      ...form,
      spots: form.spots.filter((s) => s.spot_id !== spotId).map((s, i) => ({ ...s, order: i })),
    });
  };

  const moveSpot = (index, direction) => {
    const newSpots = [...form.spots];
    const target = index + direction;
    if (target < 0 || target >= newSpots.length) return;
    [newSpots[index], newSpots[target]] = [newSpots[target], newSpots[index]];
    setForm({ ...form, spots: newSpots.map((s, i) => ({ ...s, order: i })) });
  };

  const calcDuration = () => {
    let total = 0;
    (form.spots || []).forEach((item) => {
      const spot = spots.find((s) => s.id === item.spot_id);
      total += spot ? (spot.est_duration || 15) : 15;
    });
    if (form.spots.length > 1) {
      total += (form.spots.length - 1) * 5;
    }
    return total;
  };

  const uploadCover = async () => {
    if (!coverFile) return null;
    const ext = coverFile.name.split('.').pop();
    const path = 'route-covers/' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
    const { error } = await supabase.storage.from('spot-samples').upload(path, coverFile, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('spot-samples').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setMessage('请输入路线名称'); return; }
    setSaving(true);
    setMessage('');
    try {
      let coverUrl = editing?.cover_url || '';
      if (coverFile) coverUrl = await uploadCover();

      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        cover_url: coverUrl,
        time_slots: form.time_slots,
        spots: form.spots,
        total_duration: calcDuration(),
        source: form.source,
      };

      if (editing) {
        await updateRoute(editing.id, data);
        setMessage('已更新');
      } else {
        await createRoute(data);
        setMessage('已创建');
      }
      setEditing(null);
      setForm({});
      setCoverFile(null);
      onRefresh();
    } catch (err) {
      setMessage('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing || !confirm('确定删除路线"' + editing.name + '"？')) return;
    try {
      await deleteRoute(editing.id);
      setEditing(null);
      setForm({});
      setMessage('已删除');
      onRefresh();
    } catch (err) {
      setMessage('删除失败: ' + err.message);
    }
  };

  const getSpotName = (spotId) => {
    const spot = spots.find((s) => s.id === spotId);
    return spot ? spot.name : '(已删除)';
  };

  const getSpotDuration = (spotId) => {
    const spot = spots.find((s) => s.id === spotId);
    return spot ? (spot.est_duration || 15) : 15;
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">路线编辑</h2>
        <button onClick={startNew}
          className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400">
          + 新建路线
        </button>
      </div>

      {message && (
        <div className={'mb-3 p-2 rounded text-sm ' + (
          message.includes('失败') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        )}>{message}</div>
      )}

      {!editing && form.name === '' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-gray-800 rounded-xl p-4 flex gap-4">
              {route.cover_url && (
                <img src={route.cover_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{route.name}</h3>
                  {route.source === 'ai_generated' && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">AI</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{route.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{(route.spots || []).length} 个机位</span>
                  <span className="text-amber-400">约{route.total_duration}分钟</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEdit(route)}
                    className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">编辑</button>
                  <button onClick={async () => {
                    if (confirm('删除"' + route.name + '"？')) { await deleteRoute(route.id); onRefresh(); }
                  }}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">删除</button>
                </div>
              </div>
            </div>
          ))}
          {routes.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-12">暂无路线，点击"新建路线"开始</p>
          )}
        </div>
      )}

      {(editing || form.name !== '' || coverFile) && (
        <div className="bg-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold">{editing ? '编辑路线' : '新建路线'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs">路线名称</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 mt-1 bg-gray-700 rounded-lg text-white text-sm
                           focus:outline-none focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">来源</label>
              <div className="flex gap-2 mt-1">
                {['manual', 'ai_generated'].map((src) => (
                  <button key={src} onClick={() => setForm({ ...form, source: src })}
                    className={'px-3 py-2 rounded-lg text-sm ' + (
                      form.source === src ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300'
                    )}>{src === 'manual' ? '手动' : 'AI生成'}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs">风格描述</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 mt-1 bg-gray-700 rounded-lg text-white text-sm
                         focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>

          <div>
            <label className="text-gray-400 text-xs">适合拍摄时间</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TIME_SLOT_OPTIONS.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, time_slots: toggleArrayItem(form.time_slots, t) })}
                  className={'px-3 py-1 rounded text-xs transition ' + (
                    (form.time_slots || []).includes(t)
                      ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}>{TIME_SLOT_LABELS[t]}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs">封面图</label>
            <div className="flex items-center gap-3 mt-1">
              {(editing?.cover_url || coverFile) && (
                <img
                  src={coverFile ? URL.createObjectURL(coverFile) : editing.cover_url}
                  alt="" className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0] || null)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-xs">路线机位（可排序）</label>
              <span className="text-sm text-amber-400 font-bold">总时长 ≈{calcDuration()}分钟</span>
            </div>
            <div className="space-y-1 mb-3 max-h-64 overflow-y-auto">
              {form.spots.map((item, i) => (
                <div key={item.spot_id} className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
                  <div className="flex flex-col">
                    <button onClick={() => moveSpot(i, -1)} disabled={i === 0}
                      className="text-xs text-gray-400 hover:text-white disabled:opacity-30">▲</button>
                    <button onClick={() => moveSpot(i, 1)} disabled={i === form.spots.length - 1}
                      className="text-xs text-gray-400 hover:text-white disabled:opacity-30">▼</button>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="flex-1 text-sm">{getSpotName(item.spot_id)}</span>
                  <span className="text-xs text-gray-400">≈{getSpotDuration(item.spot_id)}分钟</span>
                  <button onClick={() => removeSpotFromRoute(item.spot_id)}
                    className="text-gray-400 hover:text-red-400">✕</button>
                </div>
              ))}
            </div>
            <select
              onChange={(e) => { if (e.target.value) { addSpotToRoute(e.target.value); e.target.value = ''; } }}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm">
              <option value="">+ 添加机位到路线</option>
              {spots.filter((s) => !form.spots.find((item) => item.spot_id === s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm
                         hover:bg-amber-400 disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => { setEditing(null); setForm({}); setCoverFile(null); }}
              className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600">取消</button>
            {editing && (
              <button onClick={handleDelete}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                删除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
