'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  CalendarDays,
  MapPin,
  Star,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { AbstractAiBanner } from '@/components/events/abstract-ai-banner'

export interface EventCardData {
  id: string
  title: string
  description: string
  type: string
  category: string
  date: string
  endTime?: string | null
  location: string
  capacity: number
  registeredCount: number
  posterUrl?: string | null
  averageRating: number
  price: number
  isFree: boolean
  status: string
}

const typeColors: Record<string, string> = {
  conference: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  seminar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hackathon: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  wedding: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  private_ceremony: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
}

const typeLabels: Record<string, string> = {
  conference: 'Conference',
  seminar: 'Seminar',
  hackathon: 'Hackathon',
  wedding: 'Wedding',
  private_ceremony: 'Private Ceremony',
  other: 'Other',
}

interface EventCardProps {
  event: EventCardData
}

export function EventCard({ event }: EventCardProps) {
  const capacityPercent = event.capacity > 0
    ? Math.min((event.registeredCount / event.capacity) * 100, 100)
    : 0
  const isFull = event.capacity > 0 && event.registeredCount >= event.capacity

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link href={`/events/${event.id}`} className="block group">
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          {/* Poster / AI Abstract Banner */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {event.posterUrl && !event.posterUrl.includes('unsplash') ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <AbstractAiBanner
                title={event.title}
                category={event.category}
                type={event.type}
              />
            )}
            {/* Type Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge
                className={cn(
                  'text-xs font-medium border-0 backdrop-blur-sm',
                  typeColors[event.type] || typeColors.other
                )}
              >
                {typeLabels[event.type] || event.type}
              </Badge>
            </div>
            {/* Price Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs font-semibold">
                {event.isFree ? 'Free' : `$${event.price}`}
              </Badge>
            </div>
            {/* Full overlay */}
            {isFull && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-bold text-lg bg-red-600 px-4 py-1.5 rounded-full">
                  Full
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Category Badge */}
            <Badge variant="outline" className="w-fit text-xs font-normal">
              {event.category}
            </Badge>

            {/* Title */}
            <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {event.title}
            </h3>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {/* Bottom: Rating + Capacity */}
            <div className="mt-auto pt-2 border-t border-border/40">
              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i < Math.round(event.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {event.averageRating > 0 ? event.averageRating.toFixed(1) : 'No reviews'}
                </span>
              </div>

              {/* Capacity Progress */}
              {event.capacity > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.registeredCount} / {event.capacity}</span>
                    </div>
                    <span>{Math.round(capacityPercent)}%</span>
                  </div>
                  <Progress value={capacityPercent} className="h-1.5" />
                </div>
              )}
              {event.capacity === 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{event.registeredCount} registered · Unlimited capacity</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          <div className="h-1.5 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
