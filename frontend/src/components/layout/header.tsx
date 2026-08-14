'use client'

import React, { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  Bell,
  Menu,
  LogOut,
  Settings,
  LayoutDashboard,
  Sparkles,
  Search,
  PlusCircle,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isAuthenticated = status === 'authenticated'
  const isOrganizerOrAdmin =
    session?.user?.role === 'organizer' || session?.user?.role === 'admin'

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/events?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/events')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 shadow-xs transition-colors duration-200">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand + Quick Search */}
        <div className="flex items-center gap-6 flex-1 max-w-md">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Occa</span>
              <span className="text-foreground">sio</span>
            </span>
          </Link>

          {/* Search Bar in Header */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 bg-secondary/80 hover:bg-secondary rounded-full px-3.5 py-1.5 border border-border/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, topics..."
              className="bg-transparent border-none focus:outline-hidden text-sm text-foreground placeholder:text-muted-foreground/70 w-full"
            />
          </form>
        </div>

        {/* Center/Right Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Compass className="h-4 w-4 text-primary" />
            Find events
          </Link>
          <Link
            href={
              isAuthenticated
                ? isOrganizerOrAdmin
                  ? '/dashboard/organizer/events/new'
                  : '/dashboard'
                : '/signup'
            }
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            Start an event
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-primary hover:text-primary/90 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle */}
          {hydrated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}

          {/* Notification Bell */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-semibold">Notifications</p>
                </div>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2.5 cursor-pointer">
                  <p className="text-sm font-medium">New event invitation</p>
                  <p className="text-xs text-muted-foreground">
                    You have been invited to &quot;Tech Summit 2025&quot;
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2.5 cursor-pointer">
                  <p className="text-sm font-medium">RSVP confirmed</p>
                  <p className="text-xs text-muted-foreground">
                    Your registration for &quot;Startup Hackathon&quot; is confirmed!
                  </p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border border-border/60">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-semibold truncate">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email || ''}
                  </p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer mt-1">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex rounded-full text-sm font-medium px-4 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 shadow-sm transition-transform active:scale-95"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 lg:hidden rounded-full"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold">
                    <span className="text-primary">Occa</span>sio
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mt-6 px-1">
                <div className="flex items-center bg-secondary rounded-full px-3.5 py-2 border border-border/40">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="bg-transparent border-none focus:outline-hidden text-sm w-full text-foreground"
                  />
                </div>
              </form>

              <nav className="flex flex-col gap-1.5 mt-6">
                <Link
                  href="/events"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Compass className="h-4 w-4 text-primary" />
                  Find events
                </Link>
                <Link
                  href={
                    isAuthenticated
                      ? isOrganizerOrAdmin
                        ? '/dashboard/organizer/events/new'
                        : '/dashboard'
                      : '/signup'
                  }
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <PlusCircle className="h-4 w-4 text-amber-500" />
                  Start an event
                </Link>
                <Link
                  href="/features"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  About Us
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
              </nav>

              <div className="mt-auto pt-6 border-t border-border/50">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-full"
                    onClick={() => {
                      setMobileOpen(false)
                      signOut()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      asChild
                    >
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
