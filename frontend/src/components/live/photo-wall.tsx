'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'

type Photo = { id: string; url: string; caption: string | null; status: string; createdAt: string; user: { id: string; name: string; image: string | null } }
type Props = { eventId: string }

export function PhotoWall({ eventId }: Props) {
  const { data, isLoading } = useQuery<{ photos: Photo[] }>({
    queryKey: ['event-photos', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/photos?status=approved&limit=30`)
      if (!res.ok) throw new Error('Failed')
      const d = await res.json()
      if (!Array.isArray(d.photos)) return { photos: [] }
      return d
    },
  })

  const photos = data?.photos || []

  return (
    <ScrollArea className="max-h-96">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-lg" />) : photos.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <ImageOff className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No photos yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className="overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <img src={photo.url} alt={photo.caption || 'Event photo'} loading="lazy" className="object-cover w-full h-full" />
                  </div>
                  <CardContent className="p-3">
                    {photo.caption && <p className="text-sm truncate">{photo.caption}</p>}
                    <p className="text-xs text-muted-foreground mt-1">by {photo.user.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </ScrollArea>
  )
}
