import Image from "next/image";
import Link from "next/link";

export default function BlogFooter() {
  return (
    <footer className="border-t border-gray-200 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/inverted-logo.png"
              alt="BrickEx Logo"
              width={44}
              height={36}
              className="w-10 h-auto"
            />
            <div className="text-lg font-bold text-gray-900">BrickEx</div>
          </div>
          <nav className="flex items-center gap-6 sm:gap-4 text-sm text-gray-600">
            <Link
              href="/blog"
              className="min-h-[44px] flex items-center hover:text-gray-900 transition-colors active:text-gray-700"
            >
              Blog
            </Link>
            <Link
              href="/legal/privacy"
              className="min-h-[44px] flex items-center hover:text-gray-900 transition-colors active:text-gray-700"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/terms"
              className="min-h-[44px] flex items-center hover:text-gray-900 transition-colors active:text-gray-700"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:hello@brickex.co"
              className="min-h-[44px] flex items-center hover:text-gray-900 transition-colors active:text-gray-700"
            >
              Contact
            </a>
          </nav>
        </div>
        <div className="mt-8 text-center text-sm text-gray-600">
          © 2026 BrickEx
        </div>
      </div>
    </footer>
  );
}
