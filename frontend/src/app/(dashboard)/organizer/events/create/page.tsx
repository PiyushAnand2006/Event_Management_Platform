'use client'

import React, { useState } from 'react'
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

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['conference', 'seminar', 'hackathon', 'wedding', 'private_ceremony', 'other']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(0),
  price: z.number().min(0),
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
  const [tagInput, setTagInput] = useState('')

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
  const categories: string[] = categoriesData?.categories || categoriesData || []

  const {
    register,
    handleSubmit,
    control,
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

  const createMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
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
    onSuccess: () => {
      toast({ title: 'Event created!', description: 'Your event has been submitted for review.' })
      router.push('/organizer/events')
    },
    onError: (err: Error) => {
      toast({ title: 'Creation failed', description: err.message, variant: 'destructive' })
    },
  })

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create Event
        </h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to create a new event.
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
              <CardDescription>Event title, description, and type.</CardDescription>
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
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" {...register('date')} />
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
                  placeholder="e.g. Convention Center, New York"
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Capacity & Price */}
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
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    placeholder="0 = unlimited"
                    {...register('capacity')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for unlimited capacity
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0 = free"
                    {...register('price')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for a free event
                  </p>
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
                Add tags to help people discover your event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder="e.g. tech, networking, ai (comma-separated)"
                  {...register('tags')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Poster Upload Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Event Poster
              </CardTitle>
              <CardDescription>
                Upload an eye-catching poster for your event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:border-orange-400 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
                  <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
