"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWeather, type WeatherData } from "@/lib/weather";

export function WeatherBadge({
  lat,
  lng,
  compact = false,
}: {
  lat: number;
  lng: number;
  compact?: boolean;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!elRef.current || fetchedRef.current) return;
    const el = elRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fetchedRef.current) {
            fetchedRef.current = true;
            setLoading(true);
            fetchWeather(lat, lng).then((data) => {
              setWeather(data);
              setLoading(false);
            });
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lat, lng]);

  return (
    <div
      ref={elRef}
      className={
        compact
          ? "inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full"
          : "inline-flex items-center gap-1.5 text-xs opacity-70"
      }
    >
      {loading && !weather && <span className="opacity-50">···</span>}
      {weather && (
        <>
          <span>{weather.icon}</span>
          <span>{weather.temp}°</span>
          {!compact && <span className="opacity-60">{weather.desc}</span>}
        </>
      )}
    </div>
  );
}
