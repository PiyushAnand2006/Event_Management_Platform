'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Dark gradient background */}
      <div className="absolute inset-0 -z-10 hero-gradient" />

      {/* Mesh pattern overlay */}
      <div className="absolute inset-0 -z-[9] mesh-pattern" />

      {/* Decorative glows */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 h-[300px] w-[300px] rounded-full bg-amber-400/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 backdrop-blur-sm text-orange-400 border border-orange-500/20"
        >
          <Sparkles className="h-7 w-7" />
        </motion.div>

        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to get started?
        </h2>
        <p className="mt-4 max-w-xl text-lg text-orange-100/60">
          Join thousands of event organizers who are already creating
          unforgettable experiences. Start for free, no credit card required.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-12 bg-orange-600 hover:bg-orange-500 text-white px-8 text-base font-semibold shadow-lg shadow-orange-600/25 hover:shadow-orange-500/35 transition-all"
            asChild
          >
            <Link href="/signup">
              Create your first event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="h-12 border-white/20 bg-white/10 backdrop-blur text-white hover:bg-white/20 hover:text-white px-8 text-base font-semibold transition-all"
            asChild
          >
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-orange-200/40">
          Free plan available &middot; No credit card required &middot; Setup in 2 minutes
        </p>
      </motion.div>
    </section>
  )
}
