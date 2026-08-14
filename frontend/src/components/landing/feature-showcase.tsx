'use client'

import { motion } from 'framer-motion'
import {
  Layers,
  Radio,
  QrCode,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const coreFeatures = [
  {
    icon: Layers,
    tag: 'Venue Architecture',
    title: '2D & 3D WebGL Venue Builder',
    description:
      'Design immersive floor plans with drag-and-drop 2D canvas and real-time 3D Three.js seat mapping. Set VIP zones, stage areas, table layouts, and custom seating tiers effortlessly.',
    highlights: [
      'Interactive 3D seat exploration',
      'Theatrical, banquet & classroom presets',
      'Seat locking & automatic group placement',
    ],
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    borderColor: 'group-hover:border-orange-500/40',
  },
  {
    icon: Radio,
    tag: 'Live Event Suite',
    title: 'Real-time Live Audience Engagement',
    description:
      'Turn passive attendees into active participants. Run live multiple-choice polls with instant Recharts analytics, upvotable Q&A streams, and moderated live photo walls.',
    highlights: [
      'Sub-500ms Socket.IO updates',
      'Community question upvoting',
      'Live attendee photo wall with moderation queue',
    ],
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    borderColor: 'group-hover:border-amber-500/40',
  },
  {
    icon: QrCode,
    tag: 'Smart Entry',
    title: 'Digital Ticketing & QR Check-in',
    description:
      'Generate cryptographically signed JWT invitations, Code128 barcodes, and scannable QR tickets. Scan tickets via mobile camera with duplicate entry protection.',
    highlights: [
      'Fast camera-based QR scanning',
      'Bulk CSV invite import & automated email dispatch',
      'Real-time attendance stats dashboard',
    ],
    accentBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    borderColor: 'group-hover:border-purple-500/40',
  },
  {
    icon: Store,
    tag: 'Logistics & Vendors',
    title: 'Food Stall & Backup Vendor Hub',
    description:
      'Coordinate catering, beverage, and dessert stalls. If a vendor cancels, auto-discover nearby fallback suppliers with intelligent radius search and contract tracking.',
    highlights: [
      'Multi-category stall management',
      'Automated fallback vendor discovery',
      'Virtual lobby stall status banners',
    ],
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    borderColor: 'group-hover:border-rose-500/40',
  },
]

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
          Comprehensive Platform
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Everything you need to host <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
            remarkable community events
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          From intimate gatherings to large-scale multi-track conferences, Occasio gives organizers
          and attendees powerful end-to-end event tooling.
        </p>
      </div>

      {/* Grid of 4 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {coreFeatures.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`group bg-card p-8 rounded-3xl border border-border/80 soft-shadow flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${feature.borderColor}`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.accentBg} shadow-xs transition-transform group-hover:scale-105`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground/80 border border-border/40">
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="space-y-2.5 pt-4 border-t border-border/40">
                {feature.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary px-0 group-hover:translate-x-1 transition-transform cursor-pointer"
                asChild
              >
                <Link href="/features">
                  <span>Learn more about {feature.tag}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
