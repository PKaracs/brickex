"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "My ex thought I moved to Dubai. I moved to my parents' basement. Richflex hits different.",
    name: "Jake M.",
    handle: "@flexin_jake",
    initials: "JM",
  },
  {
    quote:
      "Posted a Richflex pic. Got 3 DMs asking about my lifestyle. Best €19 I ever spent.",
    name: "Sarah K.",
    handle: "@sarahkflex",
    initials: "SK",
  },
  {
    quote:
      "The AI made me look so rich my mom asked if I was doing something illegal.",
    name: "Marcus R.",
    handle: "@marcus_rich",
    initials: "MR",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            Loved by 12,000+ flexers worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden group active:border-neutral-600/80 transition-all duration-300"
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
              <div className="p-5 sm:p-6 h-full flex flex-col">
                <p className="text-zinc-300 leading-relaxed text-sm mb-5 flex-grow">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-neutral-950/50 border border-zinc-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-zinc-300">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {testimonial.handle}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
