import { CheckCircle } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  tagline: string;
  features: string[];
  ctaText: string;
  href: string;
  isPopular?: boolean;
}

export default function PricingCard({
  name,
  price,
  tagline,
  features,
  ctaText,
  href,
  isPopular = false,
}: PricingCardProps) {
  return (
    <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
      <div className="p-8 flex flex-col h-full">
        {isPopular && (
          <div className="inline-block px-3 py-1 rounded-full bg-white text-black text-xs font-medium mb-4 w-fit">
            Most Popular
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <p className="text-sm text-zinc-400">{tagline}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-white">${price}</span>
            <span className="text-zinc-400">/mo</span>
          </div>
        </div>

        <ul className="space-y-3 flex-grow mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={href}
          className="w-full px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors text-sm text-center"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
