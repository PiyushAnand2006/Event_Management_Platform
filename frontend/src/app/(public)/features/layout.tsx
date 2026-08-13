import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Platform Features — Occasio',
  description:
    'Explore the full suite of Occasio features: event creation, smart check-in, venue builder, live engagement, analytics, and team collaboration tools.',
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
