import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Center — Occasio',
  description:
    'Get help with your Occasio account, event management, billing, and more. Browse our FAQ or contact our support team.',
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
