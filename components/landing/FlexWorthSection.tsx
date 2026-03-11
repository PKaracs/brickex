"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Crown, Flame } from "lucide-react";

// Fake leaderboard data
const leaderboardData = [
  {
    rank: 1,
    name: "alex_rich",
    avatar: "A",
    flexWorth: "$847.2M",
    change: "+$12.4M",
    isTop: true,
  },
  {
    rank: 2,
    name: "luxe_life",
    avatar: "L",
    flexWorth: "$623.8M",
    change: "+$8.1M",
    isTop: false,
  },
  {
    rank: 3,
    name: "flex_king",
    avatar: "F",
    flexWorth: "$541.3M",
    change: "+$15.7M",
    isTop: false,
  },
  {
    rank: 4,
    name: "money_moves",
    avatar: "M",
    flexWorth: "$428.9M",
    change: "+$3.2M",
    isTop: false,
  },
  {
    rank: 5,
    name: "yacht_boy",
    avatar: "Y",
    flexWorth: "$312.5M",
    change: "+$22.1M",
    isTop: false,
  },
];

function LeaderboardRow({
  rank,
  name,
  avatar,
  flexWorth,
  change,
  isTop,
}: (typeof leaderboardData)[0]) {
  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-xl transition-all duration-300 ${
        isTop
          ? "bg-zinc-800/50 border border-zinc-700/50"
          : "bg-zinc-900/40 border border-zinc-800/30"
      }`}
    >
      {/* Rank */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
          rank === 1
            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black"
            : rank === 2
              ? "bg-gradient-to-br from-zinc-300 to-zinc-400 text-black"
              : rank === 3
                ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100"
                : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {rank}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 ${
            isTop
              ? "bg-gradient-to-br from-amber-500/20 to-amber-700/20 text-amber-400 border border-amber-600/30"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
          }`}
        >
          {avatar}
        </div>
        <div className="min-w-0">
          <p
            className={`font-medium truncate text-sm sm:text-base ${isTop ? "text-amber-100" : "text-zinc-200"}`}
          >
            @{name}
          </p>
          {isTop && (
            <div className="flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
              <span className="text-[9px] sm:text-[10px] text-amber-500/80 uppercase tracking-wider font-medium">
                Top Flexer
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Flex Worth */}
      <div className="text-right flex-shrink-0">
        <p
          className={`font-semibold text-sm sm:text-base ${isTop ? "text-amber-100" : "text-zinc-100"}`}
        >
          {flexWorth}
        </p>
        <div className="flex items-center justify-end gap-0.5 text-emerald-500">
          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="text-[10px] sm:text-xs">{change}</span>
        </div>
      </div>
    </div>
  );
}

export default function FlexWorthSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Subtle background separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 lg:mb-20 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Track your Flex Worth.
            </span>
          </h2>
          <p className="text-zinc-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            After each generation, you get a Flex Worth score. Compete weekly to
            receive prizes that actually contribute your real net worth.
          </p>
        </div>

        {/* Value proposition badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-12 px-2">
          {[
            { emoji: "🚗", label: "Cars" },
            { emoji: "🛩", label: "Jets" },
            { emoji: "⛵", label: "Yachts" },
            { emoji: "🏡", label: "Villas" },
            { emoji: "⌚", label: "Watches" },
            { emoji: "🌍", label: "Locations" },
            { emoji: "🎒", label: "Accessories" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/50"
            >
              <span className="text-sm">{item.emoji}</span>
              <span className="text-xs font-medium text-zinc-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Flex Worth Display */}
          <div>
            <Card className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
              <CardContent className="p-6 sm:p-8 lg:p-10">
                {/* Your Flex Worth label */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider">
                    Your Flex Worth
                  </span>
                </div>

                {/* Big Number */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-clip-text text-transparent">
                      $12.4M
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                    <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                      <span className="text-xs sm:text-sm font-medium text-emerald-400">
                        +$2.1M today
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-zinc-500">
                      Rank #847
                    </span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3">
                    Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { label: "Vehicles", value: "$8.2M", icon: "🚗" },
                      { label: "Properties", value: "$3.1M", icon: "🏠" },
                      { label: "Watches", value: "$680K", icon: "⌚" },
                      { label: "Jets & Yachts", value: "$420K", icon: "✈️" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                      >
                        <span className="text-base sm:text-lg">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-[10px] sm:text-xs text-zinc-500">
                            {item.label}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Leaderboard */}
          <div>
            <Card className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
              <CardContent className="p-6 sm:p-8">
                {/* Leaderboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Leaderboard</h3>
                      <p className="text-xs text-zinc-500">
                        Dethrone the fake rich
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/40">
                    <span className="text-xs font-medium text-zinc-400">
                      Global
                    </span>
                  </div>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-2">
                  {leaderboardData.map((entry) => (
                    <LeaderboardRow key={entry.rank} {...entry} />
                  ))}
                </div>

                {/* View Full Leaderboard hint */}
                <div className="mt-5 pt-4 border-t border-zinc-800/50 text-center">
                  <p className="text-sm text-zinc-500">
                    Compete with{" "}
                    <span className="text-zinc-300 font-medium">12,847</span>{" "}
                    flexers worldwide
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
