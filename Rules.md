# Occasio — Rules & Boundaries for AI

This document sets the rules and boundaries that AI assistants must follow when working on the Occasio project. These rules ensure consistency, prevent regressions, and maintain code quality.

---

## 1. Technology Rules (MANDATORY)

### 1.1 Non-Negotiable Stack
These technologies MUST be used and CANNOT be changed:

| Technology | Rule |
|---|---|
| **Next.js 16** | Must use App Router. NO Pages Router. |
| **React 19** | All components use React 19 features. |
| **TypeScript 5** | All files must be typed. No `any` unless absolutely necessary. |
| **Tailwind CSS 4** | CSS-first configuration via `globals.css`. NO `tailwind.config.ts`. |
| **Prisma ORM** | Database access ONLY through Prisma. No raw SQL. |
| **SQLite** | Current database. Schema changes via `prisma/schema.prisma` → `bun run db:push` |

### 1.2 Required Libraries (Use These)
| Category | Library | Notes |
|---|---|---|
| UI Components | **shadcn/ui** (new-york style) | Always prefer existing `src/components/ui/` primitives |
| Icons | **Lucide React** | Only use icons that exist in the package |
| State (UI) | **Zustand** | Global client state |
| State (Server) | **TanStack React Query** | Server state with caching |
| Forms | **React Hook Form + Zod** | Form handling and validation |
| Charts | **Recharts** | Data visualization |
| Animations | **Framer Motion** | Page transitions and micro-interactions |
| Real-time | **Socket.IO** | WebSocket communication |
| Auth | **NextAuth.js v4** | Credentials provider, JWT strategy |
| 3D | **@react-three/fiber + drei** | WebGL 3D seat map |
| Date | **date-fns** or **dayjs** | Date formatting |

### 1.3 Libraries to AVOID
| Library | Reason | Alternative |
|---|---|---|
| CSS-in-JS (styled-components, emotion) | Use Tailwind CSS 4 | Tailwind utility classes |
| Redux / Redux Toolkit | Use Zustand instead | Zustand |
| Axios | Use native `fetch` API | `fetch()` |
| MongoDB / Mongoose | Use Prisma + SQLite | Prisma ORM |
| GraphQL | Use REST API routes | Next.js Route Handlers |
| Material UI / Chakra UI | Use shadcn/ui | shadcn/ui components |
| next/image for complex operations | Use sharp for processing | sharp |
| react-query-devtools in production | Dev-only | Remove in production builds |

### 1.4 External Libraries Request Policy
If a user requests an external library NOT in our stack:
- Politely redirect them to use built-in alternatives
- Explain the benefits of the predefined stack (consistency, optimization, support)
- Provide equivalent solutions using available libraries

---

## 2. Code Style Rules

### 2.1 TypeScript
- All files must use TypeScript (`.ts` or `.tsx`)
- Use strict typing — avoid `any`, prefer `unknown` for uncertain types
- Export interfaces for all shared types
- Use `import type` for type-only imports

### 2.2 Imports
- Use ES6+ `import`/`export` syntax
- Use `@/` path alias for `src/` directory imports
- Example: `import { Button } from "@/components/ui/button"`

### 2.3 Components
- Use `'use client'` directive for client-side components
- Use `'use server'` directive for server-side functions (but prefer API routes)
- Functional components only — no class components
- Use existing shadcn/ui components instead of building from scratch
- Components in `src/components/ui/` should NEVER be modified directly

### 2.4 Tailwind CSS 4
- Configuration is in `src/app/globals.css` using CSS variables and `@theme inline`
- NO `tailwind.config.ts` file
- Use Tailwind CSS variables: `bg-primary`, `text-foreground`, `bg-background`, etc.
- Responsive design is MANDATORY: `sm:`, `md:`, `lg:`, `xl:` prefixes
- Touch targets must be minimum 44px

### 2.5 API Routes
- Use API route handlers (`route.ts`) — NOT Server Actions
- Use `successResponse(data, status)` and `errorResponse(message, status)` from `@/lib/api-utils`
- Use `getServerUser(request)` for authentication in API routes
- All API responses must be JSON

### 2.6 Database
- Schema changes go in `prisma/schema.prisma`
- Run `bun run db:push` after schema changes
- Import database client: `import { db } from '@/lib/db'`
- JSON fields stored as strings — use JSON.parse/stringify when reading/writing
- Prisma schema primitive types CANNOT be lists (use JSON strings)

### 2.7 Naming Conventions
- Files: kebab-case (`event-card.tsx`, `seat-map-editor.tsx`)
- Components: PascalCase (`EventCard`, `SeatMapEditor`)
- Functions: camelCase (`handleClick`, `fetchEvents`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- API routes: kebab-case paths (`/api/events/[id]/seat-assignment/auto`)

---

## 3. UI/UX Rules

### 3.1 Layout
- **Sticky Footer**: If a footer exists, it MUST stick to the bottom on short pages (`min-h-screen flex flex-col` + `mt-auto`)
- **Mobile-First**: Design for mobile, then enhance for desktop
- **Card Alignment**: Consistent padding (`p-4` or `p-6`), gap (`gap-4` or `gap-6`)
- **Long Lists**: `max-h-96 overflow-y-auto` with custom scrollbar styling

### 3.2 Colors
- **NO indigo or blue colors** unless explicitly requested by user
- Use Tailwind CSS built-in variables (`bg-primary`, `text-primary-foreground`, `bg-background`)
- Current theme: "Ember & Noir" — warm orange/coral primary with charcoal

### 3.3 Accessibility (MANDATORY)
- Semantic HTML: `main`, `header`, `nav`, `section`, `article`
- ARIA attributes where needed
- Screen reader text: `sr-only` class
- Alt text on all images
- Keyboard navigation for all interactive elements

### 3.4 Responsive Breakpoints
- `sm:` = 640px
- `md:` = 768px
- `lg:` = 1024px
- `xl:` = 1280px

### 3.5 Background
- The project renders on a **white background**
- For different backgrounds, use wrapper elements with Tailwind classes
- Dark mode must be supported via `next-themes`

---

## 4. Development Rules

### 4.1 Server & Ports
- Next.js dev server runs on **port 3000** only
- Socket.IO service runs on **port 3003**
- Use `bun run dev` to start the project (always in background)
- NEVER run `bun run build`
- Use `bun run lint` to check code quality

### 4.2 Gateway / API Requests
- Single external port — Caddy reverse proxy handles routing
- For cross-service requests, use `XTransformPort` query parameter
- Example: `fetch('/api/test?XTransformPort=3003')`
- NEVER use absolute URLs with ports (e.g., `http://localhost:3003`)
- WebSocket: `io('/?XTransformPort=3003')`

### 4.3 File Writing
- ALWAYS prefer editing existing files over creating new ones
- NEVER create new files unless explicitly required
- NEVER proactively create documentation files unless asked
- Only the `/` route is user-visible (defined in `src/app/page.tsx`)

### 4.4 Mini Services
- New services go in `mini-services/` folder
- Each must be independent Bun project with own `package.json`
- Must define specific port (not PORT env variable)
- Entry file: `index.ts` or `index.js`
- Start with `bun run dev` (use `bun --hot` for auto-restart)

### 4.5 z-ai-web-dev-sdk Usage
- MUST be used in backend (API routes) only
- MUST NOT be used in client-side code

### 4.6 Testing
- Do NOT write test code unless explicitly requested

### 4.7 Environment
- Environment variables stored in `.env` file
- Database URL: `DATABASE_URL` in `.env`

---

## 5. Error Handling Rules

### 5.1 API Routes
- Always wrap database operations in try/catch
- Use `errorResponse(message, statusCode)` for errors
- Validate input with Zod schemas before processing
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)

### 5.2 Client Components
- Show loading skeletons during async operations
- Display clear, actionable error messages
- Use toast notifications (Sonner) for user action feedback
- Handle `Array.isArray()` guards before rendering lists (prevents runtime crashes)

### 5.3 Known Pitfalls to Avoid
- **DO NOT** use `await` in non-async functions
- **DO NOT** pass empty string `value=""` to Radix SelectItem (causes crash)
- **DO NOT** use icons that don't exist in Lucide React (always verify)
- **DO NOT** access nested API response properties without checking existence
- **DO NOT** render arrays without `Array.isArray()` guard

---

## 6. Communication Rules

### 6.1 User Interaction
- Proactively leverage relevant Skills (VLM, TTS, LLM, ASR, Image-Generation, Web-Search, etc.)
- Direct user to **Preview Panel** (NOT localhost URLs) for viewing the app
- Inform user about "Open in New Tab" option for separate browser view
- Report completion honestly — "It compiles" is NOT sufficient; browser verification is required

### 6.2 Verification
- After code changes, read `/home/z/my-project/dev.log` for errors
- Use Agent Browser for end-to-end verification of rendered pages
- Verify: visual rendering, interactivity, responsive layout, sticky footer
- Fix and re-verify until all issues are resolved

### 6.3 AI Context
- Maintain `/home/z/my-project/worklog.md` for progress tracking
- Read worklog before starting work to understand previous agent's context
- Append (never overwrite) to worklog after completing tasks
- Use TodoRead/TodoWrite for task tracking

---

## 7. Prisma Schema Rules

### 7.1 Field Rules
- All models must have `id` with `@id @default(cuid())`
- Use `@map("snake_case")` for table names
- Use `@updatedAt` for automatic timestamp updates
- JSON arrays must be stored as `String` type with `@default("[]")`
- Add `@@index` on frequently queried fields
- Add `@@unique` on natural composite keys (e.g., `[userId, eventId]`)

### 7.2 Relation Rules
- Use `onDelete: Cascade` for dependent relations
- Use `@relation("RelationName")` for disambiguation
- Optional relations use `?` suffix

---

## 8. What AI Should NOT Do

- **Do NOT** delete files without explicit user permission
- **Do NOT** modify `src/components/ui/` files (shadcn/ui primitives) directly
- **Do NOT** create routes other than `/` unless explicitly asked
- **Do NOT** use `console.log` in production code (use proper logging)
- **Do NOT** commit code (no git operations unless asked)
- **Do NOT** install unnecessary packages
- **Do NOT** modify `Caddyfile` unless instructed
- **Do NOT** change the database provider from SQLite unless explicitly requested
- **Do NOT** skip verification after code changes
