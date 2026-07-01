"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSignupUrl } from "@/lib/app-url";
import { Button } from "@/components/ui/button";

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
              src="/inverted-logo.png"
              alt="Logo de BrickEx"
              width={44}
              height={36}
              className="w-9 h-auto sm:w-10"
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
              <a href={signupUrl}>Empezar</a>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
