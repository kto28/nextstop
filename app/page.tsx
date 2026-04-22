import { trips } from "@/lib/trips";
import { TripCard } from "@/components/TripCard";
import { WorldMap } from "@/components/WorldMap";

export default function Home() {
  const planned = trips.filter((t) => t.status === "planned");
  const wishlist = trips.filter((t) => t.status === "wishlist");
  const completed = trips.filter((t) => t.status === "completed");

  const stats = {
    total: trips.length,
    planned: planned.length,
    wishlist: wishlist.length,
    completed: completed.length,
    totalDays: trips.reduce((sum, t) => sum + t.days, 0),
    countries: new Set(trips.map((t) => t.country)).size,
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[var(--background)]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="animate-float">✈️</span>
              我的旅行心願清單
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-[1.1] mb-4 max-w-2xl">
              Nextstop
              <br />
              <span className="text-white/70 text-2xl sm:text-3xl font-semibold">
                下一站，去哪裡？
              </span>
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              收集世界上最想去的地方，標記每一趟未來的旅程。總有一天，會出發。
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl animate-fade-in-up delay-300">
            {[
              { label: "目的地", value: stats.total, icon: "📍" },
              { label: "已規劃", value: stats.planned, icon: "📋" },
              { label: "國家", value: stats.countries, icon: "🌍" },
              { label: "總天數", value: stats.totalDays, icon: "📅" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 text-white"
              >
                <div className="text-xs opacity-60 mb-1">
                  {s.icon} {s.label}
                </div>
                <div className="text-2xl font-extrabold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map */}
      <WorldMap trips={trips} />

      {/* Trip Grid */}
      <section id="trips" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Planned */}
        {planned.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span>📋</span> 已規劃行程 <span className="text-base font-normal opacity-40">({planned.length})</span>
            </h2>
            <p className="text-sm opacity-50 mb-8">有詳細行程的旅行計劃，點擊查看完整路線</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {planned.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span>💭</span> 心願清單 <span className="text-base font-normal opacity-40">({wishlist.length})</span>
            </h2>
            <p className="text-sm opacity-50 mb-8">總有一天會去的地方</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span>✅</span> 已完成 <span className="text-base font-normal opacity-40">({completed.length})</span>
            </h2>
            <p className="text-sm opacity-50 mb-8">走過的路，看過的風景</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
