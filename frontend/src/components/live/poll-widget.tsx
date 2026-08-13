'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export type PollResults = {
  options: { index: number; text: string; votes: number }[]
  totalVotes: number
  totalResponses: number
}

export type PollData = {
  id: string
  eventId: string
  question: string
  options: string[]
  allowMultiple: boolean
  isLive: boolean
  closesAt: string | null
  createdAt: string
  hasVoted: boolean
  userSelectedOptions: number[] | null
  results?: PollResults
  _count?: { responses: number }
}

type Props = { poll: PollData; eventId: string; userId: string }

export function PollWidget({ poll }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const [voted, setVoted] = useState(poll.hasVoted)
  const [results, setResults] = useState<PollResults | undefined>(poll.results)
  const [loading, setLoading] = useState(false)

  const closed = !poll.isLive || (poll.closesAt && new Date(poll.closesAt) <= new Date())
  const totalVotes = results?.totalVotes || poll._count?.responses || 0

  const handleSelect = (i: number) => {
    if (voted || closed) return
    if (poll.allowMultiple) {
      setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    } else {
      setSelected([i])
    }
  }

  const handleVote = async () => {
    if (!selected.length) { toast.error('Select at least one option'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOptions: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResults(data.data?.results || data.results)
      setVoted(true)
      toast.success('Vote submitted!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{poll.question}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {poll.allowMultiple && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Multiple
              </Badge>
            )}
            {closed ? (
              <Badge variant="secondary" className="text-xs">
                <Lock className="mr-1 h-3 w-3" />Closed
              </Badge>
            ) : (
              <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          {!voted && !closed ? (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {poll.options.map((opt, idx) => {
                const sel = selected.includes(idx)
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(idx)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                      sel
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-950/40'
                        : 'border-border hover:border-orange-300 hover:bg-accent'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      sel ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground/30'
                    }`}>
                      {sel && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {opt}
                  </motion.button>
                )
              })}
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleVote}
                disabled={!selected.length || loading}
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {(results?.options || []).map((opt) => {
                const pct = results!.totalVotes > 0 ? Math.round((opt.votes / results!.totalVotes) * 100) : 0
                const mine = poll.userSelectedOptions?.includes(opt.index)
                return (
                  <div key={opt.index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={mine ? 'font-semibold text-orange-700' : ''}>
                        {opt.text}
                        {mine && <Check className="inline ml-1.5 h-3.5 w-3.5" />}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{opt.votes} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-orange-100 dark:bg-orange-950/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${mine ? 'bg-orange-600' : 'bg-orange-400'}`}
                      />
                    </div>
                  </div>
                )
              })}
              {(!results?.options || results.options.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No votes yet</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
