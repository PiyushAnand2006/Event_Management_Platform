"use client"

import React, { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CSVExportButtonProps {
  eventId: string
  eventName: string
  disabled?: boolean
}

export function CSVExportButton({
  eventId,
  eventName,
  disabled,
}: CSVExportButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/csv`)
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${eventName.replace(/\s+/g, "_").toLowerCase()}_registrations.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({ title: "Download started", description: `${eventName} registrations exported.` })
    } catch {
      toast({
        title: "Export failed",
        description: "Could not download CSV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || downloading}
    >
      {downloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </Button>
  )
}
