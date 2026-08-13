'use client'

import { Star, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

export interface ReviewData {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    image?: string | null
  }
}

interface ReviewListProps {
  reviews: ReviewData[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ReviewList({
  reviews,
  onLoadMore,
  hasMore = false,
  loading = false,
}: ReviewListProps) {
  if (reviews.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">No reviews yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Be the first to share your experience!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-96">
        <div className="space-y-4 pr-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-3 p-4 rounded-lg border border-border/60 bg-card"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-sm font-semibold">
                  {getInitials(review.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">
                    {review.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1">
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-lg border border-border/60">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {hasMore && !loading && (
        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
          >
            Load more reviews
          </Button>
        </div>
      )}
    </div>
  )
}
