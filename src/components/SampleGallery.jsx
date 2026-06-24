import { useState } from 'react';

export default function SampleGallery({ urls }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {urls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`样片 ${i + 1}`}
            className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
            onClick={() => setLightbox(url)}
          />
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
             onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="样片大图" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
