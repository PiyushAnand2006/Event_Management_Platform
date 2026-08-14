'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, MapPin, Sparkles, ArrowRight, Compass, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trendingTags = [
  { label: 'Technology', query: 'Technology' },
  { label: 'AI & Data', query: 'AI' },
  { label: 'Workshops', query: 'Education' },
  { label: 'Social & Meetups', query: 'Social' },
  { label: 'Hackathons', query: 'hackathon' },
]

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Bangalore, IN')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (query.trim()) sp.set('q', query.trim())
    if (location.trim()) sp.set('location', location.trim())
    router.push(`/events?${sp.toString()}`)
  }

  const handleTagClick = (tagQuery: string) => {
    router.push(`/events?category=${encodeURIComponent(tagQuery)}`)
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-primary/10 via-amber-500/5 to-background">
      {/* Warm ambient radial glows */}
      <div className="absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 -z-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6 shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Next-Gen Community & Event Platform</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
        >
          The people platform — <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Where interests become friendships
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-normal"
        >
          Join a local group to meet people, try something new, or do more of what you love. From tech meetups to weekend adventures, find your circle.
        </motion.p>

        {/* Interactive Dual Search Pill */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <form
            onSubmit={handleSearch}
            className="glass-card p-2 sm:p-2.5 rounded-3xl sm:rounded-full flex flex-col sm:flex-row gap-2 items-center w-full soft-shadow border border-border/80"
          >
            {/* Keyword Input */}
            <div className="flex-1 flex items-center bg-background/90 dark:bg-card px-4 py-3 rounded-full w-full border border-border/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="h-5 w-5 text-primary mr-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for 'hiking', 'tech', 'coding'..."
                className="bg-transparent border-none focus:outline-hidden text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 w-full"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 flex items-center bg-background/90 dark:bg-card px-4 py-3 rounded-full w-full border border-border/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <MapPin className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or location"
                className="bg-transparent border-none focus:outline-hidden text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 w-full"
              />
            </div>

            {/* Search CTA Button */}
            <Button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base shadow-md transition-all active:scale-95 shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Quick Trending Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80 mr-1">Trending:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleTagClick(tag.query)}
                className="rounded-full bg-secondary/80 hover:bg-primary/10 hover:text-primary px-3.5 py-1 text-xs font-medium border border-border/60 transition-colors cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Community Trust Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 pt-8 border-t border-border/40 grid grid-cols-3 gap-4 max-w-xl mx-auto"
        >
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold text-foreground">2,500+</span>
            <span className="text-xs text-muted-foreground mt-0.5">Events Hosted</span>
          </div>
          <div className="flex flex-col items-center border-x border-border/50">
            <span className="text-xl sm:text-2xl font-bold text-primary">45,000+</span>
            <span className="text-xs text-muted-foreground mt-0.5">Active Members</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-bold text-foreground">99.8%</span>
            <span className="text-xs text-muted-foreground mt-0.5">Satisfaction</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
