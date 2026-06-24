import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { updateSpot } from '../hooks/useSpots';

export default function SampleUploader({ spots, onRefresh }) {
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  const selectedSpot = spots.find((s) => s.id === selectedSpotId);

  const handleUpload = async (files) => {
    if (!selectedSpotId || !files || files.length === 0) return;
    setUploading(true);
    setMessage('');

    const currentUrls = selectedSpot.sample_urls || [];

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = selectedSpotId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;

      const { error: uploadErr } = await supabase.storage
        .from('spot-samples')
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setMessage('上传失败: ' + uploadErr.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('spot-samples')
        .getPublicUrl(path);

      currentUrls.push(urlData.publicUrl);
    }

    try {
      await updateSpot(selectedSpotId, { sample_urls: currentUrls });
      setMessage('成功上传 ' + files.length + ' 张样片');
      onRefresh();
    } catch (err) {
      setMessage('保存失败: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSample = async (url) => {
    if (!selectedSpotId) return;
    const urlObj = new URL(url);
    const filePath = urlObj.pathname.split('/spot-samples/')[1];
    if (!filePath) return;

    try {
      await supabase.storage.from('spot-samples').remove([filePath]);
      const newUrls = (selectedSpot.sample_urls || []).filter((u) => u !== url);
      await updateSpot(selectedSpotId, { sample_urls: newUrls });
      setMessage('已删除样片');
      onRefresh();
    } catch (err) {
      setMessage('删除失败: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">样片上传</h2>

      {message && (
        <div className={'mb-3 p-2 rounded text-sm ' + (
          message.includes('失败') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        )}>{message}</div>
      )}

      <div className="mb-4">
        <label className="text-sm text-gray-400">选择机位</label>
        <select value={selectedSpotId} onChange={(e) => setSelectedSpotId(e.target.value)}
          className="w-full px-3 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm">
          <option value="">-- 请选择 --</option>
          {spots.map((spot) => (
            <option key={spot.id} value={spot.id}>
              {spot.name} ({(spot.sample_urls || []).length} 张样片)
            </option>
          ))}
        </select>
      </div>

      {selectedSpot && (
        <>
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">
              已有样片（{(selectedSpot.sample_urls || []).length} 张）
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(selectedSpot.sample_urls || []).map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={'样片' + (i + 1)} className="w-full h-24 object-cover rounded-lg" />
                  <button onClick={() => handleDeleteSample(url)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                               opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center
                       cursor-pointer hover:border-amber-500 transition"
          >
            <p className="text-gray-400 text-sm">
              {uploading ? '上传中...' : '点击选择或拖拽图片到此区域'}
            </p>
            <p className="text-gray-600 text-xs mt-1">支持 JPG / PNG / WebP · 单张建议 &lt; 2MB</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
