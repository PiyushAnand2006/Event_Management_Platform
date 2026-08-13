'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, MessageCircle, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type QnAQuestion = {
  id: string; text: string; upvotes: number; isApproved: boolean; isAnswered: boolean
  answerText: string | null; createdAt: string; isUpvotedByMe: boolean
  user: { id: string; name: string; image: string | null }
}

type Props = { eventId: string; userId: string }

export function QnAFeed({ eventId }: Props) {
  const qc = useQueryClient()
  const { data: questions = [], isLoading } = useQuery<QnAQuestion[]>({
    queryKey: ['event-qna', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/qna`)
      if (!res.ok) throw new Error('Failed')
      const d = await res.json()
      const raw = d.data ?? d
      return Array.isArray(raw) ? raw : []
    },
  })

  const upvoteMutation = useMutation({
    mutationFn: async (qId: string) => {
      const res = await fetch(`/api/qna/${qId}/upvote`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-qna', eventId] }),
    onError: () => toast.error('Failed to upvote'),
  })

  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-3 pr-2">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />) : questions.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No questions yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{q.text}</p>
                    {q.isAnswered && q.answerText && (
                      <div className="mt-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-1">
                          <Reply className="h-3.5 w-3.5" />Answer
                        </p>
                        <p className="text-sm text-orange-800 dark:text-orange-200">{q.answerText}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <span className="text-xs text-muted-foreground">by <span className="font-medium">{q.user.name}</span></span>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => upvoteMutation.mutate(q.id)} disabled={q.isUpvotedByMe}>
                        <ThumbsUp className={`h-3.5 w-3.5 ${q.isUpvotedByMe ? 'fill-orange-500 text-orange-600' : ''}`} />{q.upvotes}
                      </Button>
                    </div>
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