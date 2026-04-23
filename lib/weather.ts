// Open-Meteo API helper — free, no API key required
// https://open-meteo.com/en/docs

export interface WeatherData {
  temp: number;
  code: number;
  icon: string;
  desc: string;
}

// WMO Weather interpretation codes → emoji + zh label
const weatherMap: Record<number, { icon: string; desc: string }> = {
  0: { icon: "☀️", desc: "晴" },
  1: { icon: "🌤️", desc: "大致晴朗" },
  2: { icon: "⛅", desc: "局部多雲" },
  3: { icon: "☁️", desc: "陰天" },
  45: { icon: "🌫️", desc: "霧" },
  48: { icon: "🌫️", desc: "霧凇" },
  51: { icon: "🌦️", desc: "細雨" },
  53: { icon: "🌦️", desc: "小雨" },
  55: { icon: "🌧️", desc: "中雨" },
  56: { icon: "🌧️", desc: "凍雨" },
  57: { icon: "🌧️", desc: "強凍雨" },
  61: { icon: "🌦️", desc: "小雨" },
  63: { icon: "🌧️", desc: "雨" },
  65: { icon: "🌧️", desc: "大雨" },
  66: { icon: "🌧️", desc: "凍雨" },
  67: { icon: "🌧️", desc: "強凍雨" },
  71: { icon: "🌨️", desc: "小雪" },
  73: { icon: "🌨️", desc: "雪" },
  75: { icon: "❄️", desc: "大雪" },
  77: { icon: "❄️", desc: "雪粒" },
  80: { icon: "🌦️", desc: "陣雨" },
  81: { icon: "🌧️", desc: "強陣雨" },
  82: { icon: "⛈️", desc: "暴雨" },
  85: { icon: "🌨️", desc: "陣雪" },
  86: { icon: "❄️", desc: "強陣雪" },
  95: { icon: "⛈️", desc: "雷雨" },
  96: { icon: "⛈️", desc: "雷雨冰雹" },
  99: { icon: "⛈️", desc: "強雷雨" },
};

// In-memory cache (10 min) to avoid refetching same location
const cache = new Map<string, { data: WeatherData; expires: number }>();
const TTL = 10 * 60 * 1000;

export async function fetchWeather(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const temp = Math.round(json.current?.temperature_2m);
    const code = json.current?.weather_code ?? 0;
    const info = weatherMap[code] ?? { icon: "🌡️", desc: "—" };
    const data: WeatherData = {
      temp,
      code,
      icon: info.icon,
      desc: info.desc,
    };
    cache.set(key, { data, expires: Date.now() + TTL });
    return data;
  } catch {
    return null;
  }
}
