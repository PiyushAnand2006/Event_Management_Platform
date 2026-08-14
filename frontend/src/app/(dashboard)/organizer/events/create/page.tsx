'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  PlusCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Tag,
  Sparkles,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AbstractAiBanner } from '@/components/events/abstract-ai-banner'

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['conference', 'seminar', 'hackathon', 'wedding', 'private_ceremony', 'other']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  capacity: z.coerce.number().min(0, 'Capacity cannot be negative'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  tags: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventSchema>

const eventTypes = [
  { value: 'conference', label: 'Conference' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'private_ceremony', label: 'Private Ceremony' },
  { value: 'other', label: 'Other' },
]

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [useAiBanner, setUseAiBanner] = useState<boolean>(true)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    data: categoriesData,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/events/categories')
        if (!res.ok) return []
        return res.json()
      } catch {
        return []
      }
    },
  })

  const categories: string[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : Array.isArray(categoriesData)
    ? categoriesData
    : []

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'conference',
      category: '',
      date: '',
      endTime: '',
      location: '',
      capacity: 0,
      price: 0,
      tags: '',
    },
  })

  const watchedTitle = watch('title')
  const watchedCategory = watch('category')
  const watchedType = watch('type')
  const watchedCapacity = watch('capacity')
  const watchedPrice = watch('price')

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file (PNG, JPG, GIF).',
        variant: 'destructive',
      })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setPosterUrl(e.target?.result as string)
      setUseAiBanner(false)
      toast({ title: 'Poster uploaded!', description: file.name })
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const createMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          posterUrl: useAiBanner ? null : posterUrl,
          tags: values.tags
            ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create event')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast({
        title: 'Event created!',
        description: 'Your event has been submitted for review.',
      })
      router.push(`/organizer/events`)
    },
    onError: (err: Error) => {
      toast({
        title: 'Creation failed',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Event</h1>
        <p className="text-muted-foreground mt-1">
          Fill out the details below to create your new event or ceremony.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Event title, description, and category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Tech Summit 2025"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event in detail..."
                  rows={5}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  placeholder="e.g. Technology, Music, Workshop"
                  list="category-list"
                  {...register('category')}
                />
                <datalist id="category-list">
                  {categories.map((c: string) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Date & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Date & Location</CardTitle>
              <CardDescription>When and where your event takes place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Start Time *</Label>
                  <Input id="date" type="datetime-local" {...register('date')} />
                  {errors.date && (
                    <p className="text-xs text-destructive">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" {...register('endTime')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Cubbon Park Pavilion, Bangalore or Online stream"
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Capacity & Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Capacity & Pricing</CardTitle>
              <CardDescription>Set attendee limits and ticket price.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    placeholder="0 = unlimited capacity"
                    {...register('capacity')}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-xs text-muted-foreground mr-1 self-center">Presets:</span>
                    {[
                      { label: 'Unlimited (0)', val: 0 },
                      { label: '50', val: 50 },
                      { label: '100', val: 100 },
                      { label: '250', val: 250 },
                      { label: '500', val: 500 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setValue('capacity', p.val)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                          watchedCapacity === p.val
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-secondary hover:bg-secondary/80 border-border/60 text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {errors.capacity && (
                    <p className="text-xs text-destructive">{errors.capacity.message}</p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0 = free event"
                    {...register('price')}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-xs text-muted-foreground mr-1 self-center">Presets:</span>
                    {[
                      { label: 'Free ($0)', val: 0 },
                      { label: '$10', val: 10 },
                      { label: '$25', val: 25 },
                      { label: '$50', val: 50 },
                      { label: '$100', val: 100 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setValue('price', p.val)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                          watchedPrice === p.val
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-secondary hover:bg-secondary/80 border-border/60 text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </CardTitle>
              <CardDescription>
                Add keywords to help attendees discover your event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. tech, networking, ai, workshop (comma-separated)"
                {...register('tags')}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Banner & Poster Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Event Poster & Banner
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={useAiBanner ? 'default' : 'outline'}
                    onClick={() => {
                      setUseAiBanner(true)
                      setPosterUrl(null)
                    }}
                    className={useAiBanner ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    AI Abstract Banner
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!useAiBanner ? 'default' : 'outline'}
                    onClick={() => {
                      setUseAiBanner(false)
                      fileInputRef.current?.click()
                    }}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload Custom
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Choose an AI generated abstract banner or upload a custom image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {useAiBanner ? (
                /* AI Banner Live Preview */
                <div className="space-y-3">
                  <div className="h-48 sm:h-56 rounded-xl overflow-hidden border border-border/80 relative shadow-sm">
                    <AbstractAiBanner
                      title={watchedTitle || 'Your Event Title'}
                      category={watchedCategory || 'Category'}
                      type={watchedType || 'conference'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      Live AI Abstract Banner will dynamically adapt to your title, category, and event type.
                    </span>
                  </p>
                </div>
              ) : posterUrl ? (
                /* Custom Poster Preview */
                <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-border/80 group">
                  <img
                    src={posterUrl}
                    alt="Event Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setPosterUrl(null)
                        setUseAiBanner(true)
                      }}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                      : 'border-border/80 hover:border-orange-400 bg-secondary/30'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
                    <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 shadow-sm"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
