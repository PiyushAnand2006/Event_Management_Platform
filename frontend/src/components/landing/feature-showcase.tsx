'use client'

import { motion } from 'framer-motion'
import { Building2, Radio, QrCode } from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Venue Builder',
    description:
      'Design your event space with our intuitive visual builder. Drag and drop tables, stages, and decorations to create the perfect layout for any occasion.',
    bgGlow: 'bg-orange-500/10',
  },
  {
    icon: Radio,
    title: 'Live Engagement',
    description:
      'Keep your audience engaged with real-time polls, Q&A sessions, and live reactions. Transform passive attendees into active participants.',
    bgGlow: 'bg-amber-500/10',
  },
  {
    icon: QrCode,
    title: 'Smart Check-in',
    description:
      'Streamline entry with QR code tickets and contactless check-in. Track attendance in real-time and reduce wait times to near zero.',
    bgGlow: 'bg-orange-600/10',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to
            <br className="hidden sm:block" />
            <span className="relative">
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
                host remarkable events
              </span>
              {/* Orange gradient underline decoration */}
              <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-orange-500/60 via-amber-400/60 to-orange-500/60" aria-hidden="true" />
            </span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Powerful tools designed to simplify every aspect of event
            management, from planning to execution.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:border-orange-400/40 dark:hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5">
                {/* Hover glow effect */}
                <div
                  className={`absolute -top-20 -right-20 h-40 w-40 rounded-full ${feature.bgGlow} blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                {/* Subtle orange left-border accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                <div className="relative p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-600/20">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
