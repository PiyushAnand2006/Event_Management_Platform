'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageSquareHeart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ------------------------------------------------------------------ */
/*  Subject options                                                    */
/* ------------------------------------------------------------------ */

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'feedback', label: 'Feedback' },
]

/* ------------------------------------------------------------------ */
/*  Contact info cards data                                            */
/* ------------------------------------------------------------------ */

const contactCards = [
  {
    icon: Mail,
    title: 'Email',
    detail: 'support@occasio.com',
    description: 'We typically respond within 24 hours.',
  },
  {
    icon: Phone,
    title: 'Phone',
    detail: '+1 (555) 123-4567',
    description: 'Mon – Fri, 9 AM – 6 PM PST.',
  },
  {
    icon: MapPin,
    title: 'Location',
    detail: 'San Francisco, CA',
    description: 'Visit us at our headquarters.',
  },
]

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  function handleSubjectChange(value: string) {
    setFormData((prev) => ({ ...prev, subject: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields before submitting.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1_400))

    setIsSubmitting(false)
    toast({
      title: 'Message sent!',
      description: "Thank you for reaching out. We'll get back to you soon.",
    })

    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="bg-background">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-orange-50/60 via-background to-background dark:from-orange-950/20 dark:via-background">
        {/* Decorative blobs */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute right-1/3 top-8 h-56 w-56 rounded-full bg-orange-600/8 blur-3xl" />
          <div className="absolute -bottom-12 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-300/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
            >
              <MessageSquareHeart className="h-7 w-7" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Get in Touch
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-lg text-muted-foreground sm:text-xl"
            >
              Have a question, partnership idea, or just want to say hello?&nbsp;
              We&rsquo;d love to hear from you and help make your events unforgettable.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── Contact Info Cards ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          {contactCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div key={card.title} variants={fadeUp} custom={idx}>
                <Card className="h-full border-border/50 shadow-lg shadow-orange-600/5 transition-shadow hover:shadow-orange-600/10">
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <p className="mt-1 text-base font-medium text-orange-600 dark:text-orange-400">
                        {card.detail}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ─── Contact Form ─── */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <Card className="relative overflow-hidden border-border/50 shadow-xl shadow-orange-600/5">
            {/* Subtle decorative gradient inside the card */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/5 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-orange-600/5 blur-3xl" aria-hidden="true" />

            <CardHeader className="relative z-10 pb-2">
              <motion.div variants={fadeUp} custom={0} className="text-center">
                <CardTitle className="text-2xl font-bold sm:text-3xl">
                  Send Us a Message
                </CardTitle>
                <CardDescription className="mt-2">
                  Fill out the form below and we&rsquo;ll get back to you as soon as
                  possible.
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="relative z-10 pt-4">
              <motion.form
                variants={fadeUp}
                custom={1}
                onSubmit={handleSubmit}
                className="grid gap-5"
              >
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                {/* Subject */}
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={handleSubjectChange}
                  >
                    <SelectTrigger id="subject" className="h-11 w-full">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help…"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="min-h-[120px] resize-y"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="mt-2 h-11 w-full bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-600/50 sm:w-auto sm:px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </motion.form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
