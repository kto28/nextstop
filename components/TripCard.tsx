import Link from "next/link";
import type { Trip } from "@/lib/trips";

const statusConfig = {
  planned: { label: "已規劃", color: "bg-blue-500", icon: "📋" },
  wishlist: { label: "心願清單", color: "bg-amber-500", icon: "💭" },
  completed: { label: "已完成", color: "bg-emerald-500", icon: "✅" },
};

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const status = statusConfig[trip.status];
  const hasDetail = !!trip.detailDays;

  const card = (
    <div
      className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Cover Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${trip.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <span
            className={`${status.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}
          >
            {status.icon} {status.label}
          </span>
        </div>

        {/* Days Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
            {trip.days} 天
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="text-white/70 text-xs font-medium mb-1">
            {trip.country} · {trip.region}
          </div>
          <h3 className="text-white text-xl font-bold leading-tight mb-1">
            {trip.title}
          </h3>
          <p className="text-white/60 text-xs font-medium">
            {trip.titleEn}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-white dark:bg-slate-900/80">
        <p className="text-sm opacity-70 leading-relaxed mb-3 line-clamp-2">
          {trip.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {trip.highlights.slice(0, 3).map((h) => (
            <span
              key={h}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5"
            >
              {h}
            </span>
          ))}
          {trip.highlights.length > 3 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
              +{trip.highlights.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs opacity-50">
          <span>🎨 {trip.style}</span>
          <span>🗓️ {trip.bestSeason}</span>
        </div>

        {/* Hover arrow */}
        {hasDetail && (
          <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <span className="text-sm">→</span>
          </div>
        )}
      </div>
    </div>
  );

  if (hasDetail) {
    return <Link href={`/trips/${trip.slug}`}>{card}</Link>;
  }

  return card;
}
