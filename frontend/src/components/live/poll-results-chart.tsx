'use client'
import { motion } from 'framer-motion'
import { BarChart3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PollResults } from './poll-widget'

type Props = { poll: { question: string; results?: PollResults; _count?: { responses: number } } }

export function PollResultsChart({ poll }: Props) {
  const results = poll.results
  const totalVotes = results?.totalVotes || poll._count?.responses || 0
  const options = results?.options || []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-orange-600" />{poll.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No votes yet</p>
        ) : (
          options.map((opt, i) => {
            const pct = results!.totalVotes > 0 ? Math.round((opt.votes / results!.totalVotes) * 100) : 0
            return (
              <div key={opt.index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{opt.text}</span>
                  <span className="text-muted-foreground tabular-nums font-medium">{opt.votes} ({pct}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-orange-100 dark:bg-orange-950/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                    className="h-full rounded-full bg-orange-500"
                  />
                </div>
              </div>
            )
          })
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
          <Users className="h-3.5 w-3.5" />{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
        </div>
      </CardContent>
    </Card>
  )
}
