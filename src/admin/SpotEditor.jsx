import { useState } from 'react';
import { createSpot, updateSpot, deleteSpot } from '../hooks/useSpots';
import MapView from '../components/MapView';

const TIME_OPTIONS = ['morning', 'noon', 'afternoon', 'dusk'];
const TIME_LABELS = { morning: '上午', noon: '正午', afternoon: '下午', dusk: '黄昏' };
const STYLE_PRESETS = ['端庄', '逆光', '胶片感', '清新', '仪式感', '亲密', '纪实', '古风'];

export default function SpotEditor({ spots, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [customTag, setCustomTag] = useState('');

  const startNew = (lngLat) => {
    setEditing(null);
    setForm({
      name: '', lng: lngLat[0], lat: lngLat[1],
      est_duration: 15, recommended_time: [], style_tags: [], tips: '',
    });
  };

  const startEdit = (spot) => {
    setEditing(spot);
    setForm({
      name: spot.name, lng: spot.lng, lat: spot.lat,
      est_duration: spot.est_duration, recommended_time: spot.recommended_time || [],
      style_tags: spot.style_tags || [], tips: spot.tips || '',
    });
  };

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleSave = async () => {
    if (!form.name.trim()) { setMessage('请输入机位名称'); return; }
    setSaving(true);
    setMessage('');
    try {
      const data = {
        name: form.name.trim(),
        lng: form.lng, lat: form.lat,
        est_duration: form.est_duration,
        recommended_time: form.recommended_time,
        style_tags: form.style_tags,
        tips: form.tips.trim(),
      };
      if (editing) {
        await updateSpot(editing.id, data);
        setMessage('已更新');
      } else {
        await createSpot(data);
        setMessage('已创建');
      }
      setEditing(null);
      setForm({});
      onRefresh();
    } catch (err) {
      setMessage('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing || !confirm('确定删除机位"' + editing.name + '"？此操作不可恢复。')) return;
    setSaving(true);
    try {
      await deleteSpot(editing.id);
      setEditing(null);
      setForm({});
      setMessage('已删除');
      onRefresh();
    } catch (err) {
      setMessage('删除失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !form.style_tags.includes(tag)) {
      setForm({ ...form, style_tags: [...form.style_tags, tag] });
    }
    setCustomTag('');
  };

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <MapView
          spots={spots}
          editable
          onSpotClick={(spot) => startEdit(spot)}
          onMapClick={(lngLat) => startNew(lngLat)}
        />
      </div>

      <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">
          {editing ? '编辑：' + editing.name : '新增机位'}
        </h3>

        {message && (
          <div className={'mb-3 p-2 rounded text-sm ' + (
            message.includes('失败') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          )}>{message}</div>
        )}

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-gray-400 text-xs">名称</label>
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 mt-1 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>

          <div>
            <label className="text-gray-400 text-xs">坐标</label>
            <div className="flex gap-2 mt-1">
              <input value={form.lng?.toFixed(6) || ''} readOnly
                className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white text-xs" />
              <input value={form.lat?.toFixed(6) || ''} readOnly
                className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white text-xs" />
            </div>
            <p className="text-xs text-gray-500 mt-1">在地图上点击即可更新坐标</p>
          </div>

          <div>
            <label className="text-gray-400 text-xs">预估拍摄时长（分钟）</label>
            <input type="number" min={5} max={60}
              value={form.est_duration || 15}
              onChange={(e) => setForm({ ...form, est_duration: parseInt(e.target.value) || 15 })}
              className="w-full px-3 py-2 mt-1 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>

          <div>
            <label className="text-gray-400 text-xs">推荐时段</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TIME_OPTIONS.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, recommended_time: toggleArrayItem(form.recommended_time, t) })}
                  className={'px-2 py-1 rounded text-xs transition ' + (
                    (form.recommended_time || []).includes(t)
                      ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}>{TIME_LABELS[t]}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs">风格标签</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {STYLE_PRESETS.map((t) => (
                <button key={t} onClick={() => setForm({ ...form, style_tags: toggleArrayItem(form.style_tags, t) })}
                  className={'px-2 py-1 rounded text-xs transition ' + (
                    (form.style_tags || []).includes(t)
                      ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}>{t}</button>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              <input value={customTag} onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                placeholder="自定义标签"
                className="flex-1 px-2 py-1 bg-gray-700 rounded text-xs text-white focus:outline-none" />
              <button onClick={addCustomTag}
                className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">添加</button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs">拍摄建议</label>
            <textarea value={form.tips || ''}
              onChange={(e) => setForm({ ...form, tips: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 mt-1 bg-gray-700 rounded-lg text-white text-sm
                         focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm
                         hover:bg-amber-400 disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            {editing && (
              <button onClick={handleDelete} disabled={saving}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
