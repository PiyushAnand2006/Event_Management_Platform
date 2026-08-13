'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Radio, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { PollCreator } from '@/components/live/poll-creator'
import { PollResultsChart } from '@/components/live/poll-results-chart'
import { QnAModQueue } from '@/components/live/qna-mod-queue'
import { QnAFeed } from '@/components/live/qna-feed'
import { PhotoModQueue } from '@/components/live/photo-mod-queue'
import type { PollData } from '@/components/live/poll-widget'
import { toast } from 'sonner'

export default function OrganizerLiveConsolePage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const qc = useQueryClient()
  const [showCreator, setShowCreator] = useState(false)
  const [answerQId, setAnswerQId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

  const { data: event } = useQuery({ queryKey: ['event', eventId], queryFn: async () => { const r = await fetch(`/api/events/${eventId}`); if (!r.ok) throw new Error(); return r.json() }, enabled: !!eventId })
  const { data: polls = [], isLoading: loadingPolls } = useQuery<PollData[]>({ queryKey: ['org-polls', eventId], queryFn: async () => { const r = await fetch(`/api/events/${eventId}/polls`); if (!r.ok) return []; const d = await r.json(); return Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [] } })
  const { data: allQuestions = [] } = useQuery({ queryKey: ['event-qna-all', eventId], queryFn: async () => { const r = await fetch(`/api/events/${eventId}/qna`); if (!r.ok) return []; const d = await r.json(); return Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [] } })

  const deletePollMut = useMutation({
    mutationFn: async (id: string) => { const r = await fetch(`/api/polls/${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error() },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-polls', eventId] }); toast.success('Poll deleted') },
    onError: () => toast.error('Failed'),
  })

  const answerMut = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => { const r = await fetch(`/api/qna/${id}/answer`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answerText: answer }) }); if (!r.ok) throw new Error() },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-qna', eventId] }); qc.invalidateQueries({ queryKey: ['event-qna-all', eventId] }); setAnswerQId(null); setAnswerText(''); toast.success('Answer posted') },
    onError: () => toast.error('Failed'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" asChild><Link href="/organizer/events"><ArrowLeft className="mr-1 h-4 w-4" />Events</Link></Button>
        <Radio className="h-5 w-5 text-orange-600" />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Live Console</h1>
      </div>
      <p className="text-muted-foreground">{event?.data?.title || event?.title || 'Event'}</p>

      <Tabs defaultValue="polls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="polls">Polls {polls.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs">{polls.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="qna">Q&A {allQuestions.filter((q: { isApproved: boolean }) => !q.isApproved).length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs bg-amber-100 text-amber-700">{allQuestions.filter((q: { isApproved: boolean }) => !q.isApproved).length}</Badge>}</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-4">
          <div className="flex justify-end">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setShowCreator(!showCreator)}>
              <PlusCircle className="mr-2 h-4 w-4" />{showCreator ? 'Hide Form' : 'New Poll'}
            </Button>
          </div>
          {showCreator && <PollCreator eventId={eventId} onCreated={() => { setShowCreator(false); qc.invalidateQueries({ queryKey: ['org-polls', eventId] }) }} />}
          {loadingPolls ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div> : polls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No polls yet. Create one to get started.</p>
          ) : (
            <div className="space-y-4">
              {polls.map((poll: PollData) => (
                <div key={poll.id} className="flex gap-3">
                  <div className="flex-1"><PollResultsChart poll={poll} /></div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600 shrink-0" onClick={() => deletePollMut.mutate(poll.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="qna">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QnAModQueue eventId={eventId} />
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Approved Questions</h3>
              <QnAFeed eventId={eventId} userId="organizer" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos"><PhotoModQueue eventId={eventId} /></TabsContent>
      </Tabs>

      <Dialog open={!!answerQId} onOpenChange={(o) => { if (!o) { setAnswerQId(null); setAnswerText('') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Answer Question</DialogTitle><DialogDescription>Your answer will be visible to all attendees.</DialogDescription></DialogHeader>
          <Textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Type your answer..." rows={4} className="resize-none" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAnswerQId(null); setAnswerText('') }}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => answerQId && answerMut.mutate({ id: answerQId, answer: answerText })} disabled={!answerText.trim()}>Post Answer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}