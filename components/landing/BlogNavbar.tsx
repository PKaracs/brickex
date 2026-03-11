"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSignupUrl } from "@/lib/app-url";
import { Button } from "@/components/ui/button";
import { getPublicAssetUrl } from "@/lib/utils/storage";

export default function BlogNavbar() {
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
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-200"
          : "bg-white"
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
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              BrickEx
            </span>
          </a>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Blog Link */}
            <a
              href="/blog"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Blog
            </a>

            {/* CTA Button */}
            <Button
              size="sm"
              className="px-5 py-2.5 min-h-[44px] text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
              asChild
            >
              <a href={signupUrl}>Get Started</a>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}

