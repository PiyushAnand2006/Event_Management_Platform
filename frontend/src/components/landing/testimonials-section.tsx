'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Wedding Planner, Bliss Events',
    content:
      'Occasio completely transformed how I plan weddings. The venue builder alone saved me dozens of hours per event. My clients love the polished experience.',
    rating: 5,
    initials: 'SC',
    color: 'bg-orange-500',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Conference Director, TechNova',
    content:
      'We ran our 3,000-person summit entirely on Occasio. The live engagement features kept energy high throughout, and check-in was seamless.',
    rating: 5,
    initials: 'MR',
    color: 'bg-amber-500',
  },
  {
    name: 'Emily Watson',
    role: 'Nonprofit Manager, Hope Foundation',
    content:
    'Our charity gala raised 40% more than last year. The RSVP tracking and real-time analytics helped us optimize every detail of the evening.',
    rating: 5,
    initials: 'EW',
    color: 'bg-orange-600',
  },
  {
    name: 'David Park',
    role: 'Corporate Events Lead, Nexus Inc.',
    content:
    'From team retreats to product launches, Occasio scales beautifully. The smart check-in alone is worth it — no more long queues at registration.',
    rating: 4,
    initials: 'DP',
    color: 'bg-amber-600',
  },
  {
    name: 'Aisha Patel',
    role: 'Festival Organizer, Rhythm & Roots',
    content:
    'Managing a multi-day music festival seemed impossible until we found Occasio. The stage scheduling and vendor coordination tools are incredibly powerful.',
    rating: 5,
    initials: 'AP',
    color: 'bg-orange-700',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection)
      setCurrent((prev) => {
        const next = prev + newDirection
        if (next < 0) return testimonials.length - 1
        if (next >= testimonials.length) return 0
        return next
      })
    },
    []
  )

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000)
    return () => clearInterval(timer)
  }, [paginate])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  }

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by event organizers{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">
              everywhere
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from the people who plan events every day and trust Occasio to
            make them shine.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-16 mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="glass-card rounded-2xl border-l-4 border-l-orange-500 overflow-hidden">
                  <div className="p-6 sm:p-10">
                    {/* Quote icon */}
                    <Quote className="h-10 w-10 text-orange-300 dark:text-orange-700 mb-6" />

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            'h-5 w-5',
                            i < testimonials[current].rating
                              ? 'text-orange-500 fill-orange-500'
                              : 'text-muted fill-none stroke-muted'
                          )}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                      &ldquo;{testimonials[current].content}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="mt-8 flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold',
                          testimonials[current].color
                        )}
                      >
                        {testimonials[current].initials}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {testimonials[current].name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonials[current].role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1)
                    setCurrent(i)
                  }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === current
                      ? 'w-8 bg-orange-600 dark:bg-orange-400'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
