'use client'

import { motion } from 'framer-motion'
import { Users, Ticket, PlusCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: Users,
    title: 'Join a group',
    description:
      'Do what you love, meet others who love it, and find your community. Connect with people who share your passion.',
    tilt: 'rotate-3 group-hover:rotate-6',
    bgColor: 'bg-primary/10 text-primary',
    tag: 'Step 01',
    link: '/events',
    ctaText: 'Explore Groups',
  },
  {
    icon: Ticket,
    title: 'Find an event',
    description:
      'Events are happening on just about any topic you can think of — from tech workshops and hackathons to social gatherings and outdoor expeditions.',
    tilt: '-rotate-3 group-hover:-rotate-6',
    bgColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    tag: 'Step 02',
    link: '/events',
    ctaText: 'Browse Events',
  },
  {
    icon: PlusCircle,
    title: 'Start a group & host',
    description:
      'You don’t have to be an expert to gather people together. Use our 2D/3D venue builder, live polls, and QR check-in to host unforgettable events.',
    tilt: 'rotate-6 group-hover:rotate-12',
    bgColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    tag: 'Step 03',
    link: '/signup',
    ctaText: 'Start Hosting',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-secondary/40 dark:bg-card/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Simple & Accessible
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How Occasio works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Meet new people who share your interests through online and in-person events. It’s free
            to join and simple to get started.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-card p-8 rounded-3xl border border-border/80 soft-shadow flex flex-col items-center text-center group hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 relative"
            >
              {/* Step tag */}
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-6 bg-secondary px-3 py-1 rounded-full">
                {step.tag}
              </span>

              {/* Tilted Icon Badge */}
              <div
                className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 shadow-sm ${step.tilt} ${step.bgColor}`}
              >
                <step.icon className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {step.description}
              </p>

              <div className="mt-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary group-hover:translate-x-0.5 transition-transform"
                  asChild
                >
                  <Link href={step.link}>
                    <span>{step.ctaText}</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
