# Occasio — Memory & Progress Log

> This file keeps the AI updated on project progress. It prevents context loss when switching to new chat sessions and avoids wasting tokens by re-reading the entire codebase.

**Last Updated:** Phase 10 Complete — All core features built and verified

---

## Project Summary

| Field | Value |
|---|---|
| **Project Name** | Occasio — Event & Ceremony Management Platform |
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (new-york style, 46 components) |
| **Database** | SQLite via Prisma ORM (21 models) |
| **Real-time** | Socket.IO mini-service on port 3003 |
| **Theme** | Ember & Noir (OKLCH color system, warm coral/charcoal) |
| **Total Pages** | 31 (23 pages + 6 layouts) |
| **API Routes** | 88 route handlers |
| **Components** | 96 component files |

---

## Completed Phases

| Phase | Status | Summary |
|---|---|---|
| Phase 1: Foundation & Auth | ✅ Complete | Project setup, NextAuth, Prisma, providers, auth pages |
| Phase 2: Landing & Public | ✅ Complete | Landing page, header/footer, event browsing, marketing pages |
| Phase 3: Dashboard & Events | ✅ Complete | Organizer dashboard, event CRUD, customer dashboard, profile |
| Phase 4: Venue & Seat Map | ✅ Complete | 2D editor, 3D WebGL, seat presets, assignment, POIs |
| Phase 5: Invitations & Tickets | ✅ Complete | JWT tickets, QR/barcode, bulk import, email sending |
| Phase 6: Check-In | ✅ Complete | QR scanner, manual check-in, stats panel |
| Phase 7: Live Features | ✅ Complete | Polls, Q&A, photo wall, moderation, Socket.IO service |
| Phase 8: Food Stalls | ✅ Complete | Stall CRUD, backup vendor discovery, vendor promotion |
| Phase 9: Lobby & Analytics | ✅ Complete | Virtual lobby, analytics dashboard, reviews, leaderboard |
| Phase 10: Admin & Polish | ✅ Complete | Admin panel, notifications, bug fixes, cleanup |

---

## Known Bug Fixes (Applied)

| Bug | Fix | Files Affected |
|---|---|---|
| `MessageCircleAnswer` icon doesn't exist | Changed to `Reply` | `qna-feed.tsx` |
| `Chair` icon doesn't exist | Changed to `Armchair` | `seat-dot.tsx`, `seat-fallback-list.tsx` |
| `await` in non-async function | Added `async` keyword | `event-filter-bar.tsx`, `events/page.tsx` |
| `SelectItem value=""` crashes Radix | Changed to placeholder pattern | `group-assignment-view.tsx` |
| `data.total` path mismatch | Changed to `data.pagination.total` | `qna-feed.tsx` |
| Non-array rendering crash | Added `Array.isArray()` guards | 7 live components |

---

## File Architecture Quick Reference

```
src/
├── app/
│   ├── globals.css          ← THEME (OKLCH variables here)
│   ├── layout.tsx           ← ROOT LAYOUT (providers + fonts)
│   ├── page.tsx             ← LANDING PAGE (/)
│   ├── (auth)/              ← Auth pages (login, signup, forgot-password)
│   ├── (dashboard)/         ← Dashboard (sidebar layout)
│   │   ├── organizer/       ← Organizer pages (events, seatmap, live, stalls, analytics)
│   │   ├── admin/           ← Admin pages (pending, stats, users)
│   │   └── customer/        ← Customer dashboard
│   ├── (public)/            ← Public pages (events, about, features, pricing, etc.)
│   └── api/                 ← 88 API route handlers
├── components/
│   ├── ui/                  ← 46 shadcn/ui primitives (DO NOT MODIFY)
│   ├── landing/             ← Landing page sections
│   ├── layout/              ← Header, Footer
│   ├── events/              ← Event components
│   ├── seatmap/             ← 2D seat map (11 components)
│   ├── seatmap3d/           ← 3D WebGL seat map (9 components)
│   ├── live/                ← Polls, Q&A, Photos (9 components)
│   ├── lobby/               ← Virtual lobby (8 components)
│   └── [other categories]   ← stalls, checkin, invitations, admin, reviews, stats, common, providers
├── lib/                     ← Utilities (auth, db, email, invitation, etc.)
├── store/                   ← Zustand (app-store.ts)
├── hooks/                   ← Custom hooks (mobile, online-status, toast)
└── types/                   ← TypeScript types (venue.ts)
```

---

## Key Technical Decisions

1. **Tailwind CSS 4** uses CSS configuration in `globals.css`, NOT `tailwind.config.ts`
2. **JSON fields in Prisma** are stored as `String` type (e.g., `interests: "[]"`, `options: "[...]"`)
3. **All pages are `'use client'`** — server logic is in API routes only
4. **Socket.IO** runs as a separate mini-service on port 3003
5. **Gateway routing** uses `XTransformPort` query parameter for cross-service requests
6. **z-ai-web-dev-sdk** MUST be used in backend only, never client-side
7. **OKLCH color system** provides perceptually uniform colors across light/dark modes
8. **Notification deduplication** uses 60-second window to prevent spam

---

## Current State & Next Steps

### What's Working:
- All 31 routes return 200 status
- Lint passes with zero errors
- Socket.IO service running on port 3003
- Database seeded with sample data
- All live features (polls, Q&A, photos) functional
- 2D and 3D seat map builders operational
- Check-in system with QR/barcode scanning
- Admin panel with event approval and user management

### Pending Tasks:
- [ ] **Phase 11: Theme Redesign** — User requested "completely new design" (not yet started)
- [ ] Internationalization (next-intl configured but not implemented)
- [ ] Payment integration (Stripe)
- [ ] PWA service worker enhancement
- [ ] Production database migration (SQLite → PostgreSQL)

### Important Notes for Next Session:
- The user's latest request was to **completely change the website theme with a new design**
- Theme is controlled by `src/app/globals.css` — all OKLCH CSS variables
- Check for hardcoded colors in components when redesigning
- Always verify with Agent Browser after changes
- Dev server log at `/home/z/my-project/dev.log`
- Worklog at `/home/z/my-project/worklog.md`

---

## Commands Quick Reference

| Command | Purpose |
|---|---|
| `bun run dev` | Start dev server (port 3000, background) |
| `bun run lint` | ESLint code quality check |
| `bun run db:push` | Push Prisma schema changes to database |
| `bun run db:generate` | Regenerate Prisma client |
