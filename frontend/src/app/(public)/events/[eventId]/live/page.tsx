'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Radio, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PollWidget, type PollData } from '@/components/live/poll-widget'
import { QnAFeed } from '@/components/live/qna-feed'
import { QnAAskForm } from '@/components/live/qna-ask-form'
import { PhotoWall } from '@/components/live/photo-wall'
import { PhotoUploadForm } from '@/components/live/photo-upload-form'
import { useSession } from 'next-auth/react'

export default function GuestLivePage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => { const r = await fetch(`/api/events/${eventId}`); if (!r.ok) throw new Error(); return r.json() },
    enabled: !!eventId,
  })

  const { data: polls = [], isLoading: loadingPolls } = useQuery<PollData[]>({
    queryKey: ['guest-polls', eventId],
    queryFn: async () => { const r = await fetch(`/api/events/${eventId}/polls`); if (!r.ok) return []; const d = await r.json(); return Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [] },
  })

  const openPolls = polls.filter((p: PollData) => p.isLive && (!p.closesAt || new Date(p.closesAt) > new Date()))
  const closedPolls = polls.filter((p: PollData) => !p.isLive || (p.closesAt && new Date(p.closesAt) <= new Date()))

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 lg:py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2"><Radio className="h-5 w-5 text-orange-600" /><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Live Engagement</h1></div>
          {event && <p className="text-muted-foreground">{event.data?.title || event.title}</p>}
        </motion.div>

        <Tabs defaultValue="polls" className="space-y-4">
          <TabsList>
            <TabsTrigger value="polls">Polls {openPolls.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs bg-orange-100 text-orange-700">{openPolls.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="qna">Q&A</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="polls" className="space-y-4">
            {loadingPolls ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}</div> : (
              <>
                {openPolls.length > 0 && <div className="space-y-4">{openPolls.map((p: PollData) => <PollWidget key={p.id} poll={p} eventId={eventId} userId={userId} />)}</div>}
                {closedPolls.length > 0 && (
                  <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground">Closed Polls</h3>
                    {closedPolls.map((p: PollData) => <PollWidget key={p.id} poll={{ ...p, hasVoted: true } as PollData} eventId={eventId} userId={userId} />)}
                  </div>
                )}
                {polls.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No polls available yet.</p>}
              </>
            )}
          </TabsContent>

          <TabsContent value="qna" className="space-y-4">
            <QnAAskForm eventId={eventId} onSubmitted={() => {}} />
            <QnAFeed eventId={eventId} userId={userId} />
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <PhotoUploadForm eventId={eventId} onUploaded={() => {}} />
            <PhotoWall eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
