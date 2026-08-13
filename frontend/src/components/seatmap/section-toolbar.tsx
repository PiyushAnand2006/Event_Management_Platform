'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Settings2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { VenueSection } from '@/types/venue'
import { SECTION_PRESETS } from '@/types/venue'

type SectionToolbarProps = {
  sections: VenueSection[]
  onSelectSection: (sectionId: string) => void
  selectedSectionId: string | null
  onAddSection: (data: { name: string; preset: string; shape: string }) => void
  onDeleteSection: (sectionId: string) => void
  onUpdateSection: (sectionId: string, data: Partial<VenueSection>) => void
  onGenerateSeats: (sectionId: string) => void
  loading?: boolean
}

export default function SectionToolbar({
  sections,
  onSelectSection,
  selectedSectionId,
  onAddSection,
  onDeleteSection,
  onUpdateSection,
  onGenerateSeats,
  loading,
}: SectionToolbarProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addPreset, setAddPreset] = useState('theatre')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editWidth, setEditWidth] = useState('')
  const [editHeight, setEditHeight] = useState('')

  const selected = sections.find((s) => s.id === selectedSectionId)

  function handleAdd() {
    if (!addName.trim()) {
      toast({ title: 'Name required', variant: 'destructive' })
      return
    }
    onAddSection({ name: addName.trim(), preset: addPreset, shape: 'rectangle' })
    setAddName('')
    setShowAddForm(false)
  }

  function handleDelete() {
    if (deleteTarget) {
      onDeleteSection(deleteTarget)
      setDeleteTarget(null)
    }
  }

  function startEdit(section: VenueSection) {
    setEditingId(section.id)
    setEditName(section.name)
    setEditWidth(String(section.width))
    setEditHeight(String(section.height))
  }

  function saveEdit() {
    if (!editingId) return
    const w = parseFloat(editWidth)
    const h = parseFloat(editHeight)
    if (!editName.trim() || isNaN(w) || isNaN(h) || w < 5 || h < 5) {
      toast({ title: 'Invalid values', description: 'Name required, dimensions must be >= 5', variant: 'destructive' })
      return
    }
    onUpdateSection(editingId, { name: editName.trim(), width: w, height: h })
    setEditingId(null)
  }

  const presetLabel = (p: string | null) =>
    SECTION_PRESETS.find((pr) => pr.value === p)?.label || p || 'Custom'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Sections</h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Add form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-orange-200 dark:border-orange-800 p-3 space-y-2 bg-orange-50/50 dark:bg-orange-950/20">
                  <div className="space-y-1">
                    <Label className="text-xs">Section Name</Label>
                    <Input
                      className="h-8 text-sm"
                      placeholder="e.g. Stage-Front"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Preset</Label>
                    <Select value={addPreset} onValueChange={setAddPreset}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_PRESETS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs flex-1" onClick={handleAdd} disabled={loading}>
                      {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section list */}
          {sections.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sections yet.<br />
              <span className="text-xs">Add a section to get started.</span>
            </div>
          )}

          {sections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                'rounded-lg border p-3 cursor-pointer transition-all group',
                selectedSectionId === section.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'hover:border-orange-300 dark:hover:border-orange-700'
              )}
              onClick={() => onSelectSection(section.id)}
            >
              {editingId === section.id ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <Input className="h-7 text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Width</Label>
                      <Input className="h-7 text-sm" type="number" value={editWidth} onChange={(e) => setEditWidth(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Height</Label>
                      <Input className="h-7 text-sm" type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-[11px] flex-1" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{section.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEdit(section)
                        }}
                      >
                        <Settings2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(section.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 ml-5.5">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {presetLabel(section.preset)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {section._count?.seats ?? 0} seats
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {section.width}×{section.height}
                    </span>
                  </div>
                  {selectedSectionId === section.id && (
                    <div className="mt-2 ml-5.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          onGenerateSeats(section.id)
                        }}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Regenerate Seats
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this section and all its seats. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
