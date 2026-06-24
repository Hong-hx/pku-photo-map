import { haversineDistance, walkTime } from './distance';

export function planRoute(spots) {
  if (!spots || spots.length === 0) return { ordered: [], segments: [], totalDuration: 0 };

  const remaining = spots.map((s, i) => ({ ...s, _idx: i }));
  const ordered = [];

  const SIXI_LNG = 116.3043;
  const SIXI_LAT = 39.9960;

  const start = remaining.reduce((best, s) =>
    haversineDistance(SIXI_LNG, SIXI_LAT, s.lng, s.lat) <
    haversineDistance(SIXI_LNG, SIXI_LAT, best.lng, best.lat)
      ? s : best
  );
  ordered.push(start);
  remaining.splice(remaining.findIndex((r) => r.id === start.id), 1);

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = haversineDistance(last.lng, last.lat, remaining[0].lng, remaining[0].lat);
    for (let i = 1; i < remaining.length; i++) {
      const d = haversineDistance(last.lng, last.lat, remaining[i].lng, remaining[i].lat);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    ordered.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  const segments = [];
  let totalWalk = 0;
  for (let i = 1; i < ordered.length; i++) {
    const wt = walkTime(ordered[i - 1].lng, ordered[i - 1].lat, ordered[i].lng, ordered[i].lat);
    segments.push(wt);
    totalWalk += wt;
  }

  const totalShoot = ordered.reduce((sum, s) => sum + (s.est_duration || 15), 0);
  const totalDuration = totalShoot + totalWalk;

  return { ordered, segments, totalDuration, totalWalk, totalShoot };
}
