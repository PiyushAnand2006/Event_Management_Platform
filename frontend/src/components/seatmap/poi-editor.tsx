'use client'

import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  UtensilsCrossed,
  DoorOpen,
  Music,
  Armchair,
  MapPin,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface POI {
  id: string
  venueId: string
  type: string
  name: string
  positionX: number
  positionY: number
  icon: string
  sortOrder: number
}

interface POIEditorProps {
  venueId: string
  venueWidth?: number
  venueHeight?: number
  pois: POI[]
  onPoiAdd: (data: {
    type: string
    name: string
    positionX: number
    positionY: number
    icon: string
  }) => void
  onPoiUpdate: (
    poiId: string,
    data: { positionX?: number; positionY?: number; name?: string }
  ) => void
  onPoiDelete: (poiId: string) => void
}

const poiTypes = [
  { value: 'food_stall', label: 'Food Stall', icon: 'utensils' },
  { value: 'restroom', label: 'Restroom', icon: 'door-open' },
  { value: 'entrance', label: 'Entrance', icon: 'door-open' },
  { value: 'stage', label: 'Stage', icon: 'music' },
  { value: 'seating_section', label: 'Seating Section', icon: 'armchair' },
  { value: 'other', label: 'Other', icon: 'map-pin' },
]

const iconOptions = [
  { value: 'utensils', label: 'Utensils' },
  { value: 'door-open', label: 'Door' },
  { value: 'music', label: 'Music' },
  { value: 'armchair', label: 'Armchair' },
  { value: 'map-pin', label: 'Map Pin' },
  { value: 'help-circle', label: 'Info' },
]

const typeBadgeColors: Record<string, string> = {
  food_stall:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  restroom:
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  entrance:
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  stage:
    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  seating_section:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  other:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
}

function POIIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { className: cn('h-4 w-4', className) }
  switch (icon) {
    case 'utensils':
      return <UtensilsCrossed {...props} />
    case 'door-open':
      return <DoorOpen {...props} />
    case 'music':
      return <Music {...props} />
    case 'armchair':
      return <Armchair {...props} />
    case 'help-circle':
      return <HelpCircle {...props} />
    default:
      return <MapPin {...props} />
  }
}

export function POIEditor({
  venueId,
  venueWidth = 100,
  venueHeight = 100,
  pois,
  onPoiAdd,
  onPoiUpdate,
  onPoiDelete,
}: POIEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state for adding
  const [addType, setAddType] = useState('other')
  const [addName, setAddName] = useState('')
  const [addIcon, setAddIcon] = useState('map-pin')

  // Form state for editing position
  const [editName, setEditName] = useState('')
  const [editX, setEditX] = useState('')
  const [editY, setEditY] = useState('')

  const handleTypeChange = (value: string) => {
    setAddType(value)
    const match = poiTypes.find((t) => t.value === value)
    if (match) setAddIcon(match.icon)
  }

  const handleAdd = () => {
    if (!addName.trim()) return
    onPoiAdd({
      type: addType,
      name: addName.trim(),
      positionX: Math.round(venueWidth / 2),
      positionY: Math.round(venueHeight / 2),
      icon: addIcon,
    })
    setAddName('')
    setAddType('other')
    setAddIcon('map-pin')
    setIsAdding(false)
  }

  const startEdit = (poi: POI) => {
    setEditingId(poi.id)
    setEditName(poi.name)
    setEditX(String(Math.round(poi.positionX)))
    setEditY(String(Math.round(poi.positionY)))
  }

  const handleSaveEdit = (poiId: string) => {
    const newX = parseFloat(editX)
    const newY = parseFloat(editY)
    onPoiUpdate(poiId, {
      name: editName.trim() || undefined,
      positionX: isNaN(newX) ? undefined : newX,
      positionY: isNaN(newY) ? undefined : newY,
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditX('')
    setEditY('')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Points of Interest
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {pois.length} marker{pois.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add POI form */}
        {isAdding ? (
          <div className="space-y-3 p-4 rounded-lg border border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <Select value={addType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {poiTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <POIIcon icon={t.icon} className="h-3.5 w-3.5" />
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Icon
                </label>
                <Select value={addIcon} onValueChange={setAddIcon}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        <span className="flex items-center gap-2">
                          <POIIcon icon={i.value} className="h-3.5 w-3.5" />
                          {i.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="e.g., Main Entrance, VIP Bar"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleAdd}
                disabled={!addName.trim()}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Add Marker
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setAddName('')
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Marker will be placed at the center of the venue ({Math.round(venueWidth / 2)},{' '}
              {Math.round(venueHeight / 2)}). Drag it to reposition on the map.
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add POI Marker
          </Button>
        )}

        <Separator />

        {/* POI List */}
        {pois.length === 0 ? (
          <div className="py-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No POI markers yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              Add markers for entrances, restrooms, food stalls, etc.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {pois.map((poi) => (
                <div
                  key={poi.id}
                  className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  {/* Icon + Name */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-50 dark:bg-orange-950/30">
                    <POIIcon
                      icon={poi.icon}
                      className="h-4 w-4 text-orange-600 dark:text-orange-400"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === poi.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-sm"
                          placeholder="Name"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-muted-foreground font-medium">
                              X
                            </label>
                            <Input
                              type="number"
                              value={editX}
                              onChange={(e) => setEditX(e.target.value)}
                              className="h-7 text-xs w-16"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-muted-foreground font-medium">
                              Y
                            </label>
                            <Input
                              type="number"
                              value={editY}
                              onChange={(e) => setEditY(e.target.value)}
                              className="h-7 text-xs w-16"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                            onClick={() => handleSaveEdit(poi.id)}
                          >
                            <Check className="h-3 w-3 mr-0.5" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {poi.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0',
                              typeBadgeColors[poi.type] || typeBadgeColors.other
                            )}
                          >
                            {poi.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Position: ({Math.round(poi.positionX)},{' '}
                          {Math.round(poi.positionY)})
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== poi.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(poi)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onPoiDelete(poi.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
