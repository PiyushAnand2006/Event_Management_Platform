import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Occasio',
  description:
    'Reach out to the Occasio team for support, partnerships, or general inquiries. We\'d love to hear from you and help make your events unforgettable.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
