'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type Photo = { id: string; url: string; caption: string | null; status: string; createdAt: string; user: { id: string; name: string; image: string | null } }
type Props = { eventId: string }

export function PhotoModQueue({ eventId }: Props) {
  const qc = useQueryClient()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading } = useQuery<{ photos: Photo[] }>({
    queryKey: ['pending-photos', eventId],
    queryFn: async () => { const res = await fetch(`/api/events/${eventId}/photos?status=pending&limit=50`); if (!res.ok) throw new Error(); const d = await res.json(); if (!Array.isArray(d.photos)) return { photos: [] }; return d },
  })
  const photos = data?.photos || []

  const approveMut = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/photos/${id}/moderate`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve' }) }); if (!res.ok) throw new Error() },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-photos', eventId] }); qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); toast.success('Photo approved') },
    onError: () => toast.error('Failed'),
  })

  const rejectMut = useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason?: string }) => { const res = await fetch(`/api/photos/${id}/moderate`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', rejectionReason }) }); if (!res.ok) throw new Error() },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-photos', eventId] }); qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); setRejectId(null); setReason(''); toast.success('Photo rejected') },
    onError: () => toast.error('Failed'),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-orange-600" /><h3 className="font-semibold text-sm">Photo Moderation</h3>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">{photos.length} pending</Badge>
      </div>
      <ScrollArea className="max-h-96">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />) : photos.length === 0 ? (
            <div className="col-span-full text-center py-8"><Check className="mx-auto h-8 w-8 text-orange-500/40" /><p className="mt-2 text-sm text-muted-foreground">No photos pending</p></div>
          ) : (
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="overflow-hidden">
                    <div className="aspect-square relative bg-muted">
                      <img src={photo.url} alt="" className="object-cover w-full h-full" />
                    </div>
                    <CardContent className="p-3 space-y-2">
                      {photo.caption && <p className="text-sm truncate">{photo.caption}</p>}
                      <p className="text-xs text-muted-foreground">by {photo.user.name}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-7 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => approveMut.mutate(photo.id)} disabled={approveMut.isPending}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-red-600 border-red-300" onClick={() => setRejectId(photo.id)}><X className="mr-1 h-3.5 w-3.5" />Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
      <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setReason('') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Photo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Optional: provide a reason.</p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="resize-none" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setReason('') }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => rejectId && rejectMut.mutate({ id: rejectId, rejectionReason: reason || undefined })} disabled={rejectMut.isPending}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}