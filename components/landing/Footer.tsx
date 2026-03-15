import Image from "next/image";
import Link from "next/link";

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
            <Link
              href="/ideas"
              className="min-h-[44px] flex items-center hover:text-white transition-colors active:text-zinc-200"
            >
              Ideas
            </Link>
            <a
              href="mailto:hello@brickex.co"
              className="min-h-[44px] flex items-center hover:text-white transition-colors active:text-zinc-200"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-8 text-center text-sm text-zinc-400">
          © 2026 BrickEx
        </div>
      </div>
    </footer>
  );
}
