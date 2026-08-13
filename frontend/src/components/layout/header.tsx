'use client'

import React, { useSyncExternalStore } from 'react'
import Link from 'next/link'
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

const publicLinks = [
  { href: '/events', label: 'Events' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
]

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const authLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function Header() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const isAuthenticated = status === 'authenticated'
  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-top-2 duration-300"
    >
      {/* Gradient accent line at the very top */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white transition-transform group-hover:scale-110">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-orange-600 dark:text-orange-400">Occa</span>
            <span className="text-foreground">sio</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-orange-600 dark:bg-orange-400 transition-all group-hover:w-2/3 rounded-full" />
            </Link>
          ))}
          {isAuthenticated && authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-orange-600 dark:bg-orange-400 transition-all group-hover:w-2/3 rounded-full" />
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {hydrated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-full"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
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
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white border-0">3</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-3 py-2 border-b"><p className="text-sm font-semibold">Notifications</p></div>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">New event invitation</p>
                  <p className="text-xs text-muted-foreground">You&apos;ve been invited to &quot;Tech Summit 2025&quot;</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">RSVP confirmed</p>
                  <p className="text-xs text-muted-foreground">5 guests confirmed for your event</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">Event reminder</p>
                  <p className="text-xs text-muted-foreground">&quot;Annual Gala&quot; starts in 2 hours</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-semibold">{session.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user?.email || ''}</p>
                </div>
                <DropdownMenuItem asChild><Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" asChild><Link href="/signup">Sign up</Link></Button>
            </div>
          )}

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white"><Sparkles className="h-3.5 w-3.5" /></div>
                  <span className="text-lg font-bold"><span className="text-orange-600 dark:text-orange-400">Occa</span>sio</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 mt-4">
                {publicLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{link.label}</Link>
                ))}
                {isAuthenticated && authLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><link.icon className="h-4 w-4" />{link.label}</Link>
                ))}
              </nav>
              <div className="mt-auto px-4 pb-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-semibold">{userInitials}</AvatarFallback></Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{session.user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email || ''}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start" onClick={() => { setMobileOpen(false); signOut() }}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild><Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link></Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" asChild><Link href="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link></Button>
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
