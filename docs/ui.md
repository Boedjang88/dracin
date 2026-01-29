# UI/UX Design Guide

This guide covers the design system, styling conventions, and UI patterns used in Dracin.

---

## 📖 Table of Contents

- [Design Philosophy](#design-philosophy)
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Animations](#animations)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Icons](#icons)
- [Best Practices](#best-practices)

---

## Design Philosophy

Dracin follows a **"Content First, Immersive Experience"** approach, inspired by Netflix and other streaming platforms.

### Core Principles

| Principle | Meaning |
|-----------|---------|
| **Content First** | UI should highlight videos, not distract from them |
| **Dark by Default** | Easier on the eyes for extended viewing |
| **Smooth Motion** | Animations guide the user, not annoy them |
| **Mobile Friendly** | Works great on any screen size |

### Visual Style

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     DARK BACKGROUND                          │   │
│   │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │   │
│   │   │ 📺  │ │ 📺  │ │ 📺  │ │ 📺  │ │ 📺  │  ← Poster cards   │   │
│   │   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │   │
│   │                                                              │   │
│   │   Smooth hover effects                                       │   │
│   │   Glass-like overlays                                        │   │
│   │   Gradient transitions                                       │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Colors

### Color Palette

We use a minimal, dark color palette that keeps focus on the colorful poster artwork.

#### Background Colors

| Name | Value | Usage | Preview |
|------|-------|-------|---------|
| Background | `#000000` | Main background | ⬛ |
| Surface | `#09090b` | Cards, panels | ⬛ |
| Surface Light | `#18181b` | Hover states | ⬛ |
| Surface Lighter | `#27272a` | Active states | ⬛ |

#### Text Colors

| Name | Value | Usage | Preview |
|------|-------|-------|---------|
| Foreground | `#ffffff` | Primary text | ⬜ |
| Muted | `#a1a1aa` | Secondary text | 🔘 |
| Subtle | `#71717a` | Hints, captions | 🔘 |

#### Accent Colors

| Name | Value | Usage | Preview |
|------|-------|-------|---------|
| Primary | `#ffffff` | Buttons, links | ⬜ |
| Success | `#22c55e` | Match %, positive | 🟢 |
| Error | `#ef4444` | Errors, warnings | 🔴 |
| Warning | `#f59e0b` | Cautions | 🟡 |

#### Border & Overlay

| Name | Value | Usage |
|------|-------|-------|
| Border | `rgba(255,255,255,0.08)` | Subtle dividers |
| Border Hover | `rgba(255,255,255,0.15)` | Hover state |
| Overlay | `rgba(0,0,0,0.6)` | Background dim |

### Using Colors in Code

```tsx
// Tailwind classes
<div className="bg-black text-white" />        // Primary
<div className="bg-zinc-900 text-zinc-400" />  // Muted
<div className="border-white/10" />            // Subtle border

// CSS variables (defined in globals.css)
.element {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### Dynamic Accent Color

Drama pages extract the dominant color from the poster:

```tsx
// Hook to extract color
const accentColor = useDominantColor(posterUrl)

// Use in styling
<button style={{ backgroundColor: accentColor }}>
  Watch Now
</button>
```

---

## Typography

### Font Stack

```css
/* Primary font */
font-family: 'Geist Sans', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, sans-serif;

/* Monospace (for code) */
font-family: 'Geist Mono', ui-monospace, monospace;
```

### Type Scale

| Size | Tailwind | Use Case |
|------|----------|----------|
| 48px | `text-5xl` | Hero titles |
| 36px | `text-4xl` | Page headings |
| 30px | `text-3xl` | Section titles |
| 24px | `text-2xl` | Card titles |
| 20px | `text-xl` | Subtitles |
| 16px | `text-base` | Body text |
| 14px | `text-sm` | Metadata |
| 12px | `text-xs` | Labels, badges |
| 10px | `text-[10px]` | Tiny text |

### Typography Examples

```tsx
// Hero title
<h1 className="text-5xl font-bold tracking-tight">
  Love in the Moonlight
</h1>

// Section heading
<h2 className="text-xl font-semibold text-white">
  Continue Watching
</h2>

// Body text
<p className="text-base text-zinc-300 leading-relaxed">
  A heartwarming tale of love spanning decades...
</p>

// Metadata
<span className="text-sm text-zinc-400">
  2024 • 40 Episodes
</span>

// Badge
<span className="text-xs font-medium uppercase tracking-wider">
  NEW EPISODE
</span>
```

### Font Weights

| Weight | Tailwind | Usage |
|--------|----------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Emphasized text |
| 600 | `font-semibold` | Headings |
| 700 | `font-bold` | Titles |

---

## Spacing

Based on a **4px grid system**.

### Spacing Scale

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| 1 | 4px | `p-1`, `m-1` | Tiny gaps |
| 2 | 8px | `p-2`, `m-2` | Small gaps |
| 3 | 12px | `p-3`, `m-3` | Button padding |
| 4 | 16px | `p-4`, `m-4` | Card padding |
| 6 | 24px | `p-6`, `m-6` | Section gaps |
| 8 | 32px | `p-8`, `m-8` | Large gaps |
| 12 | 48px | `p-12`, `m-12` | Page margins |
| 16 | 64px | `p-16`, `m-16` | Hero spacing |
| 24 | 96px | `p-24`, `m-24` | Extra large |

### Common Patterns

```tsx
// Card
<div className="p-4 space-y-2">
  <h3>Title</h3>
  <p>Description</p>
</div>

// Section
<section className="py-8 space-y-6">
  <h2>Section Title</h2>
  <div>Content</div>
</section>

// Page container
<main className="px-6 md:px-12 py-8">
  {children}
</main>
```

---

## Components

### Buttons

```tsx
// Primary (white background)
<Button className="bg-white text-black hover:bg-white/90">
  Watch Now
</Button>

// Secondary (outline)
<Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
  Add to List
</Button>

// Ghost (transparent)
<Button variant="ghost" className="text-zinc-400 hover:text-white">
  <Share size={20} />
</Button>

// Icon button (round)
<button className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
  <Play size={20} />
</button>
```

### Cards

```tsx
// Drama Card
<div className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900">
  <Image src={posterUrl} alt={title} fill className="object-cover" />
  
  {/* Hover overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity" />
</div>

// Info Card
<div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 
                transition-colors">
  <h3 className="font-semibold">{title}</h3>
  <p className="text-sm text-zinc-400">{description}</p>
</div>
```

### Glass Effect

```tsx
// Frosted glass panel
<div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl">
  {content}
</div>

// Navigation bar
<nav className="bg-black/80 backdrop-blur-md">
  {links}
</nav>
```

### Badges

```tsx
// Match percentage
<span className="text-green-400 text-sm font-semibold">98% Match</span>

// Age rating
<span className="text-xs border border-zinc-600 px-1 rounded">13+</span>

// Vibe tag
<span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">Romance</span>

// New indicator
<span className="px-2 py-1 bg-red-600 text-xs font-bold rounded">NEW</span>
```

---

## Animations

### Principles

1. **Purpose** - Every animation should have a reason
2. **Speed** - Fast enough to feel responsive (200-300ms)
3. **Easing** - Use `ease-out` for entrances, `ease-in` for exits

### Common Animations

#### Hover Scale

```tsx
<div className="transition-transform duration-300 hover:scale-105">
  {content}
</div>
```

#### Fade In

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  {content}
</motion.div>
```

#### Slide Up

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

#### Stagger Children

```tsx
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Transition Presets

```tsx
// Fast and snappy
transition={{ duration: 0.2 }}

// Smooth entrance
transition={{ duration: 0.3, ease: 'easeOut' }}

// Spring (bouncy)
transition={{ type: 'spring', stiffness: 300, damping: 25 }}

// Delayed
transition={{ delay: 0.1, duration: 0.3 }}
```

### Loading States

```tsx
// Spinner
<div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />

// Skeleton
<div className="animate-pulse bg-zinc-800 rounded h-48" />

// Shimmer
<div className="relative overflow-hidden">
  <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
</div>
```

---

## Responsive Design

### Breakpoints

| Name | Width | Devices |
|------|-------|---------|
| Default | 0px+ | Mobile phones |
| `sm` | 640px+ | Large phones, landscape |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large screens |

### Common Patterns

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop navigation
</div>

// Different columns at each breakpoint
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {items}
</div>

// Responsive padding
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  {content}
</div>

// Responsive text
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Title
</h1>
```

### Mobile Navigation

```tsx
// Bottom navigation (mobile only)
<nav className="fixed bottom-0 left-0 right-0 md:hidden">
  <div className="flex justify-around py-4 bg-black/90 backdrop-blur-md">
    <NavItem icon={<Home />} label="Home" />
    <NavItem icon={<Compass />} label="Browse" />
    <NavItem icon={<Bookmark />} label="List" />
    <NavItem icon={<User />} label="Profile" />
  </div>
</nav>

// Top navigation (desktop only)
<nav className="hidden md:flex fixed top-0 left-0 right-0">
  {/* Desktop menu */}
</nav>
```

---

## Accessibility

### Focus States

```tsx
// Custom focus ring
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
  Button
</button>
```

### Keyboard Navigation

```tsx
// Make clickable div accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="cursor-pointer"
>
  Clickable content
</div>
```

### Screen Readers

```tsx
// Icon-only button needs aria-label
<button aria-label="Play video">
  <Play size={20} />
</button>

// Hide decorative elements
<div aria-hidden="true">
  {decorativeElement}
</div>

// Announce loading state
<div aria-live="polite">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Reduced Motion

```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icons

We use **Lucide React** for consistent iconography.

### Usage

```tsx
import { Play, Pause, Volume2, VolumeX, Search, User } from 'lucide-react'

// Basic usage
<Play size={24} />

// With color
<Play size={24} className="text-white" />

// Filled
<Play size={24} fill="currentColor" />

// Stroke width
<Play size={24} strokeWidth={1.5} />
```

### Common Icons

| Icon | Usage |
|------|-------|
| `Play` | Play button |
| `Pause` | Pause button |
| `Volume2` | Sound on |
| `VolumeX` | Sound off |
| `Plus` | Add to list |
| `Check` | In list |
| `Search` | Search |
| `ChevronLeft/Right` | Navigation |
| `X` | Close |

### Size Guidelines

| Size | Usage |
|------|-------|
| 16px | Small buttons, metadata |
| 20px | Standard icons |
| 24px | Primary actions |
| 32px+ | Hero icons |

---

## Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | 0 | Normal content |
| Dropdown | 10 | Menus, popovers |
| Sticky | 20 | Sticky headers |
| Fixed | 30 | Fixed elements |
| Navigation | 50 | Top/bottom nav |
| Modal | 60 | Modal dialogs |
| Overlay | 70 | Full-screen overlays |
| Preview | 100 | Hover previews |
| Toast | 110 | Notifications |

---

## Best Practices

### DO ✅

- Use consistent spacing (4px grid)
- Apply hover states to interactive elements
- Animate purposefully
- Test on mobile
- Use semantic HTML
- Provide focus indicators

### DON'T ❌

- Use too many colors
- Animate everything
- Forget loading states
- Ignore accessibility
- Break the dark theme
- Use inline styles (use Tailwind)

---

## Tools & Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Shadcn/ui](https://ui.shadcn.com/)

---

## Next Steps

- [Architecture](./architecture.md) - System overview
- [API Reference](./api.md) - API documentation
- [Database](./database.md) - Data structures
