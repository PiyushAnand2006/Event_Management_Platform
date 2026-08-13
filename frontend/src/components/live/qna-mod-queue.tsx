'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ThumbsUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type QnAQuestion = {
  id: string; text: string; upvotes: number; isApproved: boolean; isAnswered: boolean
  answerText: string | null; createdAt: string; isUpvotedByMe: boolean
  user: { id: string; name: string; image: string | null }
}

type Props = { eventId: string }

export function QnAModQueue({ eventId }: Props) {
  const qc = useQueryClient()
  const { data: allQuestions = [], isLoading } = useQuery<QnAQuestion[]>({
    queryKey: ['event-qna-all', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/qna`)
      if (!res.ok) throw new Error('Failed')
      const d = await res.json()
      const raw = d.data ?? d
      return Array.isArray(raw) ? raw : []
    },
  })

  const pending = allQuestions.filter(q => !q.isApproved)

  const approveMut = useMutation({
    mutationFn: async (qId: string) => {
      const res = await fetch(`/api/qna/${qId}/approve`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-qna', eventId] })
      qc.invalidateQueries({ queryKey: ['event-qna-all', eventId] })
      toast.success('Question approved')
    },
    onError: () => toast.error('Failed to approve'),
  })

  const rejectMut = useMutation({
    mutationFn: async (qId: string) => {
      const res = await fetch(`/api/qna/${qId}/reject`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-qna', eventId] })
      qc.invalidateQueries({ queryKey: ['event-qna-all', eventId] })
      toast.success('Question rejected')
    },
    onError: () => toast.error('Failed to reject'),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-orange-600" />
        <h3 className="font-semibold text-sm">Moderation Queue</h3>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">{pending.length} pending</Badge>
      </div>
      <ScrollArea className="max-h-96">
        <div className="space-y-2 pr-2">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />) : pending.length === 0 ? (
            <div className="text-center py-8"><Check className="mx-auto h-8 w-8 text-orange-500/40" /><p className="mt-2 text-sm text-muted-foreground">All caught up!</p></div>
          ) : (
            <AnimatePresence>
              {pending.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm leading-relaxed">{q.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>by <span className="font-medium">{q.user.name}</span></span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{q.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-orange-600 border-orange-300" onClick={() => approveMut.mutate(q.id)} disabled={approveMut.isPending}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 border-red-300"><X className="h-3.5 w-3.5" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Reject Question</AlertDialogTitle><AlertDialogDescription>This will permanently remove the question.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => rejectMut.mutate(q.id)}>Reject</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}