import { trips } from "@/lib/trips";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TripDetailClient } from "./TripDetailClient";

export function generateStaticParams() {
  return trips
    .filter((t) => t.detailDays)
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = trips.find((t) => t.slug === slug);
  if (!trip) return {};
  return {
    title: `${trip.title} — ${trip.titleEn}`,
    description: trip.description,
    openGraph: {
      title: `${trip.title} — ${trip.titleEn}`,
      description: trip.description,
      images: [{ url: trip.cover, width: 1200, height: 630 }],
    },
  };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = trips.find((t) => t.slug === slug);
  if (!trip || !trip.detailDays) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${trip.cover})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[var(--background)]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            ← 返回清單
          </Link>
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                📋 已規劃
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {trip.days} 天
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {trip.country}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-2">
              {trip.title}
            </h1>
            <p className="text-white/50 text-lg font-medium mb-3">
              {trip.titleEn}
            </p>
            <p className="text-white/70 text-base max-w-2xl leading-relaxed">
              {trip.description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-xl animate-fade-in-up delay-200">
            {[
              { label: "天數", value: `${trip.days}D${trip.days - 1}N`, icon: "📅" },
              { label: "風格", value: trip.style, icon: "🎨" },
              { label: "景點", value: `${trip.highlights.length} 個`, icon: "📍" },
              { label: "最佳時間", value: trip.bestSeason, icon: "☀️" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 text-white"
              >
                <div className="text-xs opacity-60 mb-1">
                  {s.icon} {s.label}
                </div>
                <div className="text-lg font-extrabold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client-side interactive content */}
      <TripDetailClient trip={trip} />
    </>
  );
}
