'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { toast } from 'sonner'
import type { StallData } from './stall-card'

const stallTypeOptions = [
  { value: 'food', label: 'Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'decor', label: 'Decor' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  ownerName: z.string().min(1, 'Owner name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(30),
  stallType: z.enum(['food', 'beverage', 'dessert', 'decor', 'photography', 'other'], {
    required_error: 'Stall type is required',
  }),
  cuisineType: z.string().max(100).optional().or(z.literal('')),
  locationX: z.coerce.number().min(0).max(10000).optional().or(z.nan()),
  locationY: z.coerce.number().min(0).max(10000).optional().or(z.nan()),
  notes: z.string().max(500).optional().or(z.literal('')),
  photoUrl: z.string().max(500).url('Invalid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

type StallFormProps = {
  eventId: string
  stall?: StallData
  onSuccess: () => void
  onCancel: () => void
}

function parseNumOrNaN(val: number | null | undefined): number {
  if (val === null || val === undefined) return NaN
  return val
}

export default function StallForm({ eventId, stall, onSuccess, onCancel }: StallFormProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!stall

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: stall?.ownerName || '',
      phone: stall?.phone || '',
      stallType: (stall?.stallType as FormValues['stallType']) || 'food',
      cuisineType: stall?.cuisineType || '',
      locationX: parseNumOrNaN(stall?.locationX),
      locationY: parseNumOrNaN(stall?.locationY),
      notes: stall?.notes || '',
      photoUrl: stall?.photoUrl || '',
    },
  })

  const currentStallType = watch('stallType')

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        ownerName: data.ownerName,
        phone: data.phone,
        stallType: data.stallType,
      }

      if (data.cuisineType) payload.cuisineType = data.cuisineType
      if (!isNaN(data.locationX)) payload.locationX = data.locationX
      if (!isNaN(data.locationY)) payload.locationY = data.locationY
      if (data.notes) payload.notes = data.notes
      if (data.photoUrl) payload.photoUrl = data.photoUrl

      const url = isEdit
        ? `/api/events/${eventId}/stalls/${stall.id}`
        : `/api/events/${eventId}/stalls`

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || `Failed to ${isEdit ? 'update' : 'create'} stall`)
        return
      }

      toast.success(
        isEdit ? 'Stall updated' : 'Stall created',
        {
          description: `${data.ownerName} has been ${isEdit ? 'updated' : 'added'}.`,
        }
      )
      onSuccess()
    } catch {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} stall`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Owner Name */}
      <div className="space-y-2">
        <Label htmlFor="owner-name">
          Owner Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="owner-name"
          placeholder="e.g. Rajesh Catering"
          {...register('ownerName')}
        />
        {errors.ownerName && (
          <p className="text-xs text-destructive">{errors.ownerName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="e.g. +91 98765 43210"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Stall Type */}
      <div className="space-y-2">
        <Label htmlFor="stall-type">
          Stall Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={currentStallType}
          onValueChange={(v) =>
            setValue('stallType', v as FormValues['stallType'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="stall-type">
            <SelectValue placeholder="Select stall type" />
          </SelectTrigger>
          <SelectContent>
            {stallTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stallType && (
          <p className="text-xs text-destructive">{errors.stallType.message}</p>
        )}
      </div>

      {/* Cuisine Type */}
      <div className="space-y-2">
        <Label htmlFor="cuisine-type">Cuisine Type</Label>
        <Input
          id="cuisine-type"
          placeholder="e.g. North Indian, Chinese, Italian"
          {...register('cuisineType')}
        />
        {errors.cuisineType && (
          <p className="text-xs text-destructive">{errors.cuisineType.message}</p>
        )}
      </div>

      {/* Location X/Y */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location-x">Position X</Label>
          <Input
            id="location-x"
            type="number"
            step="any"
            placeholder="0"
            {...register('locationX')}
          />
          {errors.locationX && (
            <p className="text-xs text-destructive">{errors.locationX.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-y">Position Y</Label>
          <Input
            id="location-y"
            type="number"
            step="any"
            placeholder="0"
            {...register('locationY')}
          />
          {errors.locationY && (
            <p className="text-xs text-destructive">{errors.locationY.message}</p>
          )}
        </div>
      </div>

      {/* Photo URL */}
      <div className="space-y-2">
        <Label htmlFor="photo-url">Photo URL</Label>
        <Input
          id="photo-url"
          placeholder="https://example.com/photo.jpg"
          {...register('photoUrl')}
        />
        {errors.photoUrl && (
          <p className="text-xs text-destructive">{errors.photoUrl.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this stall..."
          rows={3}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Stall' : 'Add Stall'}
        </Button>
      </div>
    </form>
  )
}
