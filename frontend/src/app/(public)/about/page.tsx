import type { Metadata } from 'next'
import { AboutContent } from '@/components/about/about-content'

export const metadata: Metadata = {
  title: 'About Us | Occasio — Event & Ceremony Management Platform',
  description:
    'Learn about Occasio, the modern event and ceremony management platform built to help organizers create unforgettable experiences. Discover our mission, values, and story.',
  openGraph: {
    title: 'About Us | Occasio',
    description:
      'Discover our mission to revolutionize event management through innovation, reliability, community, and security.',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
