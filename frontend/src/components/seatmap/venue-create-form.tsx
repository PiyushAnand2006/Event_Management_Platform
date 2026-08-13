'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100),
  width: z.coerce.number().min(20, 'Min 20 units').max(500, 'Max 500 units'),
  height: z.coerce.number().min(20, 'Min 20 units').max(500, 'Max 500 units'),
})

type FormValues = z.infer<typeof schema>

type VenueCreateFormProps = {
  eventId: string
  onSuccess: () => void
}

export default function VenueCreateForm({ eventId, onSuccess }: VenueCreateFormProps) {
  const [loading, setLoading] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', width: 100, height: 100 },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/venue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) {
        toast({ title: 'Error', description: json.error || 'Failed to create venue', variant: 'destructive' })
        return
      }
      toast({ title: 'Venue created', description: 'You can now start building your floor plan.' })
      onSuccess()
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-[50vh]"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/40">
            <Building2 className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl">Create Venue</CardTitle>
          <CardDescription>
            Set up a floor plan for your event venue. You can add sections and seats afterward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue Name</Label>
              <Input
                id="venue-name"
                placeholder="e.g. Grand Ballroom"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue-width">Width (units)</Label>
                <Input
                  id="venue-width"
                  type="number"
                  min={20}
                  max={500}
                  {...register('width')}
                />
                {errors.width && (
                  <p className="text-xs text-destructive">{errors.width.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-height">Height (units)</Label>
                <Input
                  id="venue-height"
                  type="number"
                  min={20}
                  max={500}
                  {...register('height')}
                />
                {errors.height && (
                  <p className="text-xs text-destructive">{errors.height.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Venue
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
