# Occasio — Design System & Visual Identity

This document defines the visual language for the Occasio platform, including colors, theme, fonts, typography, spacing, and component patterns.

---

## 1. Theme Identity

**Theme Name:** Ember & Noir

**Design Philosophy:** Warm, inviting, and sophisticated. The "Ember" represents the warm orange/coral energy of events and celebrations. The "Noir" represents the refined, professional charcoal foundation. Together, they create a premium feel that works for both casual gatherings and corporate conferences.

**Color Space:** OKLCH (Perceptually Uniform Color Space)
- OKLCH provides better perceptual uniformity than HSL
- Maintains consistent lightness across hues
- Superior for dark mode transitions

---

## 2. Color Palette

### 2.1 Light Mode (`:root`)

| Token | OKLCH Value | Description | Usage |
|---|---|---|---|
| `--background` | `oklch(0.985 0.002 60)` | Near-white warm | Page background |
| `--foreground` | `oklch(0.18 0.02 30)` | Deep charcoal | Primary text |
| `--card` | `oklch(1 0 0)` | Pure white | Card backgrounds |
| `--card-foreground` | `oklch(0.18 0.02 30)` | Deep charcoal | Card text |
| `--popover` | `oklch(1 0 0)` | Pure white | Popover backgrounds |
| `--popover-foreground` | `oklch(0.18 0.02 30)` | Deep charcoal | Popover text |
| `--primary` | `oklch(0.62 0.22 38)` | **Warm Coral/Orange** | Buttons, links, accents |
| `--primary-foreground` | `oklch(0.99 0.005 60)` | Near-white | Text on primary |
| `--secondary` | `oklch(0.96 0.015 60)` | Warm light gray | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.25 0.03 30)` | Dark charcoal | Text on secondary |
| `--muted` | `oklch(0.955 0.01 55)` | Warm muted gray | Muted backgrounds |
| `--muted-foreground` | `oklch(0.48 0.03 35)` | Medium charcoal | Muted text, placeholders |
| `--accent` | `oklch(0.82 0.17 70)` | **Golden Amber** | Highlights, hover states |
| `--accent-foreground` | `oklch(0.28 0.06 50)` | Dark warm | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red | Errors, destructive actions |
| `--border` | `oklch(0.91 0.015 55)` | Warm light border | Borders, dividers |
| `--input` | `oklch(0.91 0.015 55)` | Warm light border | Input field borders |
| `--ring` | `oklch(0.62 0.22 38)` | Coral | Focus rings |

### 2.2 Dark Mode (`.dark`)

| Token | OKLCH Value | Description |
|---|---|---|
| `--background` | `oklch(0.16 0.015 30)` | Deep charcoal |
| `--foreground` | `oklch(0.96 0.008 60)` | Warm white |
| `--card` | `oklch(0.22 0.018 30)` | Slightly lighter charcoal |
| `--card-foreground` | `oklch(0.96 0.008 60)` | Warm white |
| `--popover` | `oklch(0.22 0.018 30)` | Slightly lighter charcoal |
| `--popover-foreground` | `oklch(0.96 0.008 60)` | Warm white |
| `--primary` | `oklch(0.7 0.2 40)` | **Lighter Coral** (brighter for contrast) |
| `--primary-foreground` | `oklch(0.16 0.015 30)` | Deep charcoal |
| `--secondary` | `oklch(0.28 0.02 30)` | Dark warm gray |
| `--secondary-foreground` | `oklch(0.96 0.008 60)` | Warm white |
| `--muted` | `oklch(0.28 0.02 30)` | Dark warm gray |
| `--muted-foreground` | `oklch(0.64 0.03 40)` | Medium warm gray |
| `--accent` | `oklch(0.78 0.16 70)` | **Lighter Amber** |
| `--accent-foreground` | `oklch(0.16 0.015 30)` | Deep charcoal |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Brighter red |
| `--border` | `oklch(0.32 0.02 30)` | Dark warm border |
| `--input` | `oklch(0.32 0.02 30)` | Dark warm border |
| `--ring` | `oklch(0.7 0.2 40)` | Lighter coral |

### 2.3 Chart Colors

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--chart-1` | `oklch(0.62 0.22 38)` — Coral | `oklch(0.7 0.2 40)` — Lighter Coral |
| `--chart-2` | `oklch(0.82 0.17 70)` — Amber | `oklch(0.78 0.16 70)` — Lighter Amber |
| `--chart-3` | `oklch(0.68 0.15 25)` — Deep Rose | `oklch(0.6 0.14 25)` — Muted Rose |
| `--chart-4` | `oklch(0.55 0.12 50)` — Mauve | `oklch(0.55 0.1 50)` — Muted Mauve |
| `--chart-5` | `oklch(0.75 0.14 60)` — Peach | `oklch(0.65 0.12 60)` — Muted Peach |

### 2.4 Sidebar Colors

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--sidebar` | `oklch(0.975 0.008 55)` | `oklch(0.2 0.018 30)` |
| `--sidebar-foreground` | `oklch(0.18 0.02 30)` | `oklch(0.96 0.008 60)` |
| `--sidebar-primary` | `oklch(0.62 0.22 38)` | `oklch(0.7 0.2 40)` |
| `--sidebar-primary-foreground` | `oklch(0.99 0.005 60)` | `oklch(0.16 0.015 30)` |
| `--sidebar-accent` | `oklch(0.94 0.025 55)` | `oklch(0.28 0.02 30)` |
| `--sidebar-accent-foreground` | `oklch(0.25 0.03 30)` | `oklch(0.96 0.008 60)` |
| `--sidebar-border` | `oklch(0.91 0.015 55)` | `oklch(0.32 0.02 30)` |
| `--sidebar-ring` | `oklch(0.62 0.22 38)` | `oklch(0.7 0.2 40)` |

---

## 3. Typography

### 3.1 Font Families

| Font | Variable | Usage |
|---|---|---|
| **Geist Sans** | `--font-geist-sans` | Primary body text, UI elements, buttons |
| **Geist Mono** | `--font-geist-mono` | Code snippets, technical content, monospace needs |

**Source:** `next/font/google` (Geist and Geist_Mono)
**Applied via:** CSS variables on `<body>`: `font-sans` and `font-mono`

### 3.2 Font Settings
- **Antialiasing:** `antialiased` class on `<body>` (font-smooth rendering)
- **Hyphenation:** Default (browser)
- **Line Height:** Tailwind defaults (1.5 for body, tighter for headings)

### 3.3 Typography Scale

| Element | Tailwind Class | Size |
|---|---|---|
| Hero Title | `text-5xl md:text-6xl lg:text-7xl` | 3rem → 4.5rem |
| Section Title | `text-3xl md:text-4xl` | 1.875rem → 2.25rem |
| Card Title | `text-xl md:text-2xl` | 1.25rem → 1.5rem |
| Body Text | `text-base md:text-lg` | 1rem → 1.125rem |
| Small Text | `text-sm` | 0.875rem |
| Caption | `text-xs` | 0.75rem |

### 3.4 Font Weights

| Weight | Tailwind Class | Usage |
|---|---|---|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Subheadings, labels, buttons |
| 600 | `font-semibold` | Headings, navigation items |
| 700 | `font-bold` | Hero title, emphasis |
| 800 | `font-extrabold` | Display text (rare) |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `p-1` / `m-1` | 0.25rem (4px) | Tight inner spacing |
| `p-2` / `m-2` | 0.5rem (8px) | Compact padding |
| `p-3` / `m-3` | 0.75rem (12px) | Small padding |
| `p-4` / `m-4` | 1rem (16px) | Standard card padding |
| `p-6` / `m-6` | 1.5rem (24px) | Comfortable card padding |
| `p-8` / `m-8` | 2rem (32px) | Section inner spacing |
| `p-12` / `m-12` | 3rem (48px) | Large section spacing |
| `p-16` / `m-16` | 4rem (64px) | Page-level spacing |

### 4.2 Content Width

| Context | Max Width | Tailwind Class |
|---|---|---|
| Page Content | 1280px | `max-w-7xl` |
| Card Grid | Container width | Grid with responsive columns |
| Text Content | 72ch | `max-w-prose` |
| Form Width | 480px | `max-w-md` or `max-w-lg` |

### 4.3 Gaps

| Context | Value |
|---|---|
| Card grid gaps | `gap-4` (1rem) or `gap-6` (1.5rem) |
| Section gaps | `gap-8` (2rem) |
| Stack items | `gap-2` (0.5rem) or `gap-3` (0.75rem) |

---

## 5. Border Radius

**Base Radius:** `0.75rem` (12px) — defined as `--radius` in CSS

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `calc(0.75rem - 4px)` = 8px | Small elements (badges, chips) |
| `--radius-md` | `calc(0.75rem - 2px)` = 10px | Medium elements (inputs, small cards) |
| `--radius-lg` | `0.75rem` = 12px | Standard (cards, buttons, modals) |
| `--radius-xl` | `calc(0.75rem + 4px)` = 16px | Large elements (hero sections, panels) |

---

## 6. Custom CSS Patterns

### 6.1 Auth Background (`.auth-bg`)
Multi-layer radial gradients creating a subtle warm atmosphere:
```css
background-image: 
  radial-gradient(at 20% 80%, primary/0.07 → transparent 50%),
  radial-gradient(at 80% 20%, accent/0.06 → transparent 50%),
  radial-gradient(at 50% 50%, chart-3/0.04 → transparent 70%);
```

### 6.2 Hero Gradient (`.hero-gradient`)
Dark diagonal gradient for hero sections:
```css
background: linear-gradient(135deg, dark-charcoal → deep-noir → darkest);
```

### 6.3 Hero Gradient Light (`.hero-gradient-light`)
Warm coral gradient for CTAs:
```css
background: linear-gradient(135deg, coral → deep-coral → dark-coral);
```

### 6.4 Glass Card (`.glass-card`)
Glassmorphism effect:
```css
background: white/0.7;
backdrop-filter: blur(12px);
border: 1px solid border/0.5;
```

### 6.5 Mesh Pattern (`.mesh-pattern`)
Multi-point radial gradient pattern for hero backgrounds:
```css
background-image: 5 layered radial gradients at different positions
```

### 6.6 Dot Pattern (`.dot-pattern`)
Subtle dot grid overlay:
```css
background-image: radial-gradient(dot-color 1px, transparent 1px);
background-size: 24px 24px;
```

---

## 7. Visual Patterns & Components

### 7.1 Cards
- Background: `bg-card`
- Border: `border border-border`
- Radius: `rounded-lg` (12px)
- Padding: `p-4` or `p-6`
- Hover: Optional `hover:shadow-md` or `hover:border-primary/20`

### 7.2 Buttons
- **Primary:** `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary:** `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Destructive:** `bg-destructive text-white hover:bg-destructive/90`
- **Outline:** `border border-input bg-background hover:bg-accent hover:text-accent-foreground`
- **Ghost:** `hover:bg-accent hover:text-accent-foreground`
- **Minimum touch target:** 44px height

### 7.3 Badges
- **Primary:** `bg-primary/10 text-primary`
- **Secondary:** `bg-secondary text-secondary-foreground`
- **Destructive:** `bg-destructive/10 text-destructive`
- **Outline:** `border border-border text-foreground`

### 7.4 Data Tables
- **Header:** `bg-muted/50`
- **Row hover:** `hover:bg-muted/50`
- **Striped:** Alternating `bg-muted/30` rows
- **Selected:** `bg-primary/5`

---

## 8. Seat Map Colors (Venue Builder)

| Seat Status | Color | Hex Reference |
|---|---|---|
| VIP | `oklch(0.65 0.25 55)` | Golden |
| Reserved | `oklch(0.55 0.15 250)` | Blue-violet |
| General | `oklch(0.7 0.1 150)` | Teal |
| Occupied | `oklch(0.45 0.05 30)` | Dark warm |
| Blocked | `oklch(0.5 0.05 0)` | Neutral gray |
| Selected | `oklch(0.62 0.22 38)` | Primary coral |

---

## 9. Animation Guidelines

### 9.1 Transitions
- **Default:** `transition-colors` (150ms)
- **Interactive:** `transition-all duration-200` (200ms)
- **Layout:** `transition-all duration-300` (300ms)

### 9.2 Animations (Framer Motion)
- **Page transitions:** Fade + subtle slide (300-500ms)
- **Card hover:** Scale 1.02 + shadow increase
- **Modal entrance:** Fade + scale from 0.95
- **Toast:** Slide in from right + fade

### 9.3 Loading States
- **Skeleton:** `bg-muted animate-pulse`
- **Spinner:** Use Lucide `Loader2` with `animate-spin`
- **Shimmer:** `animate-pulse` with gradient

---

## 10. Dark Mode Strategy

- **Theme Toggle:** next-themes with `system` default
- **Class Strategy:** `.dark` class on `<html>` element
- **Custom Variant:** `@custom-variant dark (&:is(.dark *))` in Tailwind CSS 4
- **Glass Cards:** Adapted for dark mode (darker glass with warm border)
- **Charts:** Chart colors are separately defined for dark mode
- **Images/Icons:** Ensure sufficient contrast on dark backgrounds

---

## 11. Icon System

- **Library:** Lucide React (v0.525+)
- **Default Size:** `h-4 w-4` (16px) for inline, `h-5 w-5` (20px) for navigation, `h-6 w-6` (24px) for feature icons
- **Stroke Width:** Default 2px
- **Color:** Inherit from parent `text-color` or explicit `text-primary`, `text-muted-foreground`

---

## 12. Responsive Breakpoints

| Breakpoint | Min Width | Target |
|---|---|---|
| Default | 0px | Mobile phones |
| `sm` | 640px | Large phones / small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops / small desktops |
| `xl` | 1280px | Desktops / large screens |

### Responsive Patterns
- **Mobile:** Single column, hamburger menu, full-width cards
- **Tablet:** Two-column grid, collapsible sidebar
- **Desktop:** Multi-column grid, persistent sidebar, wider cards
- **Touch Targets:** Minimum 44px × 44px on mobile
