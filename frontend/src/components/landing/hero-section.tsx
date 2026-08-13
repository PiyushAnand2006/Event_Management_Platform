'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const floatingOrb = (size: string, color: string, x: string, y: string, delay: number) => ({
  className: `absolute ${size} rounded-full ${color} blur-3xl pointer-events-none`,
  style: { left: x, top: y },
  animate: {
    y: [0, -30, 0, 20, 0],
    x: [0, 15, -10, 5, 0],
    scale: [1, 1.1, 0.95, 1.05, 1],
  },
  transition: {
    duration: 12,
    repeat: Infinity,
    ease: 'easeInOut',
    delay,
  },
})

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 -z-10 hero-gradient" />

      {/* Mesh pattern overlay for visual depth */}
      <div className="absolute inset-0 -z-[9] mesh-pattern" />

      {/* Dot pattern overlay for texture */}
      <div className="absolute inset-0 -z-[8] dot-pattern opacity-[0.06]" />

      {/* Animated floating orbs */}
      <motion.div {...floatingOrb('h-[400px] w-[400px]', 'bg-orange-500/15', '10%', '10%', 0)} />
      <motion.div {...floatingOrb('h-[300px] w-[300px]', 'bg-amber-400/10', '70%', '5%', 2)} />
      <motion.div {...floatingOrb('h-[350px] w-[350px]', 'bg-orange-700/10', '60%', '60%', 4)} />
      <motion.div {...floatingOrb('h-[250px] w-[250px]', 'bg-amber-600/8', '5%', '70%', 1)} />
      <motion.div {...floatingOrb('h-[200px] w-[200px]', 'bg-orange-400/6', '85%', '75%', 3)} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Now with AI-powered event planning</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-6xl lg:text-7xl"
        >
          <span className="text-white">Your Events, </span>
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Elevated
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-2xl text-lg text-orange-100/60 sm:text-xl leading-relaxed"
        >
          From intimate ceremonies to grand conferences, Occasio gives you the
          tools to plan, manage, and deliver events that leave lasting impressions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="bg-orange-600 hover:bg-orange-500 text-white h-12 px-8 text-base font-semibold shadow-lg shadow-orange-600/30 hover:shadow-orange-500/40 transition-all"
            asChild
          >
            <Link href="/signup">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="h-12 px-8 text-base font-semibold bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
            asChild
          >
            <Link href="/events">
              <CalendarDays className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-col items-center gap-4 sm:flex-row"
        >
          <div className="flex -space-x-3">
            {['bg-orange-500', 'bg-amber-500', 'bg-orange-700', 'bg-amber-600'].map(
              (color, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-full ${color} border-2 border-[oklch(0.18_0.03_30)] flex items-center justify-center text-white text-xs font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              )
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 text-orange-400 fill-orange-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-1 text-sm text-orange-200/50">
              Trusted by <span className="font-semibold text-orange-100">2,500+</span> event organizers worldwide
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
