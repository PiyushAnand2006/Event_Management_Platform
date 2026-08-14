'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { ScheduledForYouSection } from '@/components/landing/scheduled-for-you'
import { ScheduledEventsSection } from '@/components/landing/scheduled-events-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { FeatureShowcase } from '@/components/landing/feature-showcase'
import { PartnerLogos } from '@/components/landing/partner-logos'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import { ScrollToTop } from '@/components/common/scroll-to-top'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ScheduledForYouSection />
        <ScheduledEventsSection />
        <HowItWorksSection />
        <FeatureShowcase />
        <PartnerLogos />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
