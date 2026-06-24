import AMapLoader from '@amap/amap-jsapi-loader';

let AMapInstance = null;

export async function loadAMap() {
  if (AMapInstance) return AMapInstance;

  const key = import.meta.env.VITE_AMAP_KEY;
  const secret = import.meta.env.VITE_AMAP_SECRET;

  if (!key) {
    console.error('缺少 VITE_AMAP_KEY 环境变量');
  }

  AMapInstance = await AMapLoader.load({
    key: key || '',
    version: '2.0',
    plugins: ['AMap.Geolocation', 'AMap.Geocoder'],
  });

  if (secret) {
    window._AMapSecurityConfig = { securityJsCode: secret };
  }

  return AMapInstance;
}
