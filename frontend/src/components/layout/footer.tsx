'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Twitter, Github, Linkedin, Instagram } from 'lucide-react'
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
  { label: 'Events', href: '/#events' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/features' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Support', href: '/support' },
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
      'These Terms of Service ("Terms") govern your access to and use of the Occasio platform, including our website, mobile applications, and all related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service. We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. Occasio provides tools for event management and ceremony planning. Users are responsible for the content they create and share through the platform.',
  },
  {
    label: 'Privacy Policy',
    content:
      'At Occasio, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our Service. We collect information you provide directly (name, email, event details) and automatically (usage data, device info, cookies). We use this information to provide and improve the Service, communicate with you, and ensure platform security. We do not sell your personal data to third parties. You may access, update, or delete your personal information at any time through your account settings or by contacting our support team.',
  },
  {
    label: 'Cookie Policy',
    content:
      'Occasio uses cookies and similar tracking technologies to enhance your experience on our platform. Essential cookies are required for the Service to function properly, including session management and security features. Analytics cookies help us understand how users interact with our platform so we can improve the experience. Preference cookies remember your settings and preferences. You can manage your cookie preferences through your browser settings at any time. Please note that disabling certain cookies may affect the functionality of the Service.',
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
          <DialogDescription>Last updated: January 2025</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
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
    if (!email) return
    toast.success('Subscribed!', { description: `We'll send updates to ${email}` })
    setEmail('')
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white transition-transform group-hover:scale-110">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-orange-600 dark:text-orange-400">Occa</span>
                <span className="text-foreground">sio</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Where moments come alive.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 dark:hover:border-orange-800"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-orange-600 dark:hover:text-orange-400">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-orange-600 dark:hover:text-orange-400">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stay updated</h3>
            <p className="mt-4 text-sm text-muted-foreground">Get the latest news about features and events.</p>
            <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-orange-600 hover:bg-orange-700 text-white">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Warm gradient divider line before bottom bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pb-8 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Occasio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {legalItems.map((item) => (
              <button key={item.label} onClick={() => setLegalOpen(item.label)} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {activeLegal && (
        <LegalModal open={legalOpen !== null} onOpenChange={(open) => !open && setLegalOpen(null)} title={activeLegal.label} content={activeLegal.content} />
      )}
    </footer>
  )
}
