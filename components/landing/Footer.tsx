import Image from "next/image";
import Link from "next/link";
import { getPublicAssetUrl } from "@/lib/utils/storage";
import { Instagram, Youtube } from "lucide-react";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brickex-logo.png"
              alt="BrickEx Logo"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <div className="text-lg font-bold text-white">BrickEx</div>
          </div>
          <nav className="flex items-center gap-6 sm:gap-4 text-sm text-zinc-400 flex-wrap justify-center">
            <Link
              href="/legal/privacy"
              className="min-h-[44px] flex items-center hover:text-white transition-colors active:text-zinc-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/terms"
              className="min-h-[44px] flex items-center hover:text-white transition-colors active:text-zinc-200"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:hello@richflex.co"
              className="min-h-[44px] flex items-center hover:text-white transition-colors active:text-zinc-200"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <a
            href="https://www.instagram.com/richflex_co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://www.tiktok.com/@richflexco"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="TikTok"
          >
            <FaTiktok className="w-6 h-6" />
          </a>
          <a
            href="https://www.youtube.com/@richflex_co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="w-6 h-6" />
          </a>
          <a
            href="https://x.com/rothbuilds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="X (Twitter)"
          >
            <FaXTwitter className="w-6 h-6" />
          </a>
        </div>

        <div className="mt-8 text-center text-sm text-zinc-400">
          © 2026 BrickEx
        </div>
      </div>
    </footer>
  );
}
