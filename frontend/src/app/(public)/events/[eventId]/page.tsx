'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Star,
  Tag,
  User as UserIcon,
  Calendar,
  LayoutGrid,
  UtensilsCrossed,
  DoorOpen,
  Music,
  Armchair,
  HelpCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CountdownTimer } from '@/components/events/countdown-timer'
import { RegistrationButton } from '@/components/events/registration-button'
import { ReviewList, type ReviewData } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { TicketDetailModal } from '@/components/events/ticket-detail-modal'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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

/**
 * `tags` arrives in one of three shapes: an already-parsed array from
 * `/api/events/[id]`, a JSON string straight from the database, or a legacy
 * comma-separated string. Normalize all of them instead of assuming JSON.
 */
function normalizeTags(tags: string[] | string | null | undefined): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags !== 'string' || !tags.trim()) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
}

interface EventDetail {
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
  organizerId: string
  posterUrl?: string | null
  status: string
  tags?: string[] | string | null
  averageRating: number
  price: number
  isFree: boolean
  organizer?: {
    id: string
    name: string
  }
}

interface RegistrationStatus {
  isRegistered: boolean
  isWaitlisted: boolean
  registration?: {
    id: string
    eventId: string
    status: string
    tier: string
    qrCodeDataUrl?: string | null
    createdAt: string
  }
}

interface VenueSeat {
  id: string
  label: string
  positionX: number
  positionY: number
  tier: string
  status: string
  assignedGuestId?: string | null
}

interface VenuePOI {
  id: string
  type: string
  name: string
  positionX: number
  positionY: number
  icon: string
}

interface VenueSection {
  id: string
  name: string
  positionX: number
  positionY: number
  width: number
  height: number
  seats: VenueSeat[]
}

interface VenuePreviewData {
  id: string
  name: string
  width: number
  height: number
  sections: VenueSection[]
  pois: VenuePOI[]
}

function POIPreviewIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { className: cn('h-3 w-3', className) }
  switch (icon) {
    case 'utensils':
      return <UtensilsCrossed {...props} />
    case 'door-open':
      return <DoorOpen {...props} />
    case 'music':
      return <Music {...props} />
    case 'armchair':
      return <Armchair {...props} />
    case 'help-circle':
      return <HelpCircle {...props} />
    default:
      return <MapPin {...props} />
  }
}

const sectionColors = [
  'bg-orange-200/60 dark:bg-orange-800/40 border-orange-400/40',
  'bg-amber-200/60 dark:bg-amber-800/40 border-amber-400/40',
  'bg-sky-200/60 dark:bg-sky-800/40 border-sky-400/40',
  'bg-rose-200/60 dark:bg-rose-800/40 border-rose-400/40',
  'bg-violet-200/60 dark:bg-violet-800/40 border-violet-400/40',
  'bg-orange-200/60 dark:bg-orange-800/40 border-orange-400/40',
]

const seatStatusColors: Record<string, string> = {
  unoccupied: 'bg-orange-500',
  occupied: 'bg-slate-400',
  blocked: 'bg-red-400',
}

function VenuePreviewMap({ venue }: { venue: VenuePreviewData }) {
  const maxW = 400
  const scale = maxW / venue.width
  const scaledH = venue.height * scale
  const allSeats = venue.sections.flatMap((s) => s.seats)
  const totalSeats = allSeats.length
  const occupiedSeats = allSeats.filter((s) => s.status === 'occupied').length

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
          {totalSeats - occupiedSeats} available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          {occupiedSeats} occupied
        </span>
        {venue.pois.length > 0 && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {venue.pois.length} POI{venue.pois.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Map container */}
      <div
        className="relative mx-auto border border-border/60 rounded-lg bg-muted/20 overflow-hidden max-w-full"
        style={{ width: `${maxW}px`, height: `${scaledH}px` }}
      >
        {/* Sections */}
        {venue.sections.map((section, idx) => (
          <div
            key={section.id}
            className={cn(
              'absolute rounded-md border border-dashed',
              sectionColors[idx % sectionColors.length]
            )}
            style={{
              left: `${section.positionX * scale}px`,
              top: `${section.positionY * scale}px`,
              width: `${section.width * scale}px`,
              height: `${section.height * scale}px`,
            }}
          >
            {/* Section label */}
            <p className="absolute -top-0.5 left-1 text-[9px] font-medium text-muted-foreground bg-background/80 px-1 rounded-b">
              {section.name}
            </p>

            {/* Seat dots */}
            {section.seats.map((seat) => (
              <div
                key={seat.id}
                className={cn(
                  'absolute rounded-full',
                  seatStatusColors[seat.status] || seatStatusColors.unoccupied
                )}
                style={{
                  width: '5px',
                  height: '5px',
                  left: `${seat.positionX * scale}px`,
                  top: `${seat.positionY * scale}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${seat.label} — ${seat.status}`}
              />
            ))}
          </div>
        ))}

        {/* POI Markers */}
        {venue.pois.map((poi) => (
          <div
            key={poi.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${poi.positionX * scale}px`,
              top: `${poi.positionY * scale}px`,
              transform: 'translate(-50%, -50%)',
            }}
            title={poi.name}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-border shadow-sm">
              <POIPreviewIcon
                icon={poi.icon}
                className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const { toast } = useToast()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [regStatus, setRegStatus] = useState<RegistrationStatus>({
    isRegistered: false,
    isWaitlisted: false,
  })
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [existingReview, setExistingReview] = useState<{ rating: number; comment: string } | undefined>()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const [venueData, setVenueData] = useState<VenuePreviewData | null>(null)
  const [loadingVenue, setLoadingVenue] = useState(true)

  const isAuthenticated = authStatus === 'authenticated'
  const isApproved = event?.status === 'published'
  const isFull = event ? event.capacity > 0 && event.registeredCount >= event.capacity : false

  // Fetch event
  useEffect(() => {
    if (!eventId) return
    setLoadingEvent(true)
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setEvent(json.data)
        } else {
          setEvent(null)
        }
      })
      .catch(() => setEvent(null))
      .finally(() => setLoadingEvent(false))
  }, [eventId])

  // Fetch venue layout (only for approved events)
  useEffect(() => {
    if (!eventId || !isApproved) {
      setVenueData(null)
      setLoadingVenue(false)
      return
    }
    setLoadingVenue(true)
    fetch(`/api/events/${eventId}/venue`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setVenueData(json.data)
        } else {
          setVenueData(null)
        }
      })
      .catch(() => setVenueData(null))
      .finally(() => setLoadingVenue(false))
  }, [eventId, isApproved])

  // Fetch registration status
  useEffect(() => {
    if (!isAuthenticated || !eventId) return
    fetch(`/api/events/${eventId}/registration`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setRegStatus({
            isRegistered: json.data.status === 'registered' || json.data.status === 'attended',
            isWaitlisted: json.data.status === 'waitlisted',
            registration: json.data,
          })
        }
      })
      .catch(() => {})
  }, [isAuthenticated, eventId])

  // Fetch reviews
  const fetchReviews = useCallback(async (p: number) => {
    setLoadingReviews(true)
    try {
      const sp = new URLSearchParams({ page: String(p), limit: '5' })
      const res = await fetch(`/api/events/${eventId}/reviews?${sp.toString()}`)
      const json = await res.json()
      if (json.success) {
        if (p === 1) {
          setReviews(json.data.reviews)
        } else {
          setReviews((prev) => [...prev, ...json.data.reviews])
        }
        setReviewTotal(json.data.total)
      }
    } catch {
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchReviews(1)
  }, [fetchReviews])

  // Check if user already reviewed
  useEffect(() => {
    if (!isAuthenticated || !eventId) return
    fetch(`/api/events/${eventId}/reviews/me`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setExistingReview({ rating: json.data.rating, comment: json.data.comment || '' })
        }
      })
      .catch(() => {})
  }, [isAuthenticated, eventId])

  // Register handler
  const handleRegister = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setRegStatus({
          isRegistered: true,
          isWaitlisted: false,
          registration: json.data,
        })
        toast({ title: 'Registered!', description: 'You have been registered for this event.' })
        if (event) setEvent({ ...event, registeredCount: event.registeredCount + 1 })
      } else {
        toast({ title: 'Registration failed', description: json.error || 'Something went wrong.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to register. Please try again.', variant: 'destructive' })
    }
  }

  // Cancel handler
  const handleCancelRegistration = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setRegStatus({ isRegistered: false, isWaitlisted: false })
        toast({ title: 'Cancelled', description: 'Your registration has been cancelled.' })
        if (event) setEvent({ ...event, registeredCount: Math.max(0, event.registeredCount - 1) })
      } else {
        toast({ title: 'Cancellation failed', description: json.error || 'Something went wrong.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel. Please try again.', variant: 'destructive' })
    }
  }

  // Review submit handler
  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      const res = await fetch(`/api/events/${eventId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' })
        setExistingReview(data)
        setShowReviewForm(false)
        setReviewPage(1)
        fetchReviews(1)
      } else {
        toast({ title: 'Failed', description: json.error || 'Could not submit review.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review.', variant: 'destructive' })
    }
  }

  // Loading state
  if (loadingEvent) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground mt-2">The event you are looking for does not exist.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    )
  }

  const parsedTags = normalizeTags(event.tags)
  const capacityPercent = event.capacity > 0 ? Math.min((event.registeredCount / event.capacity) * 100, 100) : 0

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push('/events')}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden">
              {event.posterUrl ? (
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-amber-800 flex items-center justify-center">
                  <CalendarDays className="h-24 w-24 text-white/20" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Title + Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={cn('text-xs', typeColors[event.type] || typeColors.other)}>
                {typeLabels[event.type] || event.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {event.category}
              </Badge>
              {event.isFree && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0 text-xs">
                  Free
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{event.title}</h1>
          </motion.div>

          {/* Organizer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Organized by</p>
              <p className="text-sm font-medium">{event.organizer?.name || 'Unknown Organizer'}</p>
            </div>
          </motion.div>

          <Separator />

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-3">About This Event</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>
          </motion.div>

          {/* Tags */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {parsedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Venue Layout Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.23 }}
          >
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LayoutGrid className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Venue Layout
                </CardTitle>
                {venueData && (
                  <span className="text-xs text-muted-foreground">
                    {venueData.name}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                {loadingVenue ? (
                  <div className="flex items-center justify-center py-8">
                    <Skeleton className="h-48 w-full max-w-md rounded-lg" />
                  </div>
                ) : !venueData ? (
                  <div className="text-center py-8">
                    <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Venue layout not yet configured
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      The organizer will add a seat map when available.
                    </p>
                  </div>
                ) : (
                  <VenuePreviewMap venue={venueData} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  Reviews
                  <span className="text-sm font-normal text-muted-foreground">
                    ({reviewTotal})
                  </span>
                </CardTitle>
                {isAuthenticated && regStatus.isRegistered && !existingReview && !showReviewForm && (
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Review Form */}
                {(showReviewForm || existingReview) && isAuthenticated && regStatus.isRegistered && (
                  <div className="border border-border/60 rounded-lg p-4 bg-muted/30">
                    <ReviewForm
                      eventId={eventId}
                      userId={session?.user?.id || ''}
                      existingReview={existingReview}
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                {/* Review List */}
                <ReviewList
                  reviews={reviews}
                  hasMore={reviews.length < reviewTotal}
                  onLoadMore={() => {
                    const nextPage = reviewPage + 1
                    setReviewPage(nextPage)
                    fetchReviews(nextPage)
                  }}
                  loading={loadingReviews && reviewPage > 1}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-5">
                {/* Price */}
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {event.isFree ? (
                      <span className="text-orange-600">Free</span>
                    ) : (
                      <span>${event.price}</span>
                    )}
                  </p>
                  {!event.isFree && (
                    <p className="text-xs text-muted-foreground mt-1">per person</p>
                  )}
                </div>

                <Separator />

                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <CalendarDays className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-muted-foreground">{format(new Date(event.date), 'h:mm a')}</p>
                      {event.endTime && (
                        <p className="text-muted-foreground">to {format(new Date(event.endTime), 'h:mm a')}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                    <p>{event.location}</p>
                  </div>

                  {/* Capacity */}
                  {event.capacity > 0 && (
                    <div className="flex items-start gap-3 text-sm">
                      <Users className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span>{event.registeredCount} / {event.capacity} spots</span>
                          <span className="text-muted-foreground">{Math.round(capacityPercent)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              capacityPercent >= 90
                                ? 'bg-red-500'
                                : capacityPercent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-orange-500'
                            )}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {event.capacity === 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-5 w-5 text-orange-600 shrink-0" />
                      <span>{event.registeredCount} registered · Unlimited capacity</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Countdown */}
                <CountdownTimer
                  targetDate={new Date(event.date)}
                  endDate={event.endTime ? new Date(event.endTime) : null}
                />

                <Separator />

                {/* Registration Button */}
                <RegistrationButton
                  eventId={eventId}
                  isRegistered={regStatus.isRegistered}
                  isWaitlisted={regStatus.isWaitlisted}
                  isFull={isFull}
                  isAuthenticated={isAuthenticated}
                  isApproved={isApproved}
                  onRegister={handleRegister}
                  onCancel={handleCancelRegistration}
                />

                {/* View Ticket Button */}
                {regStatus.isRegistered && regStatus.registration && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowTicket(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {regStatus.registration && (
        <TicketDetailModal
          open={showTicket}
          onOpenChange={setShowTicket}
          registration={regStatus.registration}
          event={{
            title: event.title,
            date: event.date,
            location: event.location,
            posterUrl: event.posterUrl,
          }}
          user={{
            name: session?.user?.name || 'User',
            email: session?.user?.email || '',
          }}
        />
      )}
    </div>
  )
}
