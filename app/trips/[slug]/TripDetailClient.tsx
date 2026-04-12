"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Trip } from "@/lib/trips";

export function TripDetailClient({ trip }: { trip: Trip }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Leaflet map
  useEffect(() => {
    if (!trip.stops || !mapRef.current || mapInstanceRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      const map = L.map(mapRef.current!, { scrollWheelZoom: false }).setView([36.8, 97.5], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const dayColors: Record<string, string> = {
        D1: "#2364ff", D2: "#764ba2", D3: "#11998e", D4: "#ff6b35",
      };

      trip.stops!.forEach((s) => {
        const dayKey = s.day.substring(0, 2);
        const color = dayColors[dayKey] || "#2364ff";
        const icon = L.divIcon({
          html: `<div style="background:${color};color:#fff;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25)">${s.name}</div>`,
          className: "",
          iconAnchor: [30, 15],
        });
        L.marker([s.lat, s.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${s.name}</strong><br/>${s.day}<br/>海拔 ${s.altitude || "N/A"}`);
      });

      const coords = trip.stops!.map((s) => [s.lat, s.lng] as [number, number]);
      L.polyline(coords, { color: "#2364ff", weight: 3, opacity: 0.6, dashArray: "8, 8" }).addTo(map);
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip.stops]);

  // Packing checklist
  const [packed, setPacked] = useState<Record<number, boolean>>({});
  useEffect(() => {
    const stored = localStorage.getItem(`dt-pack-${trip.slug}`);
    if (stored) setPacked(JSON.parse(stored));
  }, [trip.slug]);

  const togglePack = useCallback(
    (i: number) => {
      setPacked((prev) => {
        const next = { ...prev, [i]: !prev[i] };
        localStorage.setItem(`dt-pack-${trip.slug}`, JSON.stringify(next));
        return next;
      });
    },
    [trip.slug]
  );

  const packedCount = Object.values(packed).filter(Boolean).length;
  const totalPack = trip.packingList?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Route Map */}
      {trip.stops && (
        <section className="mb-12 animate-fade-in-up">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🗺️ 自駕路線圖
          </h2>
          <div
            ref={mapRef}
            className="h-[360px] rounded-2xl shadow-lg overflow-hidden map-container"
          />
        </section>
      )}

      {/* Day-by-day Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {trip.detailDays?.map((day, i) => (
            <section
              key={day.day}
              id={`day${day.day}`}
              className="glass rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                  D{day.day}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold mb-1">{day.title}</h3>
                  <div className="text-blue-500 dark:text-blue-400 font-bold text-sm mb-2">
                    {day.subtitle}
                  </div>

                  {/* Drive chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {day.distance && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5">
                        🚗 {day.distance}
                      </span>
                    )}
                    {day.driveTime && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5">
                        ⏱️ {day.driveTime}
                      </span>
                    )}
                    {day.altitude && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10">
                        ⛰️ {day.altitude}
                      </span>
                    )}
                  </div>

                  <p className="text-sm opacity-60 mb-3">{day.description}</p>

                  <ul className="text-sm space-y-1.5 mb-4">
                    {day.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  {/* Photo Box */}
                  <div
                    className="relative h-44 rounded-xl overflow-hidden group cursor-default"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${day.photo})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-4 right-4 text-white font-bold text-sm z-10">
                      {day.photoCaption}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Altitude Warning */}
          <div className="glass rounded-2xl shadow-lg p-5 animate-fade-in-up delay-100">
            <h4 className="font-bold mb-3 flex items-center gap-2">⚠️ 海拔提醒</h4>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-300">
              <strong>全程海拔 2,200–3,200 m</strong>
              <br />
              第一天由西寧上升至青海湖，注意高反。建議慢慢適應，備好氧氣罐和葡萄糖。
            </div>
          </div>

          {/* Scenic Ranking */}
          <div className="glass rounded-2xl shadow-lg p-5 animate-fade-in-up delay-200">
            <h4 className="font-bold mb-3">最靚景點排序</h4>
            <div className="space-y-2">
              {trip.highlights.map((h, i) => {
                const colors = [
                  "from-orange-500 to-amber-400",
                  "from-indigo-500 to-purple-400",
                  "from-emerald-500 to-green-400",
                  "from-blue-500 to-cyan-400",
                  "from-gray-500 to-gray-400",
                ];
                return (
                  <div key={h} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[i] || colors[4]} text-white text-xs font-extrabold flex items-center justify-center`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium">{h}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Tips */}
          {trip.photoTips && (
            <div className="glass rounded-2xl shadow-lg p-5 animate-fade-in-up delay-300">
              <h4 className="font-bold mb-3">📸 拍照時間建議</h4>
              <ul className="space-y-2 text-sm">
                {trip.photoTips.map((pt) => (
                  <li key={pt.spot}>
                    <strong>{pt.spot}：</strong>
                    <span className="opacity-70">{pt.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Driving Tips */}
          {trip.tips && (
            <div className="glass rounded-2xl shadow-lg p-5 animate-fade-in-up delay-400">
              <h4 className="font-bold mb-3">🚗 自駕注意</h4>
              <ul className="space-y-2 text-sm">
                {trip.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span className="opacity-80">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing Checklist */}
          {trip.packingList && (
            <div className="glass rounded-2xl shadow-lg p-5 animate-fade-in-up delay-500">
              <h4 className="font-bold mb-3">🎒 行李清單</h4>
              <ul className="space-y-1">
                {trip.packingList.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => togglePack(i)}
                    className={`flex items-center gap-3 py-2 px-1 rounded-lg cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                      packed[i] ? "opacity-40 line-through" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
                        packed[i]
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-black/15 dark:border-white/15"
                      }`}
                    >
                      {packed[i] && "✓"}
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <div className="text-xs opacity-40 mb-1">
                  {packedCount}/{totalPack} 已打包
                </div>
                <div className="h-1 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${totalPack ? (packedCount / totalPack) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
