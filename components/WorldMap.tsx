"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/trips";
import { fetchWeather } from "@/lib/weather";

const statusColors: Record<string, string> = {
  completed: "#10b981",
  wishlist: "#f59e0b",
  planned: "#3b82f6",
};

const statusLabels: Record<string, string> = {
  completed: "已完成",
  wishlist: "心願清單",
  planned: "已規劃",
};

export function WorldMap({ trips }: { trips: Trip[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20, 30],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add markers
      trips.forEach((trip) => {
        const color = statusColors[trip.status];
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div data-status="${trip.status}" style="
            width: 14px; height: 14px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 6px ${color}88;
            transition: opacity 0.3s, transform 0.3s;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([trip.lat, trip.lng], { icon }).addTo(map);

        const weatherId = `wx-${trip.slug}`;
        marker.bindPopup(
          `<div style="text-align:center;min-width:140px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:2px;">${trip.title}</div>
            <div style="font-size:11px;opacity:0.7;margin-bottom:4px;">${trip.titleEn}</div>
            <div style="font-size:11px;color:${color};font-weight:600;">${statusLabels[trip.status]} · ${trip.days}天</div>
            <div style="font-size:10px;opacity:0.5;margin-top:2px;">${trip.country}</div>
            <div id="${weatherId}" style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,0.08);font-size:12px;min-height:20px;">
              <span style="opacity:0.4;font-size:10px;">載入天氣···</span>
            </div>
          </div>`,
          { closeButton: false, className: "map-popup" }
        );

        marker.on("popupopen", async () => {
          const el = document.getElementById(weatherId);
          if (!el) return;
          const weather = await fetchWeather(trip.lat, trip.lng);
          if (!el) return;
          if (weather) {
            el.innerHTML = `<span style="font-size:16px;">${weather.icon}</span> <strong>${weather.temp}°C</strong> <span style="opacity:0.6;">${weather.desc}</span>`;
          } else {
            el.innerHTML = `<span style="opacity:0.4;font-size:10px;">天氣資料暫不可用</span>`;
          }
        });
      });

      mapInstanceRef.current = map;

      // Fix map size after render
      setTimeout(() => map.invalidateSize(), 100);
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trips]);

  // Filter effect
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer: any) => {
      if (layer._icon) {
        const el = layer._icon.querySelector("[data-status]");
        if (!el) return;
        const status = el.getAttribute("data-status");
        if (!filter) {
          el.style.opacity = "1";
          el.style.transform = "scale(1)";
        } else {
          const isMatch = status === filter;
          el.style.opacity = isMatch ? "1" : "0.15";
          el.style.transform = isMatch ? "scale(1.3)" : "scale(0.6)";
        }
      }
    });
  }, [filter]);

  const counts = {
    completed: trips.filter((t) => t.status === "completed").length,
    wishlist: trips.filter((t) => t.status === "wishlist").length,
    planned: trips.filter((t) => t.status === "planned").length,
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🗺️</span> 旅行足跡
        </h2>
        <div className="flex gap-2">
          {(["completed", "wishlist", "planned"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? null : status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                filter === status
                  ? "ring-2 ring-offset-1 ring-offset-transparent"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                background:
                  filter === status
                    ? statusColors[status]
                    : `${statusColors[status]}22`,
                color: filter === status ? "white" : statusColors[status],
                ["--tw-ring-color" as any]: statusColors[status],
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: statusColors[status] }}
              />
              {statusLabels[status]} ({counts[status]})
            </button>
          ))}
        </div>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10"
      />
    </section>
  );
}
