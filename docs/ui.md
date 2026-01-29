# UI/UX Guidelines

Dracin features a premium, Netflix-inspired dark interface optimized for immersive video browsing.

## Design Philosophy

1. **Content First** - UI recedes to highlight video content
2. **Immersive Experience** - Full-bleed images, minimal chrome
3. **Smooth Motion** - Deliberate animations enhance navigation
4. **Dark by Default** - Easy on the eyes for extended viewing

## Color Palette

### Core Colors

| Name | Value | Usage |
|------|-------|-------|
| Background | `#000000` | True black background |
| Surface | `#09090b` | Cards, panels (Zinc 950) |
| Surface Light | `#18181b` | Hover states (Zinc 900) |
| Foreground | `#ffffff` | Primary text |
| Muted | `#a1a1aa` | Secondary text (Zinc 400) |
| Border | `rgba(255,255,255,0.08)` | Subtle borders |
| Accent | `#ffffff` | Buttons, highlights |

### Semantic Colors

| Name | Value | Usage |
|------|-------|-------|
| Success | `#22c55e` | Match percentage (Green 500) |
| Error | `#ef4444` | Alerts, destructive (Red 500) |
| Warning | `#f59e0b` | Cautions (Amber 500) |

### Dynamic Accent

Drama pages extract dominant color from poster for accent:

```css
--drama-accent: extracted-color;
```

## Typography

### Font Stack

```css
font-family: 'Geist Sans', system-ui, -apple-system, sans-serif;
```

### Scale

| Size | Class | Usage |
|------|-------|-------|
| 48px | `text-5xl` | Hero titles |
| 36px | `text-4xl` | Page headings |
| 24px | `text-2xl` | Section titles |
| 20px | `text-xl` | Card titles |
| 16px | `text-base` | Body text |
| 14px | `text-sm` | Metadata |
| 12px | `text-xs` | Labels, badges |

## Spacing

Based on 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Element gaps |
| `space-4` | 16px | Component padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large gaps |
| `space-12` | 48px | Page margins |

## Components

### Cards

```tsx
// Drama Card
<div className="rounded-lg overflow-hidden bg-zinc-900 
               transition-transform hover:scale-105">
```

### Buttons

```tsx
// Primary
<Button className="bg-white text-black hover:bg-white/90">

// Secondary
<Button variant="outline" className="border-white/20 bg-white/5">

// Ghost
<Button variant="ghost" className="text-zinc-400 hover:text-white">
```

### Glass Effects

```css
.glass {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Animation

### Principles

1. **Purpose** - Every animation serves navigation or feedback
2. **Speed** - Fast enough to not slow user down (200-300ms)
3. **Easing** - Use ease-out for entrances, ease-in for exits

### Common Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade In | 200ms | ease-out | Page transitions |
| Scale Up | 300ms | ease-out | Hover effects |
| Slide Up | 300ms | spring | Modals, drawers |
| Shimmer | 4s | linear | Loading states |

### Framer Motion Presets

```tsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.2 }}

// Scale on hover
whileHover={{ scale: 1.05 }}
transition={{ type: "tween", duration: 0.3 }}

// Spring slide
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

## Layout Patterns

### App Shell

```
┌─────────────────────────────────────┐
│           Top Navigation            │ ← Fixed, z-50
├─────────────────────────────────────┤
│                                     │
│            Main Content             │ ← Scrollable
│                                     │
├─────────────────────────────────────┤
│         Mobile Bottom Nav           │ ← Fixed, md:hidden
└─────────────────────────────────────┘
```

### Content Areas

- **Hero Billboard**: Full-width, 70vh height, auto-rotates
- **Drama Rows**: Horizontal scroll with hover expansion
- **Drama Grid**: Responsive grid (2-6 columns based on viewport)

## Responsive Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

## Accessibility

### Focus States

```css
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}
```

### Color Contrast

- Body text: 7:1 ratio (AAA)
- Muted text: 4.5:1 ratio (AA)
- Interactive elements clearly distinguishable

### Motion

Respect reduced motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Icons

Using Lucide React for consistent iconography:

```tsx
import { Play, Plus, Heart, Search } from 'lucide-react'

<Play size={20} fill="currentColor" />
```

Standard sizes: 16px (small), 20px (default), 24px (large)

## Dark Mode

Dracin is dark-mode only. The `dark` class is applied to `<html>`:

```tsx
<html lang="en" className="dark">
```

## Loading States

### Skeleton

```tsx
<div className="animate-pulse bg-zinc-800 rounded-lg h-48" />
```

### Spinner

```tsx
<div className="h-8 w-8 animate-spin rounded-full 
               border-2 border-white border-t-transparent" />
```

## Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | 0 | Normal content |
| Dropdown | 10 | Menus, popovers |
| Header | 50 | Top navigation |
| Modal | 60 | Dialogs, overlays |
| Preview | 100 | Hover previews |
| Toast | 110 | Notifications |
