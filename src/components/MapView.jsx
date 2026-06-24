import { useEffect, useRef, useState } from 'react';
import { loadAMap } from '../lib/amap';

export default function MapView({
  spots = [],
  selectedIds = [],
  onSpotClick,
  onMapClick,
  editable = false,
  routePath = null,
  height = '100%',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAMap().then((AMap) => {
      if (cancelled) return;
      const map = new AMap.Map(containerRef.current, {
        zoom: 16,
        center: [116.310, 39.995],
        mapStyle: 'amap://styles/dark',
      });
      mapRef.current = map;

      if (editable && onMapClick) {
        map.on('click', (e) => {
          onMapClick([e.lnglat.getLng(), e.lnglat.getLat()]);
        });
      }

      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const AMap = window.AMap;

    spots.forEach((spot) => {
      const isSelected = selectedIds.includes(spot.id);
      const marker = new AMap.Marker({
        position: [spot.lng, spot.lat],
        map: mapRef.current,
        title: spot.name,
        icon: new AMap.Icon({
          size: isSelected ? new AMap.Size(32, 42) : new AMap.Size(28, 36),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          imageSize: isSelected ? new AMap.Size(32, 42) : new AMap.Size(28, 36),
        }),
        offset: isSelected ? new AMap.Pixel(-16, -42) : new AMap.Pixel(-14, -36),
        zIndex: isSelected ? 100 : 50,
      });

      marker.on('click', () => {
        if (onSpotClick) onSpotClick(spot);
      });

      markersRef.current.push(marker);
    });
  }, [loaded, spots, selectedIds]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }

    if (routePath && routePath.length > 1) {
      const AMap = window.AMap;
      polylineRef.current = new AMap.Polyline({
        path: routePath.map((s) => [s.lng, s.lat]),
        strokeColor: '#f39c12',
        strokeWeight: 4,
        strokeStyle: 'dashed',
        map: mapRef.current,
      });
      mapRef.current.setFitView(polylineRef.current);
    }
  }, [loaded, routePath]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}
