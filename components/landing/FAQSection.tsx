"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQ_DATA } from "@/components/landing/faq-data";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative">
      <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden transition-all duration-200 hover:border-neutral-700/80">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 text-left min-h-[56px] active:bg-zinc-800/30 transition-colors"
        >
          <span className="text-xs sm:text-sm font-medium text-zinc-200">
            {question}
          </span>
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-center justify-center transition-colors group-hover:bg-zinc-900 group-hover:border-zinc-700">
            {isOpen ? (
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            )}
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-500 leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/30 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3">
            FAQs
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Questions? We got answers.
            </span>
          </h2>
        </div>

        {/* FAQ grid - single column on mobile, two on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {FAQ_DATA.map((item, index) => (
            <div key={index}>
              <FAQItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
