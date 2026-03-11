import { Separator } from "@/components/ui/separator";

export default function HeroQuote() {
  return (
    <div className="relative w-full">
      <Separator className="bg-neutral-800" />
      <section className="py-12 sm:py-16 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto">
        <blockquote className="max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-medium text-neutral-300 leading-relaxed italic">
            "My ex thought I moved to Dubai. I moved to my parents' basement. He
            didn't know I was using BrickEx..."
          </p>
          <footer className="mt-4 text-sm text-neutral-500 font-medium">
            — Overheard in a Miami airport lounge
          </footer>
        </blockquote>
      </section>
      <Separator className="bg-neutral-800" />
    </div>
  );
}
