import Image from "next/image";
import Link from "next/link";
import { getPublicAssetUrl } from "@/lib/utils/storage";
import { Instagram, Youtube } from "lucide-react";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import {
  allSeoPages,
  getPagesByCategory,
  PAGE_CATEGORY_ORDER,
  PAGE_CATEGORY_LABELS,
} from "@/lib/constants/seo-pages-loader";
import { FAQ_DATA_V2 } from "./faq-data-v2";

export default function ExpandedFooter() {
  return (
    <footer className="border-t border-zinc-800 pt-12 sm:pt-16 pb-8 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/brickex-logo.png"
                alt="BrickEx Logo"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <div className="text-lg font-bold text-white">BrickEx</div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              The first AI luxury photo generator. Upload a selfie and get
              photorealistic luxury lifestyle photos in seconds.
            </p>
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} BrickEx
            </p>

            {/* Social */}
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://www.instagram.com/richflex_co/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@richflexco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@richflex_co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/rothbuilds"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shot with BrickEx — all scene links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-4">
              Shot with BrickEx
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {PAGE_CATEGORY_ORDER.map((category) => {
                const pages = getPagesByCategory(category);
                if (pages.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">
                      {PAGE_CATEGORY_LABELS[category]}
                    </p>
                    <ul className="space-y-0.5">
                      {pages.map((page) => (
                        <li key={page.slug}>
                          <Link
                            href={`/ai-photos/${page.slug}`}
                            className="text-xs text-zinc-400 hover:text-white transition-colors leading-relaxed"
                          >
                            {page.content.headline}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Pages */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Pages</h4>
            <ul className="space-y-2">
              {[
                { label: "AI Photos", href: "/ai-photos" },
                { label: "Blog", href: "/blog" },
                { label: "Sign up / Log in", href: "https://app.richflex.co/login" },
                { label: "Gallery", href: "/ai-photos" },
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:hello@richflex.co"
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: FAQ */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">FAQ</h4>
            <ul className="space-y-2">
              {FAQ_DATA_V2.slice(0, 12).map((item, i) => (
                <li key={i}>
                  <Link
                    href="#faq"
                    className="text-xs text-zinc-400 hover:text-white transition-colors leading-relaxed line-clamp-1"
                  >
                    {item.question}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-[10px] text-zinc-600">
            BrickEx is an AI photo generator. All photos are AI-generated. BrickEx is not affiliated with any luxury brands shown in scenes.
          </p>
        </div>
      </div>
    </footer>
  );
}
