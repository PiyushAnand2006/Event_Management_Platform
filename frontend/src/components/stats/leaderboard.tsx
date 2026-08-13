"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trophy, Star, Users, Medal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type LeaderboardEvent = {
  id: string
  title: string
  averageRating: number
  registeredCount: number
  category: string
}

interface LeaderboardProps {
  events: LeaderboardEvent[]
  loading?: boolean
}

const rankStyles: Record<number, { bg: string; border: string; icon: React.ReactNode }> = {
  1: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
  },
  2: {
    bg: "bg-slate-50 dark:bg-slate-900/30",
    border: "border-slate-300 dark:border-slate-600",
    icon: <Medal className="h-5 w-5 text-slate-400" />,
  },
  3: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-300 dark:border-orange-700",
    icon: <Medal className="h-5 w-5 text-orange-600" />,
  },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

export function Leaderboard({ events, loading }: LeaderboardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Top Rated Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No rated events yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event, index) => {
              const rank = index + 1
              const style = rankStyles[rank]

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/events/${event.id}`}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
                      style ? `${style.bg} ${style.border}` : "border-border/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                        rank <= 3
                          ? "bg-orange-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rank <= 3 ? style.icon : rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <StarRating rating={event.averageRating} />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {event.registeredCount}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {event.category}
                    </Badge>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
