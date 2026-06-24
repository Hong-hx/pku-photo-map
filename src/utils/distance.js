export function haversineDistance(lng1, lat1, lng2, lat2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const WALK_SPEED = 80;
const PATH_FACTOR = 1.3;
const MOVE_TIME_MIN = 3;

export function walkTime(lng1, lat1, lng2, lat2) {
  const dist = haversineDistance(lng1, lat1, lng2, lat2);
  return Math.max(MOVE_TIME_MIN, Math.round((dist * PATH_FACTOR) / WALK_SPEED));
}
