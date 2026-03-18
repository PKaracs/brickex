"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSignupUrl } from "@/lib/app-url";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const signupUrl = getSignupUrl();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-neutral-950/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Image
              src="/brickex-logo.png"
              alt="BrickEx Logo"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9"
              priority
            />
            <span className="text-xl sm:text-2xl font-bold text-white leading-none">
              BrickEx
            </span>
          </a>

          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="/blog"
              className="hidden sm:inline-flex text-sm text-zinc-300 hover:text-white transition-colors"
            >
              Blog
            </a>
            <a
              href="/ideas"
              className="hidden sm:inline-flex text-sm text-zinc-300 hover:text-white transition-colors"
            >
              Ideas
            </a>
            <Button
              variant="white"
              size="sm"
              className="px-3 sm:px-5 py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm font-medium"
              asChild
            >
              <a href={signupUrl}>Start Free</a>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
