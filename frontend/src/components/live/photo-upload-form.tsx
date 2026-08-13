'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const schema = z.object({ url: z.string().url('Enter a valid URL').min(1, 'URL is required'), caption: z.string().max(200).optional() })
type FormValues = z.infer<typeof schema>

type Props = { eventId: string; onUploaded: () => void }

export function PhotoUploadForm({ eventId, onUploaded }: Props) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: { url: '', caption: '' },
  })

  const { data: myPhotos = [] } = useQuery({
    queryKey: ['my-photos', eventId],
    queryFn: async () => { const res = await fetch(`/api/events/${eventId}/photos`); if (!res.ok) return []; const d = await res.json(); const photos = d.photos ?? d; return Array.isArray(photos) ? photos : [] },
  })

  const uploadMut = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch(`/api/events/${eventId}/photos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-photos', eventId] }); qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); reset(); onUploaded(); toast.success('Photo uploaded for review') },
    onError: () => toast.error('Failed to upload'),
  })

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', approved: 'bg-orange-100 text-orange-700', rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-orange-600" />Upload Photo</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(d => uploadMut.mutate(d))} className="space-y-3">
            <div>
              <Label>Image URL</Label>
              <Input {...register('url')} placeholder="https://example.com/photo.jpg" className="mt-1" />
              {errors.url && <p className="text-xs text-destructive mt-1">{errors.url.message}</p>}
            </div>
            <div>
              <Label>Caption (optional)</Label>
              <Textarea {...register('caption')} placeholder="Describe this photo..." rows={2} className="mt-1 resize-none" />
            </div>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={uploadMut.isPending}>
              {uploadMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload
            </Button>
          </form>
        </CardContent>
      </Card>
      {myPhotos.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">My Uploads ({myPhotos.length})</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {myPhotos.map((p: { id: string; url: string; caption: string | null; status: string }) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <img src={p.url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0"><p className="text-sm truncate">{p.caption || 'No caption'}</p></div>
                    <Badge variant="outline" className={statusColor[p.status] || ''}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
