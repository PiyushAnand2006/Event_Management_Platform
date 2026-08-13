"use client"

import React from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type StatItem = {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  change?: string
}

interface StatsCardsProps {
  stats: StatItem[]
  loading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change?.startsWith("+")
        const isNegative = stat.change?.startsWith("-")

        return (
          <motion.div key={index} variants={itemVariants}>
            <Card className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color || "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <span
                          className={`text-xs font-medium ${
                            isPositive
                              ? "text-orange-600 dark:text-orange-400"
                              : isNegative
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
