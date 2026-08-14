# Occasio — Phased Development Plan

This document breaks the Occasio project into manageable development phases. Each phase is designed to be a self-contained unit of work that can be built, tested, and verified independently.

---

## Phase 1: Foundation & Authentication ✅

**Goal:** Set up project infrastructure, authentication system, and basic user management.

### Tasks Completed:
- [x] Initialize Next.js 16 project with TypeScript, Tailwind CSS 4, and Bun
- [x] Configure shadcn/ui (new-york style) with 46 component primitives
- [x] Set up Prisma ORM with SQLite database
- [x] Create database schema (21 models)
- [x] Configure NextAuth.js v4 with Credentials provider and JWT strategy
- [x] Implement role-based access control (customer, organizer, admin, attendee)
- [x] Build authentication pages: Login, Signup, Forgot Password
- [x] Create auth layout with centered card design and gradient background
- [x] Implement `getServerUser()` API utility for server-side auth
- [x] Set up Zustand store for global UI state
- [x] Configure React Query provider with 60s stale time
- [x] Set up theme provider (next-themes) for dark/light mode
- [x] Configure Socket.IO provider for real-time features
- [x] Set up Caddy reverse proxy for gateway routing
- [x] Create API utilities (`successResponse`, `errorResponse`)

### Key Files:
- `src/app/(auth)/login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`
- `src/lib/auth.ts`, `src/lib/api-utils.ts`, `src/lib/db.ts`
- `src/store/app-store.ts`, `src/components/providers/`

---

## Phase 2: Landing & Public Pages ✅

**Goal:** Build the public-facing marketing website and event discovery experience.

### Tasks Completed:
- [x] Create landing page with Hero, Features, Testimonials, FAQ, CTA sections
- [x] Build Header component with responsive navigation
- [x] Build Footer component (sticky to bottom)
- [x] Create About, Features, Pricing, Support, Contact pages
- [x] Build Thank You page for post-registration
- [x] Implement event browsing page with search and filters
- [x] Create event detail page with registration flow
- [x] Build event card component with hover effects
- [x] Implement event filter bar and search bar
- [x] Add calendar view for events (react-big-calendar)
- [x] Create public layout with Header + Footer
- [x] Implement partner logos section
- [x] Add scroll-to-top component
- [x] Create animation wrapper for page transitions (Framer Motion)

### Key Files:
- `src/app/page.tsx` (landing page)
- `src/app/(public)/` (all public pages)
- `src/components/landing/`, `src/components/layout/`
- `src/components/events/event-card.tsx`, `event-filter-bar.tsx`, `event-search-bar.tsx`

---

## Phase 3: Dashboard & Event Management ✅

**Goal:** Build the organizer dashboard and full event CRUD lifecycle.

### Tasks Completed:
- [x] Create dashboard layout with responsive sidebar navigation
- [x] Build role-based dashboard redirect (customer → /customer, organizer → /organizer)
- [x] Create organizer dashboard with event stats overview
- [x] Build organizer events list page
- [x] Create event creation form with rich metadata
- [x] Build event editing page
- [x] Implement event status lifecycle (pending → approved/rejected → published)
- [x] Create customer dashboard (registered events, bookmarks)
- [x] Build profile management page
- [x] Implement CSV export button for registrations
- [x] Add countdown timer component for events
- [x] Create registration button with status handling
- [x] Build co-organizer management panel

### Key Files:
- `src/app/(dashboard)/layout.tsx` (sidebar layout)
- `src/app/(dashboard)/organizer/` (all organizer pages)
- `src/app/(dashboard)/customer/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/components/events/` (event components)
- `src/components/invitations/` (invitation management)

---

## Phase 4: Venue Builder & Seat Map ✅

**Goal:** Build the interactive 2D/3D venue builder with seat management.

### Tasks Completed:
- [x] Create venue creation form
- [x] Build 2D floor plan editor with canvas rendering
- [x] Implement venue section management (add, edit, delete sections)
- [x] Create seat layout presets (Theatre, Round Table, Classroom, Banquet)
- [x] Build seat generation from presets
- [x] Implement seat assignment panel (manual assignment)
- [x] Create auto-assignment algorithm with group constraints
- [x] Build group assignment view for batch operations
- [x] Implement seat locking mechanism
- [x] Create seat legend with tier color coding
- [x] Build assignment status display
- [x] Create POI (Point of Interest) editor
- [x] Implement seat fallback list for non-WebGL browsers
- [x] Build 3D WebGL seat map with Three.js (@react-three/fiber + drei)
- [x] Create WebGL detector for graceful fallback
- [x] Implement 3D seat mesh with color-coded status
- [x] Add search guest fly-to feature in 3D view
- [x] Build seat filter controls for 3D view
- [x] Create section labels and venue floor in 3D
- [x] Implement seat tooltip overlay in 3D

### Key Files:
- `src/app/(dashboard)/organizer/events/[eventId]/seatmap/page.tsx`
- `src/components/seatmap/` (11 2D components)
- `src/components/seatmap3d/` (9 3D components)
- `src/lib/venue-presets.ts`
- `src/types/venue.ts`

---

## Phase 5: Invitation & Ticketing System ✅

**Goal:** Build the invitation generation, ticketing, and check-in pipeline.

### Tasks Completed:
- [x] Implement JWT-based invitation token generation
- [x] Create Code128 barcode generation (bwip-js)
- [x] Create QR code generation (qrcode.react)
- [x] Build digital ticket display page with barcode/QR
- [x] Create invitation table with status tracking
- [x] Implement bulk invitation generation
- [x] Build CSV upload form for batch invitation creation
- [x] Implement invitation sending via email (Nodemailer)
- [x] Create bulk send modal
- [x] Build invitation resend and revoke functionality
- [x] Implement invitation lifecycle tracking (issued → sent → opened → checked_in / revoked)

### Key Files:
- `src/app/(public)/ticket/[invitationId]/page.tsx`
- `src/lib/invitation.ts`
- `src/components/invitations/InvitationTable.tsx`, `CSVUploadForm.tsx`, `BulkSendModal.tsx`
- `src/lib/email.ts`

---

## Phase 6: Check-In System ✅

**Goal:** Build the QR/barcode scanner and manual check-in interface.

### Tasks Completed:
- [x] Create QR/barcode scanner component (html5-qrcode)
- [x] Build manual search panel for registrant lookup
- [x] Implement check-in result display component
- [x] Build check-in statistics panel (real-time)
- [x] Create check-in page combining all components
- [x] Implement check-in API routes (scan, manual, search, stats)
- [x] Add duplicate check-in prevention
- [x] Integrate WebSocket for real-time check-in events

### Key Files:
- `src/app/(dashboard)/checkin/[eventId]/page.tsx`
- `src/components/checkin/CheckInScanner.tsx`, `ManualSearchPanel.tsx`, `CheckInResult.tsx`, `CheckInStatsPanel.tsx`
- `src/app/api/checkin/` (4 route files)

---

## Phase 7: Live Event Features ✅

**Goal:** Build real-time live engagement features (polls, Q&A, photo wall).

### Tasks Completed:
- [x] Create Socket.IO mini-service (port 3003) with room-based broadcasting
- [x] Build poll creator component for organizers
- [x] Create poll widget for attendees with real-time voting
- [x] Implement poll results chart (Recharts)
- [x] Build Q&A ask form for attendees
- [x] Create Q&A feed with upvoting
- [x] Implement Q&A moderation queue (approve, answer, reject)
- [x] Build photo upload form for attendees
- [x] Create photo wall with real-time display
- [x] Implement photo moderation queue (approve, reject with reason)
- [x] Build organizer live console combining all live features
- [x] Create guest live page for attendee participation
- [x] Integrate Socket.IO for real-time updates across all features

### Key Files:
- `mini-services/socket-service/index.ts`
- `src/app/(dashboard)/organizer/events/[eventId]/live/page.tsx`
- `src/app/(public)/events/[eventId]/live/page.tsx`
- `src/components/live/` (9 components)
- `src/components/providers/socket-provider.tsx`

---

## Phase 8: Food Stall Management & Vendor Fallback ✅

**Goal:** Build food stall management with automatic backup vendor discovery.

### Tasks Completed:
- [x] Create food stall CRUD operations
- [x] Build stall card component with status display
- [x] Create stall form for adding/editing stalls
- [x] Implement contract status tracking (pending, confirmed, declined, cancelled)
- [x] Build backup vendor discovery (Overpass API / Google / manual)
- [x] Create backup vendor panel with distance and contact status
- [x] Implement vendor contact tracking
- [x] Build vendor promotion to stall feature
- [x] Create stalls management page for organizers

### Key Files:
- `src/app/(dashboard)/organizer/events/[eventId]/stalls/page.tsx`
- `src/components/stalls/stall-card.tsx`, `stall-form.tsx`, `backup-vendor-panel.tsx`
- `src/app/api/events/[id]/stalls/` (stall routes)
- `src/app/api/backup-vendors/` (vendor routes)

---

## Phase 9: Virtual Lobby & Analytics ✅

**Goal:** Build the virtual lobby experience and comprehensive analytics.

### Tasks Completed:
- [x] Create interactive venue map for lobby
- [x] Build POI markers and detail sheets
- [x] Implement direction arrows and distance labels
- [x] Create my-seat indicator for attendees
- [x] Build map controls (zoom, pan)
- [x] Implement stall status banners
- [x] Create walking directions between POIs
- [x] Build event analytics dashboard (registration trends, check-in rates)
- [x] Implement poll analytics visualization
- [x] Create RSVP funnel chart
- [x] Build seat utilization analytics
- [x] Create admin platform statistics page
- [x] Build user leaderboard with engagement points
- [x] Create stats cards component
- [x] Implement review/rating system for events

### Key Files:
- `src/app/(public)/events/[eventId]/lobby/page.tsx`
- `src/app/(dashboard)/organizer/events/[eventId]/analytics/page.tsx`
- `src/app/(dashboard)/admin/stats/page.tsx`
- `src/components/lobby/` (8 components)
- `src/components/stats/` (2 components)
- `src/components/reviews/` (2 components)

---

## Phase 10: Admin Panel, Notifications & Polish ✅

**Goal:** Build admin management, notification system, and final polish.

### Tasks Completed:
- [x] Create admin pending events approval page
- [x] Build admin event table with approve/reject actions
- [x] Implement bulk event approval/rejection
- [x] Create admin users management page
- [x] Build admin user table with block/unblock/role-change
- [x] Implement 11 notification types with deduplication (60s window)
- [x] Create notification center (mark read, mark all read)
- [x] Implement real-time notification push via WebSocket
- [x] Build online/offline detection for network status
- [x] Create legal modal component
- [x] Implement refund policy calculator (100% >7d, 50% 2-7d, 0% <24h)
- [x] Build HTML certificate generator
- [x] Add PWA manifest for installability
- [x] Implement event reminder system
- [x] Create registration cancellation with refund flow
- [x] Build co-organizer invitation system
- [x] Fix all bugs: icon corrections, async fixes, Radix SelectItem, API path fixes, Array.isArray guards

### Key Files:
- `src/app/(dashboard)/admin/` (3 pages)
- `src/app/api/admin/` (9 route files)
- `src/lib/notification-helper.ts`, `src/lib/refund-policy.ts`, `src/lib/certificate.ts`
- `src/components/admin/` (2 components)
- `src/components/common/` (4 components)

---

## Phase 11: Theme Redesign 🔄

**Goal:** Completely redesign the website theme with new visual identity.

### Tasks:
- [ ] Design new color palette and OKLCH theme variables
- [ ] Update `globals.css` with new theme (colors, gradients, patterns)
- [ ] Review and update any hardcoded color values in components
- [ ] Update typography choices if needed
- [ ] Verify dark/light mode support
- [ ] Browser verification of new theme across all pages

---

## Future Phases (Planned)

### Phase 12: Internationalization (i18n)
- [ ] Configure `next-intl` for multi-language support
- [ ] Create translation files for all UI strings
- [ ] Build language switcher component
- [ ] Localize date/time/currency formatting

### Phase 13: Payment Integration
- [ ] Integrate Stripe payment gateway
- [ ] Implement paid event registration flow
- [ ] Build payment status tracking
- [ ] Handle refunds programmatically

### Phase 14: Mobile App (PWA Enhancement)
- [ ] Enhance PWA with service worker caching
- [ ] Add push notification support
- [ ] Implement offline-first architecture
- [ ] Build camera QR scanner as PWA feature

### Phase 15: Performance & Scale
- [ ] Migrate to PostgreSQL for production scale
- [ ] Add Redis caching layer
- [ ] Implement CDN for static assets
- [ ] Optimize bundle size and loading performance
