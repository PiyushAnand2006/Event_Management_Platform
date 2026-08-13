'use client'

import { motion } from 'framer-motion'

const partners = [
  { name: 'TechNova', abbr: 'TN' },
  { name: 'EventPro', abbr: 'EP' },
  { name: 'Bliss Co.', abbr: 'BC' },
  { name: 'SummitHQ', abbr: 'SH' },
  { name: 'GalaTech', abbr: 'GT' },
  { name: 'NexusEvents', abbr: 'NE' },
  { name: 'RhythmInc', abbr: 'RI' },
  { name: 'SparkEvents', abbr: 'SE' },
]

export function PartnerLogos() {
  return (
    <section className="py-16 border-y border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8"
        >
          Trusted by leading event organizers worldwide
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-2.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50 font-bold text-sm text-muted-foreground">
                {partner.abbr}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{partner.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
