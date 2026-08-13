# Task 4 — Header & Footer Ember & Noir Redesign

## Agent: Main Orchestrator

### Changes Made

#### `/home/z/my-project/src/components/layout/header.tsx`
- Replaced `CalendarDays` icon import with `Sparkles` from lucide-react
- Added gradient accent line at the very top: `h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600`
- Logo icon container changed from `rounded-lg` to `rounded-full` (circle)
- Logo icon background: `bg-orange-600`
- Brand text: "Occa" in `text-orange-600 dark:text-orange-400`, "sio" in `text-foreground`
- Nav underline hover: `bg-orange-600 dark:bg-orange-400`
- Notification badge: `bg-orange-500` (was `bg-amber-500`)
- Avatar fallback: `bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300`
- Sign up button: `bg-orange-600 hover:bg-orange-700`
- Mobile sheet logo: same `rounded-full` + Sparkles + orange theme
- All functionality preserved (theme toggle, notifications, user menu, mobile sheet)

#### `/home/z/my-project/src/components/layout/footer.tsx`
- Replaced `CalendarDays` icon import with `Sparkles`
- Logo icon container changed from `rounded-lg` to `rounded-full`
- Logo icon background: `bg-orange-600`
- Tagline updated to: "Where moments come alive."
- Social link hover colors: `hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 dark:hover:border-orange-800`
- Platform/Company link hover: `hover:text-orange-600 dark:hover:text-orange-400`
- Newsletter button: `bg-orange-600 hover:bg-orange-700`
- Replaced `Separator` component with warm gradient divider: `h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent`
- Removed unused `Separator` import
- All functionality preserved (newsletter form, legal modals, social links)

### Verification
- ESLint: 0 errors, 0 warnings
- Dev server: compiling successfully, no runtime errors
