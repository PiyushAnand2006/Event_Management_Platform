'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Twitter, Github, Linkedin, Instagram, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const platformLinks = [
  { label: 'Find Events', href: '/events' },
  { label: 'Start an Event', href: '/signup' },
  { label: 'Features & Tools', href: '/features' },
  { label: 'Pricing Plans', href: '/pricing' },
]

const categories = [
  { label: 'Technology & AI', href: '/events?category=Technology' },
  { label: 'Workshops & Education', href: '/events?category=Education' },
  { label: 'Social & Networking', href: '/events?category=Social' },
  { label: 'Hackathons', href: '/events?type=hackathon' },
]

const companyLinks = [
  { label: 'About Occasio', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Help & Support', href: '/support' },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
]

const legalItems = [
  {
    label: 'Terms of Service',
    content:
      'These Terms of Service ("Terms") govern your access to and use of the Occasio platform, including our website, mobile applications, and all related services. By accessing or using the Service, you agree to be bound by these Terms. Occasio provides tools for event management, community gatherings, digital ticketing, venue layout designing, and real-time live event engagement. Users are responsible for the content and gatherings they organize through the platform.',
  },
  {
    label: 'Privacy Policy',
    content:
      'At Occasio, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our Service. We collect information you provide directly (name, email, event details) and automatically (usage data, device info, cookies). We do not sell your personal data to third parties. You may access, update, or delete your personal information at any time through your account settings.',
  },
  {
    label: 'Community Guidelines',
    content:
      'Occasio is dedicated to providing a safe, inclusive, and welcoming community for all attendees, organizers, and partners. We expect all participants to uphold respect, transparency, and safety across all in-person and online events organized on the platform.',
  },
]

function LegalModal({
  open,
  onOpenChange,
  title,
  content,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Occasio Community Guidelines & Policies</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{content}</p>
      </DialogContent>
    </Dialog>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [legalOpen, setLegalOpen] = useState<string | null>(null)

  const activeLegal = legalItems.find((item) => item.label === legalOpen)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Subscribed!', { description: `We'll send updates to ${email}` })
    setEmail('')
  }

  return (
    <footer className="border-t border-border/60 bg-secondary/30 dark:bg-card/40 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">Occa</span>
                <span className="text-foreground">sio</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              The people platform where interests become friendships. Bring people together for
              in-person meetups, conferences, workshops, and celebrations.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Platform</h3>
            <ul className="mt-4 space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Discover</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Stay connected</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Get notified about trending events and community updates.
            </p>
            <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm rounded-full bg-background border-border/80 px-4"
              />
              <Button
                type="submit"
                className="h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium w-full"
              >
                <span>Subscribe</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} Occasio Platform. Crafted for communities with{' '}
            <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" />
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {legalItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setLegalOpen(item.label)}
                className="transition-colors hover:text-foreground cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {activeLegal && (
        <LegalModal
          open={legalOpen !== null}
          onOpenChange={(open) => !open && setLegalOpen(null)}
          title={activeLegal.label}
          content={activeLegal.content}
        />
      )}
    </footer>
  )
}
