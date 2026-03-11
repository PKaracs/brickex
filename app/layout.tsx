import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../styles/globals.css";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { MetaPixel } from "@/lib/meta-pixel";
import { TikTokPixel } from "@/lib/tiktok-pixel";
import { JsonLd } from "@/components/seo/json-ld";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ],
  variable: "--font-dm-sans",
});

// Viewport config (separate export in Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // For iPhone notch/Dynamic Island
};

export const metadata: Metadata = {
  title: {
    default: "BrickEx - AI Visualization for Real Estate",
    template: "%s | BrickEx",
  },
  description:
    "Transform architectural plans, sketches, and 3D models into photorealistic renders with AI. Create marketing-ready visualizations in minutes, not weeks.",
  keywords: [
    "AI rendering",
    "real estate visualization",
    "architectural rendering",
    "AI image generator",
    "property visualization",
    "3D rendering",
  ],
  authors: [{ name: "BrickEx" }],
  creator: "BrickEx",
  publisher: "BrickEx",
  metadataBase: new URL("https://richflex.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://richflex.co",
    siteName: "BrickEx",
    title: "BrickEx - AI Visualization for Real Estate",
    description:
      "Transform architectural plans into photorealistic renders with AI.",
    images: [
      {
        url: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Capture-2026-01-24-165455.png",
        width: 1200,
        height: 630,
        alt: "BrickEx - AI-Powered Real Estate Visualization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrickEx - AI Visualization for Real Estate",
    description:
      "Transform architectural plans into photorealistic renders with AI.",
    images: [
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Capture-2026-01-24-165455.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BrickEx",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/brickex-logo.png",
    apple: "/brickex-logo.png",
    shortcut: "/brickex-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = "https://richflex.co";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BrickEx",
    url: baseUrl,
    logo: `${baseUrl}/brickex-logo.png`,
    email: "hello@brickex.com",
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BrickEx",
    url: baseUrl,
  };

  return (
    <html lang="en">
      <head>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <Script
          src="https://cdn.seline.com/seline.js"
          data-token="0d89fd8b4ef2fd2"
          strategy="afterInteractive"
        />
        {/* UserJot SDK Loader */}
        <Script id="userjot-loader" strategy="afterInteractive">
          {`window.$ujq=window.$ujq||[];window.uj=window.uj||new Proxy({},{get:(_,p)=>(...a)=>window.$ujq.push([p,...a])});document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://cdn.userjot.com/sdk/v2/uj.js',type:'module',async:!0}));`}
        </Script>
        {/* UserJot Configuration - widget disabled, only opens via Support button */}
        <Script id="userjot-config" strategy="afterInteractive">
          {`window.uj.init('cmj1dvd9h05o616s4i1sdl59u', { widget: false, theme: 'dark' });`}
        </Script>
        {/* Crisp Chat - widget hidden by default, opens on demand */}
        <Script id="crisp-chat" strategy="afterInteractive">
          {`window.$crisp=window.$crisp||[];window.CRISP_WEBSITE_ID="d4ba7351-3dbf-4179-afe1-aa5751827fd1";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();window.$crisp.push(["safe",true]);window.$crisp.push(["do","chat:hide"]);`}
        </Script>
      </head>
      <body className={`${dmSans.variable} font-sans`}>
        <MetaPixel />
        <TikTokPixel />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
