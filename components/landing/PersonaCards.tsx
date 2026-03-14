"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Building2, Users, Sparkles } from "lucide-react"

const personas = [
  {
    name: "Architect",
    icon: Building2,
    benefit: "Turn sketches into client-ready visualizations in minutes.",
  },
  {
    name: "Design Studio",
    icon: Users,
    benefit: "Scale your visualization workflow without the overhead.",
  },
  {
    name: "Hephaestus",
    icon: Sparkles,
    benefit: "30,000 bricks/month for agencies and serious creators.",
  },
]

export default function PersonaCards() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-6 text-center hover:shadow-lg hover:shadow-white/5 transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4">
                  <persona.icon className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {persona.name}
                </h3>
                <p className="text-sm text-zinc-400">{persona.benefit}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

