'use client'

import { useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { toast } from 'sonner'
import { WifiOff, Wifi } from 'lucide-react'

export function OnlineOfflineDetector() {
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!isOnline) {
      toast.error('You are offline', {
        description: 'Please check your internet connection.',
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        id: 'offline-toast',
      })
    } else {
      toast.dismiss('offline-toast')
      toast.success('Back online', {
        description: 'Your connection has been restored.',
        icon: <Wifi className="h-4 w-4" />,
        duration: 3000,
        id: 'online-toast',
      })
    }
  }, [isOnline])

  return null
}
