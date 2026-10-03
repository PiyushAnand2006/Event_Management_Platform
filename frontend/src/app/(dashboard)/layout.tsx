'use client'

import React, { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  LayoutDashboard,
  Ticket,
  Bookmark,
  Search,
  CalendarClock,
  Users,
  PlusCircle,
  ListChecks,
  Clock,
  ShieldCheck,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  QrCode,
  MailCheck,
  Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  EventPickerDialog,
  type EventFeature,
} from '@/components/events/event-picker-dialog'

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

// Reactive URL hash so sidebar items sharing one path (/customer#past, #saved,
// …) can highlight the entry that actually matches the current hash.
function useHash() {
  const subscribe = (onStoreChange: () => void) => {
    window.addEventListener('hashchange', onStoreChange)
    return () => window.removeEventListener('hashchange', onStoreChange)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => ''
  )
}

type NavItem = {
  type: 'link'
  href: string
  label: string
  icon: React.ElementType
  // Per-event features have no global route, so they open the event picker
  // instead of navigating. See `EventPickerDialog`.
  feature?: EventFeature
}

type NavSection = {
  type: 'heading'
  label: string
}

type NavEntry = NavItem | NavSection

function isNavLink(entry: NavEntry): entry is NavItem {
  return entry.type === 'link'
}

const customerNav: NavEntry[] = [
  { type: 'link', href: '/customer', label: 'Upcoming Tickets', icon: Ticket },
  { type: 'link', href: '/customer#past', label: 'Past Tickets', icon: CalendarClock },
  { type: 'link', href: '/customer#saved', label: 'Saved Events', icon: Bookmark },
  { type: 'link', href: '/customer#browse', label: 'Browse Events', icon: Search },
]

const organizerNav: NavEntry[] = [
  { type: 'heading', label: 'Event Management' },
  { type: 'link', href: '/organizer', label: 'Dashboard Overview', icon: LayoutDashboard },
  { type: 'link', href: '/organizer/events', label: 'My Events', icon: ListChecks },
  { type: 'link', href: '/organizer/events/create', label: 'Create Event', icon: PlusCircle },
  { type: 'link', href: '/organizer/events', label: 'Participants', icon: Users, feature: 'participants' },
  { type: 'link', href: '/organizer/events', label: 'Guests & Invites', icon: MailCheck, feature: 'guests' },
  { type: 'link', href: '/organizer/events', label: 'Check-In', icon: QrCode, feature: 'checkin' },
  { type: 'link', href: '/organizer/events', label: 'Live Console', icon: Radio, feature: 'live' },
]

const adminNav: NavEntry[] = [
  { type: 'heading', label: 'Administration' },
  { type: 'link', href: '/admin/pending', label: 'Pending Events', icon: Clock },
  { type: 'link', href: '/admin/users', label: 'User Management', icon: UserCog },
  { type: 'link', href: '/admin/stats', label: 'Platform Stats', icon: BarChart3 },
]

const commonNav: NavEntry[] = [
  { type: 'link', href: '/profile', label: 'Profile', icon: Settings },
]

function getNavItems(role: string): NavEntry[] {
  switch (role) {
    case 'organizer':
      return [...organizerNav, ...commonNav]
    case 'admin':
      return [...adminNav, ...commonNav]
    default:
      return [...customerNav, ...commonNav]
  }
}

function SidebarContent({
  role,
  pathname,
  onNavigate,
  onPickFeature,
}: {
  role: string
  pathname: string
  onNavigate?: () => void
  onPickFeature?: (feature: EventFeature) => void
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const hash = useHash()
  const navItems = getNavItems(role)
  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  const isActive = (item: NavItem) => {
    // Feature entries open the event picker rather than a route, so they never
    // represent "where you are". Comparing only the pathname made every hash
    // link under /organizer/events light up at the same time.
    if (item.feature) return false
    if (item.href.includes('#')) {
      const [path, hashPart] = item.href.split('#')
      return pathname === path && hash === `#${hashPart}`
    }
    return pathname === item.href && hash === ''
  }

  const handleNav = (item: NavItem) => {
    if (item.feature) {
      // These features live under a specific event, so ask which one first.
      onPickFeature?.(item.feature)
      onNavigate?.()
      return
    }
    const href = item.href
    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      if (pathname !== path) {
        router.push(href)
      } else if (window.location.hash !== `#${hash}`) {
        // Setting the hash fires a hashchange event; the customer dashboard
        // listens for it to switch to the matching tab.
        window.location.hash = hash
      }
    } else if (pathname === href) {
      // Already on this page — clear any active hash and notify listeners,
      // since router.push on the same path never fires hashchange.
      if (window.location.hash) {
        history.replaceState(null, '', href)
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }
    } else {
      router.push(href)
    }
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-stone-200 dark:border-stone-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-orange-600 dark:text-orange-400">Occa</span>
          <span className="text-foreground">sio</span>
        </span>
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((entry, idx) => {
            if (!isNavLink(entry)) {
              // Section heading
              return (
                <p
                  key={`heading-${idx}`}
                  className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                >
                  {entry.label}
                </p>
              )
            }
            const item = entry
            const Icon = item.icon
            const active = isActive(item)
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left w-full',
                  active
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active && 'text-orange-600 dark:text-orange-400')} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <Separator className="my-4" />

        {/* Back to Home */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [pickerFeature, setPickerFeature] = React.useState<EventFeature | null>(null)

  const role = session?.user?.role || 'customer'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header bar */}
      <div className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-xl px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent
              role={role}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onPickFeature={setPickerFeature}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-lg font-bold">
            <span className="text-orange-600 dark:text-orange-400">Occa</span>
            <span className="text-foreground">sio</span>
          </span>
        </div>

        <div className="ml-auto">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-[10px] font-semibold">
              {session?.user?.name
                ? session.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/20">
          <SidebarContent
            role={role}
            pathname={pathname}
            onPickFeature={setPickerFeature}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Rendered outside the Sheet so it survives the mobile sidebar closing */}
      <EventPickerDialog
        feature={pickerFeature}
        open={pickerFeature !== null}
        onOpenChange={(open) => {
          if (!open) setPickerFeature(null)
        }}
      />
    </div>
  )
}
