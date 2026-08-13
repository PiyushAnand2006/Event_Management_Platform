'use client'

import React from 'react'
import { Navigation, Store, ChefHat } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { POIData } from './poi-marker'

const TYPE_LABELS: Record<string, string> = {
  food_stall: 'Food Stall',
  restroom: 'Restroom',
  entrance: 'Entrance',
  stage: 'Stage',
  seating_section: 'Seating',
  other: 'Other',
}

const TYPE_BADGE_VARIANTS: Record<string, string> = {
  food_stall: 'bg-orange-100 text-orange-800',
  restroom: 'bg-blue-100 text-blue-800',
  entrance: 'bg-amber-100 text-amber-800',
  stage: 'bg-purple-100 text-purple-800',
  seating_section: 'bg-sky-100 text-sky-800',
  other: 'bg-gray-100 text-gray-800',
}

type POIDetailSheetProps = {
  poi: POIData
  isOpen: boolean
  onClose: () => void
  distance?: number
  direction?: string
  sectionName?: string
}

export default function POIDetailSheet({ poi, isOpen, onClose, distance, direction, sectionName }: POIDetailSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="h-[40vh] sm:side-right sm:h-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-600" />
            {poi.name}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-4 pr-2">
          <div className="space-y-4">
            {/* Type badge */}
            <Badge className={TYPE_BADGE_VARIANTS[poi.type] || TYPE_BADGE_VARIANTS.other}>
              {TYPE_LABELS[poi.type] || 'Other'}
            </Badge>

            {/* Direction info */}
            {(distance !== undefined && direction) && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>
                  <span className="font-semibold">~{Math.round(distance)}m</span>{' '}
                  <span className="text-muted-foreground">{direction}</span>
                </span>
                {sectionName && (
                  <span className="text-muted-foreground">
                    &middot; near <span className="font-medium text-foreground">{sectionName}</span>
                  </span>
                )}
              </div>
            )}

            <Separator />

            {/* Stall info (for food stalls) */}
            {poi.type === 'food_stall' && poi.stall && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" /> Stall Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Owner</span>
                    <p className="font-medium">{poi.stall.ownerName}</p>
                  </div>
                  {poi.stall.cuisineType && (
                    <div>
                      <span className="text-muted-foreground">Cuisine</span>
                      <p className="font-medium">{poi.stall.cuisineType}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="mt-0.5">
                      <Badge
                        className={
                          poi.stall.contractStatus === 'confirmed'
                            ? 'bg-orange-100 text-orange-800'
                            : poi.stall.contractStatus === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {poi.stall.contractStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={onClose}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Show on Map
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
