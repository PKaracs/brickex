"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, Gift, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextMondayReset(): Date {
  const now = new Date();
  const utcNow = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    )
  );

  // Find next Monday at 5:00 AM UTC (= 12:00 AM midnight New York EST)
  const dayOfWeek = utcNow.getUTCDay();
  let daysUntilMonday = (8 - dayOfWeek) % 7;

  if (dayOfWeek === 1) {
    const currentHour = utcNow.getUTCHours();
    if (currentHour >= 5) {
      // Past midnight NY time, next Monday is 7 days away
      daysUntilMonday = 7;
    } else {
      daysUntilMonday = 0;
    }
  }

  const nextReset = new Date(utcNow);
  nextReset.setUTCDate(utcNow.getUTCDate() + daysUntilMonday);
  nextReset.setUTCHours(5, 0, 0, 0); // 5 AM UTC = Midnight New York

  return nextReset;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-11 h-11 md:w-14 md:h-14 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center">
        <span className="font-mono text-lg md:text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] md:text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

const WINNER_PERKS = [
  {
    icon: Gift,
    title: "Custom Object",
    description: "Request any luxury item to add",
  },
  {
    icon: Star,
    title: "Named Pack",
    description: "Pack with your name for a week",
  },
  {
    icon: Sparkles,
    title: "Feature Request",
    description: "Priority on your feature idea",
  },
];

interface WeeklyCountdownProps {
  className?: string;
}

export function WeeklyCountdown({ className }: WeeklyCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  const nextReset = useMemo(() => getNextMondayReset(), []);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(nextReset));

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(nextReset);
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextReset]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-neutral-900 border border-neutral-800",
        className
      )}
    >
      {/* Header + Countdown */}
      <div className="px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400" />
            <span className="text-xs md:text-sm font-medium text-white">
              Weekly Competition
            </span>
          </div>
          <span className="text-[10px] md:text-xs text-neutral-500">
            Ends Mon 12AM ET
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 md:gap-2">
          <TimeUnit value={timeLeft.days} label="Days" />
          <span className="text-lg md:text-xl text-neutral-600 font-light mt-[-16px] md:mt-[-20px]">
            :
          </span>
          <TimeUnit value={timeLeft.hours} label="Hrs" />
          <span className="text-lg md:text-xl text-neutral-600 font-light mt-[-16px] md:mt-[-20px]">
            :
          </span>
          <TimeUnit value={timeLeft.minutes} label="Min" />
          <span className="text-lg md:text-xl text-neutral-600 font-light mt-[-16px] md:mt-[-20px]">
            :
          </span>
          <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
      </div>

      {/* Prizes */}
      <div className="px-3 md:px-4 pb-3 md:pb-4 pt-1">
        <p className="hidden md:block text-[10px] text-neutral-600 mb-2 uppercase tracking-wider">
          Winner Rewards
        </p>

        {/* Mobile: compact icons */}
        <div className="flex gap-1.5 md:hidden">
          {WINNER_PERKS.map((perk) => (
            <div
              key={perk.title}
              className="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-md bg-neutral-800/50 border border-neutral-800"
            >
              <perk.icon className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[10px] text-neutral-400 text-center leading-tight">
                {perk.title}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop: with descriptions */}
        <div className="hidden md:block space-y-1.5">
          {WINNER_PERKS.map((perk) => (
            <div
              key={perk.title}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-800"
            >
              <perk.icon className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-sm text-white">{perk.title}</span>
                <span className="text-xs text-neutral-500 ml-2">
                  — {perk.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
