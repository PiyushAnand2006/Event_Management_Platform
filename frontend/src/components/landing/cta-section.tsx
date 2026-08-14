'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, PlusCircle, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-br from-primary/90 via-orange-600 to-amber-700 text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.25),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Floating Sparkle Icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/30"
        >
          <Sparkles className="h-7 w-7" />
        </motion.div>

        <h2 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to build your community and host unforgettable events?
        </h2>

        <p className="mt-4 max-w-xl text-base sm:text-lg text-orange-100/90 leading-relaxed font-normal">
          Join thousands of organizers and attendees using Occasio. Create interactive meetups,
          design venue maps, run live Q&A, and welcome your guests.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Button
            size="lg"
            className="h-13 rounded-full bg-white text-orange-700 hover:bg-orange-50 font-bold px-8 text-base shadow-xl hover:shadow-2xl transition-all active:scale-95"
            asChild
          >
            <Link href="/signup">
              <PlusCircle className="mr-2 h-5 w-5" />
              <span>Create an Event</span>
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-13 rounded-full border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 text-base backdrop-blur-md transition-all active:scale-95"
            asChild
          >
            <Link href="/events">
              <Compass className="mr-2 h-5 w-5" />
              <span>Explore Events</span>
            </Link>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-orange-100/80">
          <span className="flex items-center gap-1.5">✓ Free to get started</span>
          <span className="flex items-center gap-1.5">✓ Real-time Live Engagement</span>
          <span className="flex items-center gap-1.5">✓ Instant QR & Barcode Ticketing</span>
        </div>
      </motion.div>
    </section>
  )
}
