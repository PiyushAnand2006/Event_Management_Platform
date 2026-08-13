'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CSV_HEADERS = 'name,email,tier,groupId'

const SAMPLE_CSV = `name,email,tier,groupId
Alice Johnson,alice@example.com,vip,group-a
Bob Smith,bob@example.com,reserved,group-a
Carol White,carol@example.com,general,
Dave Brown,dave@example.com,vip,group-b
Eve Davis,eve@example.com,general,`

type ParsedRow = {
  name: string
  email: string
  tier: string
  groupId: string
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length < 2) return []

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    return {
      name: cols[0] || '',
      email: cols[1] || '',
      tier: cols[2] || 'general',
      groupId: cols[3] || '',
    }
  })
}

type CSVUploadFormProps = {
  eventId: string
  onComplete?: () => void
}

export default function CSVUploadForm({
  eventId,
  onComplete,
}: CSVUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a .csv file')
        return
      }

      setError(null)
      setSuccess(false)
      setFile(selectedFile)

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const parsed = parseCSV(text)
        setRows(parsed)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setFile(null)
      }
      reader.readAsText(selectedFile)
    },
    []
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function clearFile() {
    setFile(null)
    setRows([])
    setError(null)
    setSuccess(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = useCallback(async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('csv', file)

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90))
      }, 200)

      const res = await fetch(
        `/api/events/${eventId}/invitations/generate-from-csv`,
        {
          method: 'POST',
          body: formData,
        }
      )

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setSuccess(true)
      onComplete?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Upload failed'
      )
    } finally {
      setUploading(false)
    }
  }, [file, eventId, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Import Guest List</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-muted-foreground"
              onClick={downloadTemplate}
            >
              <Download className="h-3.5 w-3.5" />
              Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          {!file && (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                dragOver
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-muted-foreground/25 hover:border-orange-400 hover:bg-accent/30'
              )}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Drag and drop a CSV file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse · csv only
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* File selected / preview */}
          <AnimatePresence>
            {file && !success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* File info bar */}
                <div className="flex items-center justify-between rounded-lg border p-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rows.length} guest{rows.length !== 1 ? 's' : ''} parsed
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={clearFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview table first 5 rows */}
                {rows.length > 0 && (
                  <div className="rounded-lg border overflow-hidden mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 font-medium">
                            Name
                          </th>
                          <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">
                            Email
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Tier
                          </th>
                          <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">
                            Group
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 5).map((row, i) => (
                          <tr
                            key={i}
                            className="border-t last:border-b-0"
                          >
                            <td className="px-3 py-1.5 truncate max-w-[120px]">
                              {row.name || (
                                <span className="text-red-400">missing</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 truncate max-w-[180px] hidden sm:table-cell">
                              {row.email || (
                                <span className="text-red-400">missing</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-5"
                              >
                                {row.tier}
                              </Badge>
                            </td>
                            <td className="px-3 py-1.5 text-muted-foreground hidden sm:table-cell">
                              {row.groupId || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 5 && (
                      <p className="text-xs text-muted-foreground px-3 py-2 border-t bg-muted/30">
                        ...and {rows.length - 5} more
                      </p>
                    )}
                  </div>
                )}

                {rows.length === 0 && !error && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                    No valid rows found. Make sure the CSV has headers:{' '}
                    {CSV_HEADERS}
                  </p>
                )}

                {/* Upload button */}
                {rows.length > 0 && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading... {progress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Guests
                      </>
                    )}
                  </Button>
                )}

                {/* Progress bar during upload */}
                {uploading && (
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4 text-center space-y-2"
              >
                <CheckCircle className="h-8 w-8 mx-auto text-orange-600" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {rows.length} guests imported successfully
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={clearFile}
                >
                  Import Another
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
