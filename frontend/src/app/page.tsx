'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureShowcase } from '@/components/landing/feature-showcase'
import { PartnerLogos } from '@/components/landing/partner-logos'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import { ScrollToTop } from '@/components/common/scroll-to-top'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeatureShowcase />
      <PartnerLogos />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
