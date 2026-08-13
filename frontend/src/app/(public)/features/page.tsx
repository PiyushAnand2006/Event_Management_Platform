'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  QrCode,
  Building2,
  Radio,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: CalendarDays,
    title: 'Event Creation & Management',
    description:
      'Design stunning event pages in minutes with our drag-and-drop editor. Manage schedules, ticketing, speakers, and agendas all from a single dashboard that scales from intimate gatherings to large conferences.',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    icon: QrCode,
    title: 'Smart Check-In',
    description:
      'Ditch paper lists. Generate dynamic QR codes for every ticket and let attendees check in with their phone in under two seconds. Real-time attendance tracking keeps your front desk running fast.',
    gradient: 'from-orange-400 to-amber-500',
  },
  {
    icon: Building2,
    title: 'Venue Builder',
    description:
      'Visualize and configure your venue with an interactive floor plan editor. Assign tables, stages, and booths, then share a live map with attendees so they always know where to go.',
    gradient: 'from-orange-600 to-orange-600',
  },
  {
    icon: Radio,
    title: 'Live Engagement',
    description:
      'Keep the energy high with built-in live polls, Q&A sessions, and reaction feeds. Attendees participate right from their phones — no extra apps required — making every session interactive.',
    gradient: 'from-orange-600 to-green-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Turn event data into actionable insights. Track ticket sales, check-in rates, session popularity, and attendee satisfaction in real time with beautiful, exportable charts and reports.',
    gradient: 'from-green-500 to-orange-600',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Invite co-organizers, assign roles and permissions, and coordinate every detail together. Task management, shared notes, and activity timelines keep your entire team aligned and on schedule.',
    gradient: 'from-orange-500 to-green-400',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
}

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-orange-50/60 via-background to-background dark:from-orange-950/20 dark:via-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-1/4 top-16 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute left-1/3 top-4 h-56 w-56 rounded-full bg-orange-600/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Platform Features
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-lg text-muted-foreground sm:text-xl"
            >
              Everything you need to plan, launch, and elevate events — all in one
              powerful platform built for organizers who care about every detail.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── Feature Cards Grid ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
            >
              <Card className="group h-full border-border/50 shadow-md shadow-orange-600/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-orange-600/10">
                <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
                  {/* Icon with gradient */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg shadow-orange-600/20 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <div className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl shadow-orange-600/20">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-400/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-orange-500/20 blur-2xl" />
            <div className="absolute right-1/2 top-1/3 h-24 w-24 rounded-full bg-white/5 blur-xl" />

            <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-12 sm:py-20">
              <motion.div
                variants={fadeUp}
                custom={0}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
              >
                <Sparkles className="h-7 w-7" />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                custom={1}
                className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Ready to create unforgettable events?
              </motion.h2>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="max-w-lg text-orange-100"
              >
                Join thousands of organizers who trust Occasio to bring their
                visions to life. Start for free — no credit card required.
              </motion.p>

              <motion.div variants={fadeUp} custom={3}>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-md transition-colors"
                >
                  <Link href="/signup">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
