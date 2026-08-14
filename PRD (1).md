# Occasio — Project Requirements Document

## 1. Project Overview

**Occasio** is a modern, full-stack **Event & Ceremony Management Platform** that empowers organizers to create, manage, and elevate every type of event — from intimate gatherings and private ceremonies to large-scale conferences, weddings, and hackathons. The platform provides end-to-end event lifecycle management including creation, registration, ticketing, venue design, check-in, live engagement, and post-event analytics.

---

## 2. Target Users

### Primary Users

| User Type | Description | Key Needs |
|---|---|---|
| **Organizers** | Event creators and managers (professionals or individuals) | Create/manage events, design venue layouts, track registrations, manage food stalls, run live sessions, analyze post-event data |
| **Attendees / Customers** | People who register for and attend events | Browse events, register/bookmark, receive tickets (QR/barcode), check-in at venues, participate in live features, leave reviews |
| **Admins** | Platform administrators | Approve/reject events, manage users, view platform-wide analytics, handle incidents |

### Secondary Users

| User Type | Description |
|---|---|
| **Co-Organizers** | Collaborators invited by the primary organizer to help manage an event |
| **Food Stall Vendors** | External vendors providing food/beverage services at events |
| **Backup Vendors** | Fallback vendors auto-discovered when primary vendors decline or cancel |

---

## 3. Feature Requirements

### 3.1 Authentication & User Management
- Email/password registration and login (NextAuth.js Credentials provider)
- JWT-based session management with role-based access control
- Roles: `customer`, `organizer`, `admin`, `attendee`
- User profile management (name, bio, interests, avatar, phone)
- Password recovery flow
- Admin can block/unblock users and change roles
- Gamification: Points system for user engagement

### 3.2 Event Management (Organizer)
- **Event CRUD**: Create, read, update events with rich metadata (title, description, type, category, date, location, capacity, pricing, tags)
- **Event Types**: Conference, Seminar, Hackathon, Wedding, Private Ceremony, Other
- **Event Status Lifecycle**: `pending` → `approved` → `published` (or `rejected`)
- **Admin Approval**: New events require admin approval before being published
- **Co-Organizer Management**: Invite collaborators to co-manage events
- **Poster Generation**: AI-powered event poster creation (via z-ai-web-dev-sdk)
- **Event Reminders**: Send reminders to registered attendees
- **CSV Export**: Export registration data as CSV

### 3.3 Event Discovery (Customer/Attendee)
- **Browse Events**: Public event listing with search, category filters, and calendar view
- **Event Detail Page**: Full event information, reviews, registration button
- **Bookmarks**: Save events for later
- **Recommended Events**: Personalized event recommendations
- **Event Categories**: Technology, Music, Art, Food, Sports, etc.
- **Registration**: Register for free and paid events
- **Cancellation & Refund**: Cancel registrations with tiered refund policy (100% >7d, 50% 2-7d, 0% <24h)

### 3.4 Venue Builder & Seat Map
- **2D Floor Plan Editor**: Visual drag-and-drop venue designer using canvas
- **3D WebGL Seat Map**: Three.js-based 3D visualization with @react-three/fiber
- **Venue Sections**: Create named sections (e.g., "Stage-Front", "Balcony", "Table 3") with shapes (rectangle, circle)
- **Seat Presets**: Auto-generate seat layouts — Theatre, Round Table, Classroom, Banquet
- **Seat Tiers**: VIP, Reserved, General seating with color coding
- **Seat Assignment**: Manual or automatic seat assignment with group constraints
- **Points of Interest (POIs)**: Mark restrooms, entrances, stages, food stalls on the map
- **Seat Locking**: Lock specific seats to prevent auto-assignment changes
- **WebGL Fallback**: Graceful fallback to 2D list view when WebGL is unavailable

### 3.5 Invitation & Ticketing
- **Invitation Generation**: Create signed JWT invitations with unique tokens
- **Barcode & QR Codes**: Code128 barcode + QR code generation (bwip-js, qrcode.react)
- **Digital Ticket Page**: Scannable ticket display with barcode/QR
- **CSV Bulk Import**: Generate invitations from CSV data
- **Bulk Send**: Send invitations via email (Nodemailer with SMTP or console mock)
- **Invitation Status Tracking**: `issued` → `sent` → `opened` → `checked_in` / `revoked`
- **Resend & Revoke**: Manage invitation lifecycle

### 3.6 Check-In System
- **QR/Barcode Scanner**: Real-time camera-based scanning (html5-qrcode)
- **Manual Check-In**: Search and manually check in registrants
- **Check-In Statistics**: Real-time stats panel (total, checked-in, remaining)
- **Duplicate Prevention**: Prevent double check-ins
- **WebSocket Integration**: Real-time check-in event broadcasting

### 3.7 Live Event Features
- **Live Polls**: Create polls with multiple options, real-time voting, results visualization (Recharts)
- **Q&A Feed**: Attendees ask questions, upvote, moderator approve/answer/reject
- **Photo Wall**: Attendees upload photos, moderator approval queue, real-time display
- **Photo Moderation**: Approve/reject photos with rejection reasons
- **Organizer Console**: Combined dashboard for all live features
- **Real-time Updates**: All live features use Socket.IO for instant updates

### 3.8 Food Stall Management
- **Stall CRUD**: Add, edit, delete food/beverage/dessert/decor/photography stalls
- **Contract Management**: Track stall status (`pending` → `confirmed` / `declined` / `cancelled`)
- **Backup Vendor Discovery**: Auto-find nearby vendors when a stall declines (via Overpass API / Google / manual entry)
- **Vendor Contact Tracking**: Track vendor contact status (`unverified` → `contacted` → `confirmed`)
- **Vendor Promotion**: Promote backup vendors to full stall status when needed

### 3.9 Virtual Lobby
- **Interactive Map**: Venue-based interactive map showing seat locations, POIs, stalls
- **Direction Navigation**: Walking directions between POIs
- **My Seat Indicator**: Highlight the attendee's assigned seat
- **Stall Status Banners**: Show live stall availability and status
- **Distance Labels**: Show distances to POIs

### 3.10 Analytics & Reporting
- **Event Analytics**: Registration trends, check-in rates, poll participation, RSVP funnel, seat utilization
- **Admin Platform Stats**: User growth, event statistics, platform-wide analytics
- **Leaderboard**: User engagement leaderboard
- **Interactive Charts**: Recharts-based visualizations with OKLCH color system

### 3.11 Notifications
- **11 Notification Types**: Registration confirmed, check-in success, seat assigned, vendor declined, vendor fallback ready, Q&A answered, photo rejected, event reminder, event approved, event rejected, waitlist promoted
- **Deduplication**: 60-second dedup window to prevent spam
- **TTL**: Auto-expire after 30 days
- **Real-time Push**: WebSocket-based notification delivery

### 3.12 Reviews & Ratings
- **Post-Event Reviews**: Attendees rate and review events (1-5 stars + comment)
- **Average Rating Display**: Aggregated ratings on event detail pages

### 3.13 Landing & Marketing Pages
- **Hero Section**: Animated hero with gradient background and mesh pattern
- **Feature Showcase**: Highlight platform capabilities
- **Testimonials**: Social proof section
- **FAQ Section**: Common questions
- **CTA Section**: Call-to-action for sign-up
- **Partner Logos**: Trust-building partner display
- **About, Features, Pricing, Support, Contact, Thank You pages**

---

## 4. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| **Performance** | Client-side rendering for all pages; React Query with 60s stale time for server state |
| **Scalability** | SQLite for current scale; Prisma ORM allows migration to PostgreSQL/MySQL |
| **Real-time** | Socket.IO service on port 3003 with room-based broadcasting |
| **Responsive Design** | Mobile-first design with Tailwind CSS breakpoints (sm, md, lg, xl) |
| **Accessibility** | Semantic HTML, ARIA attributes, keyboard navigation, screen reader support |
| **Theme Support** | Light/dark mode via next-themes with system default |
| **PWA** | Web App Manifest for installability |
| **Security** | JWT-based auth, signed invitation tokens, bcrypt password hashing, role-based access |
| **Error Handling** | Toast notifications, loading skeletons, clear error messages |
| **Online/Offline** | Network status detection with user notification |

---

## 5. Success Metrics

- **Event Creation**: Organizers can create and publish events within minutes
- **Check-In Efficiency**: QR/barcode scan completes check-in in <2 seconds
- **Live Engagement**: Real-time polls, Q&A, and photos update within 500ms
- **User Satisfaction**: Review ratings and platform retention
- **Admin Efficiency**: Bulk approval/rejection of pending events
