"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import { ArrowRight, Heart, Camera, Crown, Sparkles, Globe, Gem } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import { FlipWords } from "@/components/ui/flip-words";

const T =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/render/image/public/objects/seo-gallery";

function opt(slug: string, file: string) {
  return `${T}/${slug}/${file}.png?width=480&resize=contain&quality=80`;
}

const products: { title: string; link: string; thumbnail: string }[] = [
  // Row 1
  {
    title: "Yacht Life",
    link: "/ai-photos/yacht-life-aesthetic",
    thumbnail: opt("yacht-life-aesthetic", "champagne-toast-on-yacht-rail"),
  },
  {
    title: "Bugatti Chiron",
    link: "/ai-photos/bugatti-chiron-mansion",
    thumbnail: opt("bugatti-chiron-mansion", "chic-couple-stroll"),
  },
  {
    title: "Dubai Penthouse",
    link: "/ai-photos/dubai-penthouse",
    thumbnail: opt("dubai-penthouse", "wide-golden-hour-terrace-establishing"),
  },
  {
    title: "Private Jet",
    link: "/ai-photos/private-jet-interior",
    thumbnail: opt("adventurous-dating-photos", "private-jet-aisle-stroll"),
  },
  {
    title: "Rooftop Champagne",
    link: "/ai-photos/rooftop-champagne",
    thumbnail: opt("rooftop-champagne", "golden-hour-establishing-rooftop-bar"),
  },
  {
    title: "Maldives Villa",
    link: "/ai-photos/maldives-beach-villa",
    thumbnail: opt("maldives-beach-villa", "golden-hour-seaplane-arrival"),
  },
  {
    title: "Casino High Roller",
    link: "/ai-photos/casino-high-roller",
    thumbnail: opt("casino-high-roller", "intimate-portrait-baccarat-portrait"),
  },
  {
    title: "Bentley Continental",
    link: "/ai-photos/bentley-continental-gt",
    thumbnail: opt("bentley-continental-gt", "bentley-cocktail-hour"),
  },
  {
    title: "Bombardier Jet",
    link: "/ai-photos/bombardier-global-7500",
    thumbnail: opt("bombardier-global-7500", "boarding-private-terminal-sunset"),
  },
  // Row 2
  {
    title: "Dating Photos for Women",
    link: "/ai-photos/dating-photos-for-women",
    thumbnail: opt("dating-photos-for-women", "members-lounge-night-glamour-portrait"),
  },
  {
    title: "Ferrari SF90",
    link: "/ai-photos/ferrari-sf90-stradale",
    thumbnail: opt("ferrari-sf90-stradale", "ferrari-dawn-penthouse-view"),
  },
  {
    title: "Penthouse",
    link: "/ai-photos/penthouse-lifestyle",
    thumbnail: opt("penthouse-lifestyle", "afternoon-tea-opulence"),
  },
  {
    title: "Rolls Royce",
    link: "/ai-photos/rolls-royce-phantom",
    thumbnail: opt("rolls-royce-phantom", "golden-hour-phantom-promenade"),
  },
  {
    title: "Watch Collection",
    link: "/ai-photos/luxury-watch-collection",
    thumbnail: opt(
      "luxury-watch-collection",
      "penthouse-golden-hour-establishing",
    ),
  },
  {
    title: "Dating with Luxury Car",
    link: "/ai-photos/dating-photo-with-car",
    thumbnail: opt("dating-photo-with-car", "bentley-interior-sensual-portrait"),
  },
  {
    title: "Hotel Suite",
    link: "/ai-photos/hotel-suite",
    thumbnail: opt("hotel-suite", "blue-hour-bedroom-portrait"),
  },
  {
    title: "Champagne Lifestyle",
    link: "/ai-photos/champagne-lifestyle",
    thumbnail: opt("champagne-lifestyle", "champagne-poolside-retreat"),
  },
  {
    title: "New Money",
    link: "/ai-photos/new-money-aesthetic",
    thumbnail: opt("new-money-aesthetic", "champagne-rooftop-toasts"),
  },
  // Row 3
  {
    title: "AI Dating Photos",
    link: "/ai-photos/ai-dating-photos",
    thumbnail: opt("ai-dating-photos", "golden-hour-penthouse-terrace"),
  },
  {
    title: "Porsche",
    link: "/ai-photos/vintage-red-porsche",
    thumbnail: opt("vintage-red-porsche", "porsche-and-dapper-gentleman"),
  },
  {
    title: "Lamborghini",
    link: "/ai-photos/lamborghini-aventador",
    thumbnail: opt(
      "lamborghini-aventador",
      "exclusive-club-lamborghini-glamour",
    ),
  },
  {
    title: "Cash Room",
    link: "/ai-photos/room-filled-with-cash",
    thumbnail: opt("room-filled-with-cash", "penthouse-leather-armchair-wide"),
  },
  {
    title: "Shopping Spree",
    link: "/ai-photos/designer-shopping-spree",
    thumbnail: opt(
      "designer-shopping-spree",
      "bond-street-golden-hour-establishing",
    ),
  },
  {
    title: "Adventurous Dating",
    link: "/ai-photos/adventurous-dating-photos",
    thumbnail: opt("adventurous-dating-photos", "cliffside-helicopter-golden-hour"),
  },
  {
    title: "Mercedes AMG",
    link: "/ai-photos/mercedes-amg-gt",
    thumbnail: opt("mercedes-amg-gt", "golden-hour-yacht-circle-drive"),
  },
  {
    title: "Old Money Style",
    link: "/ai-photos/old-money-aesthetic",
    thumbnail: opt("old-money-aesthetic", "afternoon-lounge-refinement"),
  },
  {
    title: "Art Gallery",
    link: "/ai-photos/art-gallery-opening",
    thumbnail: opt("art-gallery-opening", "nighttime-valet-rolls-arrival-cinema"),
  },
  // Row 4
  {
    title: "Dark Luxury",
    link: "/ai-photos/dark-luxury-aesthetic",
    thumbnail: opt("dark-luxury-aesthetic", "dark-luxury-overhead-table"),
  },
  {
    title: "Gulfstream G700",
    link: "/ai-photos/gulfstream-g700-private-jet",
    thumbnail: opt(
      "gulfstream-g700-private-jet",
      "cabin-portrait-creative-direction",
    ),
  },
  {
    title: "Billionaire Life",
    link: "/ai-photos/billionaire-lifestyle",
    thumbnail: opt("billionaire-lifestyle", "champagne-deck-sunset-splendor"),
  },
  {
    title: "AI Tinder Photos",
    link: "/ai-photos/ai-tinder-photos",
    thumbnail: opt("ai-tinder-photos", "exclusive-yacht-club-evening"),
  },
  {
    title: "Private Chef",
    link: "/ai-photos/private-chef-dinner",
    thumbnail: opt(
      "private-chef-dinner",
      "penthouse-golden-hour-private-chef-establishing",
    ),
  },
  {
    title: "First Class",
    link: "/ai-photos/first-class-cabin",
    thumbnail: opt("first-class-cabin", "wide-golden-hour-establishing"),
  },
  {
    title: "Luxury Spa",
    link: "/ai-photos/luxury-spa-retreat",
    thumbnail: opt(
      "luxury-spa-retreat",
      "golden-hour-infinity-pool-establishing",
    ),
  },
  {
    title: "Wine Cellar",
    link: "/ai-photos/wine-cellar-tasting",
    thumbnail: opt("wine-cellar-tasting", "grand-entrance-golden-hour-establishing"),
  },
  {
    title: "London Mayfair",
    link: "/ai-photos/london-mayfair-townhouse",
    thumbnail: opt("london-mayfair-townhouse", "mayfair-townhouse-golden-hour-establishing"),
  },
  // Row 5
  {
    title: "Helicopter Arrival",
    link: "/ai-photos/helicopter-arrival",
    thumbnail: opt(
      "helicopter-arrival",
      "action-wind-blown-landing-silhouette",
    ),
  },
  {
    title: "AI Hinge Photos",
    link: "/ai-photos/ai-hinge-photos",
    thumbnail: opt("ai-hinge-photos", "evening-yacht-deck-portrait"),
  },
  {
    title: "Monte Carlo",
    link: "/ai-photos/monte-carlo-casino",
    thumbnail: opt(
      "monte-carlo-casino",
      "grand-entrance-dusk-roulette-arrival",
    ),
  },
  {
    title: "Santorini Villa",
    link: "/ai-photos/santorini-luxury-villa",
    thumbnail: opt("santorini-luxury-villa", "golden-hour-infinity-pool-hero"),
  },
  {
    title: "Miami Penthouse",
    link: "/ai-photos/miami-penthouse",
    thumbnail: opt(
      "miami-penthouse",
      "wide-golden-hour-penthouse-establishing",
    ),
  },
  {
    title: "Quiet Luxury",
    link: "/ai-photos/quiet-luxury-photos",
    thumbnail: opt("quiet-luxury-photos", "chic-cocktail-hour"),
  },
  {
    title: "Range Rover",
    link: "/ai-photos/range-rover-luxury",
    thumbnail: opt("range-rover-luxury", "range-rover-beachfront-estate"),
  },
  {
    title: "New York Penthouse",
    link: "/ai-photos/new-york-penthouse",
    thumbnail: opt("new-york-penthouse", "wide-golden-hour-terrace-establishing"),
  },
  {
    title: "Bali Infinity Pool",
    link: "/ai-photos/bali-infinity-pool",
    thumbnail: opt("bali-infinity-pool", "bali-golden-hour-establishing-cinema"),
  },
  // Row 6
  {
    title: "Pagani",
    link: "/ai-photos/pagani-on-tarmac",
    thumbnail: opt("pagani-on-tarmac", "dynamic-hero-driver"),
  },
  {
    title: "Desert Hypercars",
    link: "/ai-photos/desert-hypercars",
    thumbnail: opt("desert-hypercars", "close-up-ferrari-badge-desert"),
  },
  {
    title: "McLaren 720S",
    link: "/ai-photos/mclaren-720s",
    thumbnail: opt("mclaren-720s", "luxury-garage-exotic-wood"),
  },
  {
    title: "Aston Martin",
    link: "/ai-photos/aston-martin-db11",
    thumbnail: opt("aston-martin-db11", "cinematic-night-drive-aston-martin"),
  },
  {
    title: "BMW i8 Tiger",
    link: "/ai-photos/bmw-i8-with-tiger",
    thumbnail: opt("bmw-i8-with-tiger", "bmw-i8-closeup-detail"),
  },
  {
    title: "Helicopter Tour",
    link: "/ai-photos/helicopter-city-tour",
    thumbnail: opt(
      "helicopter-city-tour",
      "golden-hour-manhattan-doors-off-wide",
    ),
  },
  {
    title: "Old Money Mansion",
    link: "/ai-photos/old-money-mansion",
    thumbnail: opt("old-money-mansion", "antique-desk-watch-detail"),
  },
  {
    title: "Paris Suite",
    link: "/ai-photos/paris-luxury-suite",
    thumbnail: opt("paris-luxury-suite", "wide-golden-hour-terrace-eiffel-view"),
  },
  {
    title: "Beverly Hills",
    link: "/ai-photos/beverly-hills-mansion",
    thumbnail: opt("beverly-hills-mansion", "golden-hour-mansions-terrace-establishing"),
  },
  // Row 7
  {
    title: "Luxury Spa Retreat",
    link: "/ai-photos/luxury-spa-retreat",
    thumbnail: opt("luxury-spa-retreat", "intimate-window-portrait-brunello-cucinelli"),
  },
  {
    title: "Ibiza Yacht Party",
    link: "/ai-photos/ibiza-yacht-party",
    thumbnail: opt("ibiza-yacht-party", "wide-sunset-ibiza-establishing"),
  },
  {
    title: "Amalfi Coast Charter",
    link: "/ai-photos/amalfi-coast-charter",
    thumbnail: opt("amalfi-coast-charter", "bow-golden-hour-owner-view"),
  },
  {
    title: "Spa Plunge Pool",
    link: "/ai-photos/luxury-spa-retreat",
    thumbnail: opt("luxury-spa-retreat", "plunge-pool-twilight-portrait-leather"),
  },
  {
    title: "Ibiza DJ Set",
    link: "/ai-photos/ibiza-yacht-party",
    thumbnail: opt("ibiza-yacht-party", "dj-blue-hour-worms-eye"),
  },
  {
    title: "Amalfi Sunset Sipping",
    link: "/ai-photos/amalfi-coast-charter",
    thumbnail: opt("amalfi-coast-charter", "aft-terrace-sunset-sipping-dom-perignon"),
  },
  {
    title: "Spa Cliffside Sunrise",
    link: "/ai-photos/luxury-spa-retreat",
    thumbnail: opt("luxury-spa-retreat", "aerial-infinity-cliffside-sunrise"),
  },
  // Row 8
  {
    title: "Ibiza Sundeck",
    link: "/ai-photos/ibiza-yacht-party",
    thumbnail: opt("ibiza-yacht-party", "golden-hour-sundeck-portrait"),
  },
  {
    title: "Amalfi Pool Deck",
    link: "/ai-photos/amalfi-coast-charter",
    thumbnail: opt("amalfi-coast-charter", "overhead-pool-deck-couple-lounge"),
  },
  {
    title: "Spa Candlelight",
    link: "/ai-photos/luxury-spa-retreat",
    thumbnail: opt("luxury-spa-retreat", "members-lounge-candlelight-couple-evening"),
  },
  {
    title: "Ibiza Yacht Owner",
    link: "/ai-photos/ibiza-yacht-party",
    thumbnail: opt("ibiza-yacht-party", "owner-interior-club-chair-portrait"),
  },
  {
    title: "Amalfi Night Stern",
    link: "/ai-photos/amalfi-coast-charter",
    thumbnail: opt("amalfi-coast-charter", "stern-night-cristal-cigar-mood"),
  },
  {
    title: "Ibiza Aft Dining",
    link: "/ai-photos/ibiza-yacht-party",
    thumbnail: opt("ibiza-yacht-party", "intimate-aft-dining-duo"),
  },
  {
    title: "Amalfi Salon Portrait",
    link: "/ai-photos/amalfi-coast-charter",
    thumbnail: opt("amalfi-coast-charter", "interior-salon-low-angle-owner-speech"),
  },
  {
    title: "Monaco Harbor",
    link: "/ai-photos/monaco-yacht-harbor",
    thumbnail: opt("monaco-yacht-harbor", "wide-golden-hour-harbor-panorama"),
  },
  {
    title: "Superyacht Deck",
    link: "/ai-photos/superyacht-deck",
    thumbnail: opt("superyacht-deck", "golden-hour-aft-terrace-establishing"),
  },
  // Row 9
  {
    title: "Bentley Continental",
    link: "/ai-photos/bentley-continental-gt",
    thumbnail: opt("bentley-continental-gt", "bentley-cocktail-hour"),
  },
  {
    title: "Bombardier Private Jet",
    link: "/ai-photos/bombardier-global-7500",
    thumbnail: opt("bombardier-global-7500", "boarding-private-terminal-sunset"),
  },
  {
    title: "Champagne Lifestyle",
    link: "/ai-photos/champagne-lifestyle",
    thumbnail: opt("champagne-lifestyle", "champagne-poolside-retreat"),
  },
  {
    title: "New Money Aesthetic",
    link: "/ai-photos/new-money-aesthetic",
    thumbnail: opt("new-money-aesthetic", "champagne-rooftop-toasts"),
  },
  {
    title: "Tunnel Car Shot",
    link: "/ai-photos/night-luxury-car-tunnel",
    thumbnail: opt("night-luxury-car-tunnel", "bugatti-veyron-tunnel-momentum"),
  },
  {
    title: "Old Money Aesthetic",
    link: "/ai-photos/old-money-aesthetic",
    thumbnail: opt("old-money-aesthetic", "afternoon-lounge-refinement"),
  },
  {
    title: "Art Gallery Opening",
    link: "/ai-photos/art-gallery-opening",
    thumbnail: opt("art-gallery-opening", "nighttime-valet-rolls-arrival-cinema"),
  },
  {
    title: "Megayacht Helipad",
    link: "/ai-photos/megayacht-helipad",
    thumbnail: opt("megayacht-helipad", "overhead-dusk-female-hero"),
  },
  {
    title: "Yacht Sunset",
    link: "/ai-photos/yacht-sunset-cruise",
    thumbnail: opt("yacht-sunset-cruise", "bow-golden-hour-hero"),
  },
  // Row 10
  {
    title: "Wine Cellar Tasting",
    link: "/ai-photos/wine-cellar-tasting",
    thumbnail: opt("wine-cellar-tasting", "grand-entrance-golden-hour-establishing"),
  },
  {
    title: "London Mayfair",
    link: "/ai-photos/london-mayfair-townhouse",
    thumbnail: opt("london-mayfair-townhouse", "mayfair-townhouse-golden-hour-establishing"),
  },
  {
    title: "New York Penthouse",
    link: "/ai-photos/new-york-penthouse",
    thumbnail: opt("new-york-penthouse", "wide-golden-hour-terrace-establishing"),
  },
  {
    title: "Bali Infinity Pool",
    link: "/ai-photos/bali-infinity-pool",
    thumbnail: opt("bali-infinity-pool", "bali-golden-hour-establishing-cinema"),
  },
  {
    title: "Paris Luxury Suite",
    link: "/ai-photos/paris-luxury-suite",
    thumbnail: opt("paris-luxury-suite", "wide-golden-hour-terrace-eiffel-view"),
  },
  {
    title: "Beverly Hills Mansion",
    link: "/ai-photos/beverly-hills-mansion",
    thumbnail: opt("beverly-hills-mansion", "golden-hour-mansions-terrace-establishing"),
  },
  {
    title: "Lake Como Villa",
    link: "/ai-photos/lake-como-villa",
    thumbnail: opt("lake-como-villa", "golden-hour-terrace-wide-cinema"),
  },
  {
    title: "Mediterranean Sailing",
    link: "/ai-photos/mediterranean-sailing",
    thumbnail: opt("mediterranean-sailing", "wide-midday-azure-bow-establishing"),
  },
  {
    title: "Jet Setter",
    link: "/ai-photos/jet-setter-photos",
    thumbnail: opt("jet-setter-photos", "exclusive-club-dinner"),
  },
  // Row 11
  {
    title: "Swiss Chalet Alps",
    link: "/ai-photos/swiss-chalet-alps",
    thumbnail: opt("swiss-chalet-alps", "chalet-terrace-golden-hour-establishing"),
  },
  {
    title: "Monaco Yacht Harbor",
    link: "/ai-photos/monaco-yacht-harbor",
    thumbnail: opt("monaco-yacht-harbor", "wide-golden-hour-harbor-panorama"),
  },
  {
    title: "Superyacht Deck",
    link: "/ai-photos/superyacht-deck",
    thumbnail: opt("superyacht-deck", "golden-hour-aft-terrace-establishing"),
  },
  {
    title: "Megayacht Helipad",
    link: "/ai-photos/megayacht-helipad",
    thumbnail: opt("megayacht-helipad", "overhead-dusk-female-hero"),
  },
  {
    title: "Yacht Sunset Cruise",
    link: "/ai-photos/yacht-sunset-cruise",
    thumbnail: opt("yacht-sunset-cruise", "bow-golden-hour-hero"),
  },
  {
    title: "Mediterranean Sailing",
    link: "/ai-photos/mediterranean-sailing",
    thumbnail: opt("mediterranean-sailing", "wide-midday-azure-bow-establishing"),
  },
  {
    title: "Jet Setter",
    link: "/ai-photos/jet-setter-photos",
    thumbnail: opt("jet-setter-photos", "exclusive-club-dinner"),
  },
  {
    title: "Dark Luxury",
    link: "/ai-photos/dark-luxury-aesthetic",
    thumbnail: opt("dark-luxury-aesthetic", "dark-luxury-overhead-table"),
  },
  {
    title: "Gulfstream G700",
    link: "/ai-photos/gulfstream-g700-private-jet",
    thumbnail: opt("gulfstream-g700-private-jet", "cabin-portrait-creative-direction"),
  },
];

function ProductCard({
  product,
  translate,
}: {
  product: (typeof products)[0];
  translate?: MotionValue<number>;
}) {
  return (
    <motion.div
      style={translate ? { x: translate } : undefined}
      whileHover={{ y: -12 }}
      className="group/product h-48 w-[16rem] sm:h-56 sm:w-[20rem] relative shrink-0"
    >
      <a href={product.link} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          height="224"
          width="320"
          className="object-cover object-center absolute h-full w-full inset-0 rounded-lg"
          alt={product.title}
          loading="lazy"
          decoding="async"
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-70 bg-black pointer-events-none rounded-lg transition-opacity duration-300" />
      <h2 className="absolute bottom-3 left-3 opacity-0 group-hover/product:opacity-100 text-white text-xs font-medium transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  );
}

export default function HeroParallaxSection() {
  const signupUrl = getSignupUrl();
  const rows = [
    products.slice(0, 9),
    products.slice(9, 18),
    products.slice(18, 27),
    products.slice(27, 36),
    products.slice(36, 45),
    products.slice(45, 54),
    products.slice(54, 63),
    products.slice(63, 72),
    products.slice(72, 81),
    products.slice(81, 90),
    products.slice(90, 99),
  ];
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig,
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig,
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig,
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig,
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig,
  );
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? -1450 : -700, isMobile ? 110 : 0]),
    springConfig,
  );

  return (
    <div
      ref={ref}
      className="h-[280vh] sm:h-[220vh] lg:h-[180vh] pt-2 sm:pt-10 pb-10 sm:pb-20 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
      style={{ position: "relative" }}
    >
      {/* Hero Content */}
      <div className="max-w-7xl relative mx-auto pt-6 md:pt-10 pb-4 px-4 sm:px-6 w-full left-0 top-0 z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          {/* Left: Copy */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
                Look Rich in Seconds
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-neutral-400 max-w-lg leading-relaxed">
              Upload a selfie and instantly generate luxury lifestyle photos — yachts, jets, supercars, penthouses. No studio, no photographer, no travel.
            </p>

            <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-2.5 text-sm sm:text-base">
              <p className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">Upload your selfies → Create an AI model of yourself</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">Generate luxury lifestyle photos — yachts, jets, supercars</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">100+ luxury scenes — Monaco, Dubai, Maldives, and more</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Gem className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">Rolex, Hermès, Ferrari, Bugatti — no renting needed</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">AI Dating Photos, Tinder, Bumble, Hinge — get more matches</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-yellow-300 shrink-0" />
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">Flex Worth leaderboard — compete with other creators</span>
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-base">🌟</span>
              <span className="text-sm sm:text-base bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent font-semibold">
                5,303,522 photos generated
              </span>
            </div>
          </div>

          {/* Right: Signup box */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = signupUrl;
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  placeholder="Type your email..."
                  className="w-full h-12 px-4 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
                />
                <a
                  href={signupUrl}
                  className="flex w-full py-3 h-12 rounded-lg bg-white text-black font-semibold text-sm text-center transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] items-center justify-center gap-2 shadow-lg shadow-white/10"
                >
                  Start Looking Your Best
                  <ArrowRight className="w-4 h-4" />
                </a>
              </form>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-800" />
                <span className="text-xs text-neutral-500">or</span>
                <div className="h-px flex-1 bg-neutral-800" />
              </div>

              <a
                href={signupUrl}
                className="mt-4 flex w-full py-3 h-12 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-medium text-sm text-center transition-all hover:bg-neutral-700 items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </a>

              <p className="mt-3 text-[10px] text-neutral-600 text-center">
                If you already have an account, we&apos;ll log you in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parallax image rows with seamless marquee loop */}
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }} className="-mt-16 sm:mt-0 flex flex-col">
        {/* Subheadline on top of the images — "Trusted by top [rotating word]" */}
        <div className="flex justify-center items-center py-2 sm:py-10 mb-1 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
              Trusted by top
            </span>{" "}
            <FlipWords
              words={["Creators", "Celebrities", "Brands", "Agencies", "Marketers"]}
              duration={2500}
              className="bg-gradient-to-b from-fuchsia-400 via-pink-400 to-rose-500 bg-clip-text text-transparent"
            />
          </h2>
        </div>
        {rows.map((row, i) => {
          const isReversed = i % 2 === 0;
          const translate = isReversed ? translateX : translateXReverse;
          const driftDirection = isReversed ? "drift-left" : "drift-right";
          const marqueeDirection = isReversed ? "marquee-left" : "marquee-right";
          const doubled = [...row, ...row];

          if (!isMobile) {
            return (
              <motion.div
                key={i}
                className={`flex ${isReversed ? "flex-row-reverse space-x-reverse" : "flex-row"} space-x-3 mb-3`}
                style={{
                  animation: `${driftDirection} ${30 + i * 5}s linear infinite`,
                }}
              >
                {doubled.map((product, j) => (
                  <ProductCard
                    product={product}
                    translate={translate}
                    key={`${product.title}-${j}`}
                  />
                ))}
              </motion.div>
            );
          }

          return (
            <div key={i} className="relative overflow-hidden mb-3">
              <motion.div
                className="flex w-max will-change-transform"
                style={{
                  animation: `${marqueeDirection} ${30 + i * 5}s linear infinite`,
                }}
              >
                {[0, 1].map((copyIndex) => (
                  <div
                    key={copyIndex}
                    className={`flex ${isReversed ? "flex-row-reverse" : "flex-row"} gap-3 pr-3 shrink-0`}
                  >
                    {row.map((product, j) => (
                      <ProductCard
                        product={product}
                        key={`${copyIndex}-${product.title}-${j}`}
                      />
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <style jsx>{`
        @keyframes drift-left {
          0% { transform: translateX(0); }
          50% { transform: translateX(-150px); }
          100% { transform: translateX(0); }
        }
        @keyframes drift-right {
          0% { transform: translateX(0); }
          50% { transform: translateX(150px); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
