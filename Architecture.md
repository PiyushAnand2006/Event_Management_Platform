# Occasio — Architecture Document

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  Next.js 16 App Router (React 19 + TypeScript 5)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │  Auth    │  │ Dashboard│  │  Public    │  │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  UI Layer: shadcn/ui (46 components) + Tailwind CSS 4  │  │
│  │  State: Zustand (UI) + React Query (server)           │  │
│  │  Real-time: Socket.IO Client                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API calls
┌──────────────────────┼──────────────────────────────────────┐
│                API Layer (Route Handlers)                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌──────┐ │
│  │  Auth   │ │ Events  │ │ Venues  │ │ CheckIn│ │ Live │ │
│  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes │ │Routes│ │
│  └─────────┘ └─────────┘ └─────────┘ └────────┘ └──────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐        │
│  │ Admin   │ │Invites  │ │ Stalls  │ │ Users  │        │
│  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes │        │
│  └─────────┘ └─────────┘ └─────────┘ └────────┘        │
└──────────┬──────────────┬──────────────────────────────────┘
           │              │
┌──────────┼──────────────┼──────────────────────────────────┐
│       ┌──┴──┐     ┌─────┴────┐     ┌──────────────────┐   │
│       │SQLite│     │ Socket.IO│     │  External Services│   │
│       │(Prisma)   │ Service  │     │  SMTP / Overpass  │   │
│       └─────┘     │ :3003    │     │  / z-ai-web-dev  │   │
│                   └──────────┘     └──────────────────┘   │
│                   Data / Services Layer                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Application Flow

### 2.1 Authentication Flow
```
User → Login Page → POST /api/auth/signup or /api/auth/[...nextauth]
     → NextAuth (Credentials Provider, JWT Strategy)
     → Session stored in JWT (includes role)
     → Redirect to role-based dashboard
```

### 2.2 Event Creation Flow
```
Organizer → Create Event Page → POST /api/events
         → Event created (status: "pending")
         → Admin views POST /api/admin/pending-events
         → Admin approves/rejects POST /api/admin/events/[id]/approve|reject
         → Event status changes → published
         → Event visible on public browse page
```

### 2.3 Registration & Ticketing Flow
```
Customer → Browse Events → GET /api/events
         → Event Detail → POST /api/events/[id]/register
         → Registration created (status: "registered")
         → POST /api/events/[id]/invitations/generate
         → Invitation with JWT token created
         → POST /api/events/[id]/invitations/send (email with QR/barcode)
         → Customer views ticket at /ticket/[invitationId]
         → Check-in at event: POST /api/checkin/scan or /manual
```

### 2.4 Live Event Flow
```
Organizer → Live Console → Creates Poll / Answers Q&A / Moderates Photos
         → Changes via API routes
         → Socket.IO emits to room `event:{eventId}`
Attendee → Guest Live Page → Socket.IO listens to room
         → Real-time updates for polls, Q&A, photos
```

### 2.5 Food Stall Fallback Flow
```
Stall declines → POST /api/events/[id]/stalls/[stallId]/decline
             → System searches nearby vendors (Overpass API)
             → GET /api/events/[id]/stalls/[stallId]/backup-vendors
             → Admin contacts vendor: PATCH /api/backup-vendors/[id]/contact
             → Admin promotes: POST /api/backup-vendors/[id]/promote
             → New stall created from backup vendor
```

---

## 3. File & Folder Structure

```
/home/z/my-project/
├── prisma/
│   ├── schema.prisma          # Database schema (21 models)
│   └── seed.ts                # Database seeder
│
├── db/
│   └── custom.db              # SQLite database file
│
├── mini-services/
│   └── socket-service/        # Socket.IO real-time service (port 3003)
│       ├── index.ts            # Socket event handlers
│       └── package.json
│
├── public/
│   ├── logo.svg               # App logo
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO robots
│
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── layout.tsx         # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── globals.css        # Theme (Ember & Noir - OKLCH)
│   │   │
│   │   ├── (auth)/            # Auth route group (centered card layout)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (dashboard)/       # Dashboard route group (sidebar layout)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx          # Role-based redirect
│   │   │   ├── customer/page.tsx           # Customer dashboard
│   │   │   ├── profile/page.tsx            # Profile editing
│   │   │   ├── admin/
│   │   │   │   ├── pending/page.tsx        # Event approvals
│   │   │   │   ├── stats/page.tsx          # Platform analytics
│   │   │   │   └── users/page.tsx          # User management
│   │   │   ├── checkin/[eventId]/page.tsx  # QR check-in
│   │   │   └── organizer/
│   │   │       ├── page.tsx                # Organizer dashboard
│   │   │       ├── events/
│   │   │       │   ├── page.tsx            # Event list
│   │   │       │   ├── create/page.tsx     # Create event
│   │   │       │   └── [eventId]/
│   │   │       │       ├── edit/page.tsx   # Edit event
│   │   │       │       ├── guests/page.tsx  # Guest management
│   │   │       │       ├── analytics/page.tsx # Analytics
│   │   │       │       ├── live/page.tsx    # Live console
│   │   │       │       ├── seatmap/page.tsx # Seat map builder
│   │   │       │       └── stalls/page.tsx  # Food stall mgmt
│   │   │
│   │   ├── (public)/         # Public route group (header layout)
│   │   │   ├── layout.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx               # Event browsing
│   │   │   │   └── [eventId]/
│   │   │   │       ├── page.tsx           # Event detail
│   │   │   │       ├── live/page.tsx      # Guest live view
│   │   │   │       └── lobby/page.tsx     # Virtual lobby
│   │   │   ├── ticket/[invitationId]/page.tsx # Digital ticket
│   │   │   ├── features/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── support/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── thank-you/page.tsx
│   │   │
│   │   └── api/              # API Routes (88 route files)
│   │       ├── route.ts                      # Health check
│   │       ├── admin/                        # Admin routes (9)
│   │       ├── auth/                         # Auth routes (3)
│   │       ├── backup-vendors/[vendorId]/    # Backup vendor routes (2)
│   │       ├── checkin/                      # Check-in routes (4)
│   │       ├── events/                       # Event routes (20+)
│   │       ├── invitations/[id]/             # Invitation routes (3)
│   │       ├── photos/[id]/moderate/         # Photo moderation (1)
│   │       ├── polls/[id]/                   # Poll routes (2)
│   │       ├── qna/[id]/                     # Q&A routes (4)
│   │       ├── stats/leaderboard/            # Leaderboard (1)
│   │       ├── ticket/[invitationId]/        # Ticket route (1)
│   │       ├── users/me/                     # User routes (4)
│   │       └── venues/                       # Venue routes (8+)
│   │
│   ├── components/
│   │   ├── ui/              # 46 shadcn/ui primitives
│   │   ├── landing/         # Landing page sections (6)
│   │   ├── layout/          # Header, Footer (2)
│   │   ├── events/          # Event-related (9)
│   │   ├── checkin/         # Check-in components (4)
│   │   ├── seatmap/         # 2D seat map editor (11)
│   │   ├── seatmap3d/       # 3D WebGL seat map (9)
│   │   ├── live/            # Live event features (9)
│   │   ├── lobby/           # Virtual lobby (8)
│   │   ├── stalls/          # Food stall components (3)
│   │   ├── invitations/     # Invitation management (3)
│   │   ├── admin/           # Admin tables (2)
│   │   ├── reviews/         # Review components (2)
│   │   ├── stats/           # Stats & leaderboard (2)
│   │   ├── common/          # Shared utilities (4)
│   │   ├── providers/       # React context providers (4)
│   │   └── about/           # About content (1)
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts           # Mobile breakpoint detection
│   │   ├── use-online-status.ts    # Network status
│   │   └── use-toast.ts            # Toast notifications
│   │
│   ├── lib/
│   │   ├── api-utils.ts           # API helpers (successResponse, errorResponse, getServerUser)
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── certificate.ts         # HTML certificate generator
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── email.ts               # Nodemailer (SMTP + mock fallback)
│   │   ├── invitation.ts          # JWT tokens, QR/barcode generation
│   │   ├── notification-helper.ts # Deduped notification creation
│   │   ├── refund-policy.ts        # Tiered refund calculator
│   │   ├── utils.ts               # cn() utility (clsx + tailwind-merge)
│   │   └── venue-presets.ts       # Seat layout generators
│   │
│   ├── store/
│   │   └── app-store.ts           # Zustand global store
│   │
│   └── types/
│       └── venue.ts               # Venue/Seat/POI TypeScript types
│
├── Caddyfile              # Reverse proxy (port 81 → 3000)
├── next.config.ts         # Next.js config (standalone output)
├── components.json        # shadcn/ui config (new-york style)
├── eslint.config.mjs      # ESLint configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

---

## 4. Technical Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5 | Type-safe development |
| **Bun** | Latest | JavaScript runtime & package manager |

### Styling & UI
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 4 | Utility-first CSS with OKLCH color system |
| **shadcn/ui** | new-york style | 46 pre-built UI components (Radix UI based) |
| **Framer Motion** | 12 | Animations and transitions |
| **Lucide React** | 0.525+ | Icon library |

### Database & ORM
| Technology | Version | Purpose |
|---|---|---|
| **Prisma** | 6.11+ | Type-safe ORM |
| **SQLite** | — | Embedded database (file: db/custom.db) |

### State Management
| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | 5 | Client-side global state (sidebar, search, activeTab, theme) |
| **React Query** (TanStack) | 5.82+ | Server state management with 60s stale time |

### Authentication
| Technology | Version | Purpose |
|---|---|---|
| **NextAuth.js** | 4.24+ | Authentication (Credentials provider, JWT strategy) |
| **bcryptjs** | 3 | Password hashing |
| **jose** | 6 | JWT token signing/verification |

### Real-time Communication
| Technology | Version | Purpose |
|---|---|---|
| **Socket.IO Client** | 4.8+ | Client-side WebSocket connection |
| **Socket.IO Server** | 4.x | Mini-service on port 3003 for real-time events |

### 3D Visualization
| Technology | Version | Purpose |
|---|---|---|
| **@react-three/fiber** | 9.7+ | React renderer for Three.js |
| **@react-three/drei** | 10.7+ | Three.js helpers and abstractions |
| **Three.js** | 0.185+ | WebGL 3D rendering |

### Data Visualization
| Technology | Version | Purpose |
|---|---|---|
| **Recharts** | 3.10+ | Chart library (bar, line, pie, area, funnel) |

### Forms & Validation
| Technology | Version | Purpose |
|---|---|---|
| **React Hook Form** | 7.60+ | Form state management |
| **Zod** | 4 | Schema validation |
| **@hookform/resolvers** | 5 | Zod resolver for React Hook Form |

### Barcodes & QR Codes
| Technology | Version | Purpose |
|---|---|---|
| **bwip-js** | 4.11+ | Code128 barcode generation |
| **qrcode.react** | 4.2+ | QR code component |
| **html5-qrcode** | 2.3+ | Camera-based QR/barcode scanner |

### Other Key Libraries
| Technology | Purpose |
|---|---|
| **@dnd-kit** | Drag-and-drop for seat map editor |
| **react-big-calendar** | Calendar view for events |
| **date-fns / dayjs** | Date formatting and manipulation |
| **nodemailer** | Email sending (SMTP + mock fallback) |
| **sharp** | Image processing |
| **next-themes** | Dark/light mode support |
| **react-markdown** | Markdown rendering |
| **@mdxeditor/editor** | Rich text/MDX editing |
| **next-intl** | Internationalization (i18n) |
| **z-ai-web-dev-sdk** | AI capabilities (image gen, LLM, VLM, etc.) |

---

## 5. Database Schema (21 Models)

| Model | Description | Key Relations |
|---|---|---|
| `User` | Users with roles, points, interests | → Account, Session, Event, Registration, Review, Bookmark, Notification, etc. |
| `Account` | NextAuth OAuth accounts | ← User |
| `Session` | NextAuth sessions | ← User |
| `VerificationToken` | NextAuth verification tokens | — |
| `Event` | Events with status lifecycle | ← User (organizer), → Registration, Review, Bookmark, Venue, Stall, Poll, QnA, Photo, Invitation, BackupVendor |
| `Registration` | Event registrations with tier & seat | ← User, ← Event, → Seat, → Invitation |
| `Review` | Event reviews (1-5 stars) | ← User, ← Event |
| `Bookmark` | User bookmarks | ← User, ← Event |
| `CoOrganizer` | Co-organizer assignments | ← User, ← Event |
| `Notification` | User notifications (11 types, 30d TTL) | ← User |
| `Venue` | Event venues with dimensions | ← Event, → VenueSection, → Seat, → POI |
| `VenueSection` | Venue sections with shapes/presets | ← Venue, → Seat |
| `Seat` | Individual seats with position/tier/status | ← Venue, ← VenueSection, → Registration |
| `POI` | Points of interest on venue map | ← Venue |
| `Invitation` | JWT-signed tickets with barcode/QR | ← Registration, ← Event |
| `FoodStall` | Event food/beverage stalls | ← Event, → BackupVendor |
| `BackupVendor` | Fallback vendors with distance/source | ← Event, ← FoodStall (triggering) |
| `Poll` | Live polls with options (JSON) | ← Event, → PollResponse |
| `PollResponse` | Poll votes (JSON selected options) | ← Poll, ← User |
| `QnAQuestion` | Q&A questions with upvotes | ← Event, ← User |
| `Photo` | Event photos with moderation | ← Event, ← User |

---

## 6. Route Groups & Layouts

| Route Group | Layout | Description |
|---|---|---|
| `(auth)` | Centered card layout with `auth-bg` gradient background | Login, Signup, Forgot Password |
| `(dashboard)` | Sidebar navigation layout with responsive collapse | Dashboard, Organizer, Admin, Profile, Check-in |
| `(public)` | Header + Footer layout with navigation | Landing, About, Events, Features, Pricing, etc. |

---

## 7. Gateway & Reverse Proxy

The application runs behind a **Caddy reverse proxy**:
- **Single external port** (81) → forwards to Next.js (port 3000)
- **API cross-service routing** uses `XTransformPort` query parameter
- **WebSocket** connections use `/?XTransformPort=3003`
- Example: `fetch('/api/test?XTransformPort=3003')` routes to socket service

---

## 8. Key Design Patterns

- **Provider Composition**: ThemeProvider → SessionProvider → QueryProvider → SocketProvider → App
- **API Route Pattern**: Server-side route handlers with `getServerUser()` for auth, `successResponse()`/`errorResponse()` for responses
- **Route Group Isolation**: `(auth)`, `(dashboard)`, `(public)` for layout separation without URL impact
- **Prisma Singleton**: Cached in `globalThis` during development to prevent connection exhaustion
- **JSON String Fields**: Prisma stores JSON as strings (e.g., `interests`, `tags`, `options`, `upvotedBy`)
- **Notification Deduplication**: 60-second window prevents duplicate notifications
