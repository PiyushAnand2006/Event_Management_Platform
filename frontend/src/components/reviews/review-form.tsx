'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  eventId: string
  userId: string
  existingReview?: {
    rating: number
    comment: string
  }
  onSubmit: (data: { rating: number; comment: string }) => void
  onCancel?: () => void
  disabled?: boolean
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        return (
          <button
            key={i}
            type="button"
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                starValue <= (hovered || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted-foreground/30'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function ReviewForm({
  eventId,
  userId,
  existingReview,
  onSubmit,
  onCancel,
  disabled = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const isEditing = !!existingReview

  const validate = (): boolean => {
    const newErrors: { rating?: string; comment?: string } = {}
    if (rating === 0) newErrors.rating = 'Please select a rating'
    if (comment.trim().length < 10) newErrors.comment = 'Comment must be at least 10 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h4>
        <span className="text-xs text-muted-foreground">
          {isEditing ? 'Update your review below' : 'Share your experience'}
        </span>
      </div>

      {/* Star Rating */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Rating *</label>
        <InteractiveStars value={rating} onChange={(v) => {
          setRating(v)
          if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }))
        }} />
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Comment *</label>
        <Textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }))
          }}
          placeholder="Tell us about your experience (min 10 characters)..."
          className="min-h-[100px] resize-none"
          disabled={disabled}
        />
        <div className="flex items-center justify-between">
          {errors.comment ? (
            <p className="text-xs text-destructive">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {comment.trim().length}/10 min
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={disabled || submitting}
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
