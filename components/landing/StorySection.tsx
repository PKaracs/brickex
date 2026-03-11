"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface StorySectionProps {
  title: string
  description?: string
  imageLeft?: boolean
  imageContent?: React.ReactNode
  textContent?: React.ReactNode
}

export default function StorySection({
  title,
  description,
  imageLeft = false,
  imageContent,
  textContent,
}: StorySectionProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div
          className={`grid md:grid-cols-2 gap-12 items-center ${
            imageLeft ? "" : "md:grid-flow-dense"
          }`}
        >
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: imageLeft ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={imageLeft ? "" : "md:col-start-2"}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-zinc-400 leading-relaxed">
                {description}
              </p>
            )}
            {textContent}
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: imageLeft ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={imageLeft ? "" : "md:col-start-1 md:row-start-1"}
          >
            {imageContent || (
              <Card className="p-6">
                <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-700">
                  <span className="text-sm text-zinc-500">Screenshot</span>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

