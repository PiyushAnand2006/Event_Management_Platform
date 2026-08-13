'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.role) {
      switch (session.user.role) {
        case 'organizer':
          router.replace('/organizer')
          break
        case 'admin':
          router.replace('/admin/pending')
          break
        default:
          router.replace('/customer')
          break
      }
    }
  }, [status, session, router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
