'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HeadphonesIcon, MessageCircle, ArrowRight, Search, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqItems = [
  {
    id: 'account-issues',
    question: 'How do I reset my password or recover my account?',
    answer:
      'Navigate to the login page and click "Forgot password." Enter the email address associated with your account, and we\'ll send a secure reset link. The link expires after 24 hours. If you no longer have access to that email, contact our support team with your account details and we\'ll help you regain access within 1–2 business days.',
  },
  {
    id: 'event-creation',
    question: 'What steps are involved in creating and publishing an event?',
    answer:
      'After signing in, head to your Dashboard and click "Create Event." Fill in the event name, date, time, location, and description. You can customize ticket tiers, add co-organizers, and set capacity limits. Once everything looks good, hit "Publish" and your event goes live immediately — shareable via a unique link or embedded on your website.',
  },
  {
    id: 'billing',
    question: 'What payment methods do you accept and how does billing work?',
    answer:
      'We accept all major credit/debit cards (Visa, Mastercard, American Express) as well as PayPal and bank transfers. Billing is handled on a per-event or subscription basis depending on your plan. Invoices are generated automatically and sent to your registered email. You can view and download all past invoices from the Billing section in your account settings.',
  },
  {
    id: 'technical',
    question: 'The platform is loading slowly or showing errors — what should I do?',
    answer:
      'First, try clearing your browser cache and cookies, then reload the page. Ensure you\'re using a supported browser (Chrome, Firefox, Safari, or Edge — latest two versions). If the issue persists, check our status page at status.occasio.io for any ongoing incidents. You can also reach out to support with a screenshot and your browser/device details so we can investigate further.',
  },
  {
    id: 'integrations',
    question: 'Which third-party tools and integrations does Occasio support?',
    answer:
      'Occasio integrates with popular tools including Google Calendar and Outlook for sync, Stripe and PayPal for payments, Mailchimp and SendGrid for email marketing, and Zapier for custom automations. We also offer a REST API and webhooks for advanced custom integrations. New integrations are added regularly based on community feedback.',
  },
  {
    id: 'data-privacy',
    question: 'How does Occasio handle my personal data and privacy?',
    answer:
      'We take data privacy seriously and comply with GDPR, CCPA, and other applicable regulations. Your personal information is encrypted in transit and at rest using industry-standard protocols. We never sell your data to third parties. You can request a full data export or permanent deletion at any time from your account settings, or by contacting our Data Protection Officer at privacy@occasio.io.',
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

export default function SupportPage() {
  return (
    <div className="bg-background">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-orange-50/60 via-background to-background dark:from-orange-950/20 dark:via-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute right-1/4 top-10 h-56 w-56 rounded-full bg-orange-600/8 blur-3xl" />
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
              <HeadphonesIcon className="h-7 w-7" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Help Center
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-lg text-muted-foreground sm:text-xl"
            >
              Find answers to common questions, troubleshoot issues, or get in touch
              with our support team. We&rsquo;re here to help your events run smoothly.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          className="mb-10 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
          >
            <Search className="h-5 w-5" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-3 text-muted-foreground"
          >
            Quick answers to the most common topics our users ask about.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
            },
          }}
        >
          <Card className="border-border/50 shadow-lg shadow-orange-600/5">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full px-6">
                {faqItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ─── Contact Support CTA ─── */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl shadow-orange-600/20">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-400/20 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
            <CardContent className="relative z-10 flex flex-col items-center gap-6 p-8 text-center sm:p-12">
              <motion.div
                variants={fadeUp}
                custom={0}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
              >
                <MessageCircle className="h-7 w-7" />
              </motion.div>

              <motion.div variants={fadeUp} custom={1}>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Still need help?
                </h2>
                <p className="mt-2 max-w-md text-orange-100">
                  Our support team typically responds within a few hours during
                  business days. We&rsquo;re happy to assist with anything.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-md"
                >
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
