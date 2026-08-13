'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Target,
  Lightbulb,
  ShieldCheck,
  Users,
  Lock,
  Sparkles,
  CalendarCheck,
  Building2,
  PartyPopper,
  ScanLine,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
}

const counterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We push boundaries with cutting-edge technology, constantly evolving to give event organizers the most advanced and intuitive tools on the market.',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'group-hover:bg-amber-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Reliability',
    description:
      'You can count on us. Built on rock-solid infrastructure with 99.9% uptime, so your events run flawlessly from start to finish.',
    gradient: 'from-orange-500 to-amber-600',
    bgGlow: 'group-hover:bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'Events bring people together — and so do we. We foster a global network of organizers who share knowledge, templates, and inspiration.',
    gradient: 'from-orange-600 to-amber-500',
    bgGlow: 'group-hover:bg-sky-500/10',
  },
  {
    icon: Lock,
    title: 'Security',
    description:
      'Your data is protected with end-to-end encryption, SOC 2 compliance, and granular permission controls. Privacy is never an afterthought.',
    gradient: 'from-rose-500 to-pink-500',
    bgGlow: 'group-hover:bg-rose-500/10',
  },
]

const timeline = [
  {
    year: '2020',
    icon: Sparkles,
    title: 'Founded with a Vision',
    description:
      'A small team with a bold idea set out to rethink event management from the ground up, prioritizing simplicity and delight.',
  },
  {
    year: '2021',
    icon: CalendarCheck,
    title: 'First 100 Events Hosted',
    description:
      'Word spread fast. Within a year, Occasio powered 100 events — from intimate workshops to large corporate conferences.',
  },
  {
    year: '2022',
    icon: Building2,
    title: 'Venue Builder Launched',
    description:
      'We introduced our drag-and-drop venue builder, letting organizers design custom event spaces in minutes instead of days.',
  },
  {
    year: '2023',
    icon: PartyPopper,
    title: '10,000 Events Milestone',
    description:
      'A major milestone — 10,000 events managed on Occasio, with organizers in over 15 countries trusting the platform.',
  },
  {
    year: '2024',
    icon: ScanLine,
    title: 'Smart Check-in & Live Engagement',
    description:
      'We launched smart QR check-in, live polls, Q&A, and real-time engagement dashboards to make every event interactive.',
  },
  {
    year: '2025',
    icon: Globe,
    title: 'Available in 30+ Countries',
    description:
      'With multi-language support, regional partnerships, and local payment methods, Occasio is now truly global.',
  },
]

const stats = [
  { value: '2,500+', label: 'Events Managed' },
  { value: '100K+', label: 'Happy Attendees' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '30+', label: 'Countries Served' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AboutContent() {
  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/30 dark:via-background dark:to-amber-950/20" />
          <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-orange-200/30 dark:bg-orange-900/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-amber-200/30 dark:bg-amber-900/15 blur-3xl" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeUp}>
            <Badge
              variant="outline"
              className="mb-6 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
            >
              Our Story
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="text-foreground">About </span>
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
              Occasio
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            We\'re on a mission to make every event effortless to plan and
            unforgettable to experience — from intimate gatherings to global
            conferences.
          </motion.p>
        </motion.div>
      </section>

      {/* ===================== MISSION STATEMENT ===================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <motion.div variants={scaleIn} className="mb-8 shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-600/25">
                <Target className="h-8 w-8" />
              </div>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              <span className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                Our Mission
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              We empower event organizers to create unforgettable experiences
              through innovative tools that remove friction and amplify
              creativity. From the first spark of an idea to the final round of
              applause, Occasio is the partner that turns ambitious visions into
              flawless realities — so organizers can focus on what truly matters:
              the people and the moments.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ===================== OUR VALUES ===================== */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Our Values
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              What We Stand For
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four core principles guide every product decision, every feature
              launch, and every interaction with our community.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp}>
                <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-lg hover:shadow-orange-500/5">
                  <div
                    className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-transparent blur-3xl opacity-0 transition-opacity duration-500 ${v.bgGlow} group-hover:opacity-100`}
                  />
                  <CardContent className="relative p-6">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.gradient} text-white shadow-lg`}
                    >
                      <v.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===================== OUR STORY (Timeline) ===================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Our Journey
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The{' '}
              <span className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                Occasio
              </span>{' '}
              Story
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From a bold idea to a platform trusted by thousands of organizers
              around the world.
            </p>
          </motion.div>

          {/* Timeline — vertical line on left */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-orange-300 via-orange-500 to-orange-300 dark:from-orange-700 dark:via-orange-500 dark:to-orange-700" />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="space-y-12"
            >
              {timeline.map((item) => (
                <motion.div
                  key={item.year}
                  variants={fadeUp}
                  className="relative flex gap-6 pl-1"
                >
                  {/* Dot on the line */}
                  <div className="relative z-10 mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-orange-500 bg-background shadow-md">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                      <item.icon className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1 pb-2">
                    <Badge
                      variant="outline"
                      className="mb-3 border-orange-200 bg-orange-50 font-mono text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
                    >
                      {item.year}
                    </Badge>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== TEAM STATS ===================== */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              By the Numbers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Impact That Speaks for Itself
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every number represents real events, real people, and real
              experiences made better through Occasio.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={counterVariants}
              >
                <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm text-center transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-lg hover:shadow-orange-500/5">
                  <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <CardContent className="relative flex flex-col items-center p-6">
                    <p className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400 sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-700" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-24 -right-24 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-[300px] w-[300px] rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>

          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Join the Occasio community
          </h2>
          <p className="mt-4 max-w-xl text-lg text-orange-100">
            Join thousands of organizers who trust Occasio to bring their events
            to life. Start for free — no credit card required.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-white px-8 text-base font-semibold text-orange-700 shadow-lg transition-colors hover:bg-orange-50"
              asChild
            >
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-white/30 bg-transparent px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-orange-200">
            Free plan available &middot; No credit card required &middot; Setup
            in 2 minutes
          </p>
        </motion.div>
      </section>
    </div>
  )
}

export default AboutContent
