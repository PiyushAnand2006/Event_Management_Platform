'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What types of events can I manage with Occasio?',
    answer:
      'Occasio supports a wide range of events including conferences, weddings, corporate retreats, galas, festivals, workshops, and more. Our flexible platform adapts to events of any size — from intimate gatherings of 10 to massive festivals with 10,000+ attendees.',
  },
  {
    question: 'Is there a free plan available?',
    answer:
      'Yes! Our Starter plan is completely free and includes up to 3 events per month, basic venue building, and email support. You can upgrade to Pro or Enterprise plans as your needs grow, with no long-term contracts required.',
  },
  {
    question: 'How does the smart check-in work?',
    answer:
      'When attendees register, they receive a unique QR code ticket. At the event, simply scan their QR code with any smartphone or tablet camera — no special hardware needed. Check-in takes under 2 seconds per person, and you get real-time attendance analytics in your dashboard.',
  },
  {
    question: 'Can I integrate Occasio with other tools I already use?',
    answer:
      'Absolutely. Occasio integrates with popular tools including Slack, Google Calendar, Zoom, Stripe for payments, Mailchimp for marketing, and Zapier for custom workflows. Our API also allows you to build custom integrations tailored to your workflow.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'All plans include email support with a 24-hour response time. Pro plans get priority chat support, and Enterprise plans include a dedicated account manager and 24/7 phone support. We also have a comprehensive help center with guides, video tutorials, and a community forum.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Occasio.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/50"
              >
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
