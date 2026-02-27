# PLAZA Sports Streaming Platform - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern sports streaming platforms (DAZN, ESPN+, YouTube Live) combined with sleek dashboard aesthetics (Linear, Vercel). Focus on high-energy, immersive sports viewing experience with professional admin controls.

## Core Design Principles
- **High-Energy Aesthetics**: Sports demand excitement - use bold gradients, glowing effects, and dynamic elements
- **RTL-First Design**: All layouts optimized for Arabic right-to-left reading
- **Glassmorphism + Neon**: Dark base with frosted glass cards and vibrant cyan/magenta accents
- **Information Density**: Balance between rich match data and clean viewing experience

## Typography
**Font**: Cairo (Google Fonts) - excellent Arabic support with modern feel
- **Headings**: 700-900 weight, sizes: 3rem (hero), 1.8rem (sections), 1.2rem (cards)
- **Body**: 400-600 weight, 1rem base with 1.6 line-height
- **Micro Text**: 0.75-0.9rem for badges, labels, metadata
- **Special**: Monospace for match times/scores (digital clock aesthetic)

## Spacing System
**Tailwind Units**: Primary spacing set of `2, 4, 8, 12, 16, 20, 24, 32`
- Cards: `p-4` to `p-8`
- Sections: `py-16` to `py-24` desktop, `py-8` to `py-12` mobile
- Component gaps: `gap-4` for dense layouts, `gap-8` for breathing room
- Container: `max-w-7xl` with `px-4` to `px-8`

## Layout Architecture

### Homepage Hero
- Full-width gradient background (80vh) with animated radial glow effects
- Centered content: Large heading + subtext + prominent CTA
- NO hero image - use pure gradient background with subtle animated orbs/circles
- Overlay viewer count badge (top-right): "12,450 مشاهد مباشر" with pulsing red dot

### Match Cards Grid
- 3-column desktop (`grid-cols-3`), 2-column tablet, 1-column mobile
- Each card structure:
  - Header: Tournament badge + Live/Upcoming status pill
  - Body: Team logos (80px circles) with VS effect, centered time display
  - Footer: "مشاهدة المباراة" button with icon
- Glassmorphic background with 1px border, hover elevates with glow

### Watch Page Layout
- Video player: 16:9 aspect ratio, rounded corners, full-width container
- Server tabs: Horizontal scrollable pills above player
- Match header: Team info flanking central time/tournament display (80px logos)
- Viewer counter: Real-time with eye icon, positioned below match time
- Ads: Strategic placement post-player and mid-content

### Admin Dashboard
- Sidebar (250px): Vertical menu with icons, fixed position
- Main content: Full-height scrollable area with tabbed sections
- Statistics: Card grid with chart.js visualizations
- Forms: Inline validation, grouped inputs with clear labels
- Tables: Striped rows, action buttons (edit/delete) with icon-only design

## Component Library

### Navigation
- Sticky header with backdrop blur
- Logo (left in RTL): Icon + wordmark gradient
- Horizontal nav links with icon+text, active state underline
- Mobile: Hamburger → full-screen overlay menu
- Login button: Accent color highlight

### Buttons
- Primary: Gradient fill (cyan to blue), bold text, rounded-full or rounded-lg
- Secondary: Glass background with border, subtle hover glow
- Icon buttons: 40px circular, transparent with border
- States: Hover lifts 2px, active scales 0.98

### Cards
- Base: Dark semi-transparent background (rgba(30,30,40,0.6))
- Border: 1px rgba(255,255,255,0.1)
- Rounded: 16-24px corners
- Hover: Border glows to cyan, elevation increases
- Shadow: Soft 0 10px 30px rgba(0,0,0,0.3)

### Badges/Pills
- Live: Red background, pulsing animation, uppercase text
- Upcoming: Orange/yellow tint, static
- Quality indicators: Small rounded pills (720p, 1080p, HD)
- Tournament tags: Glass background with icon

### Forms
- Inputs: Dark background, 1px border, rounded-lg, focus glow
- Selects: Custom styled dropdowns matching input aesthetic
- Team selectors: Cascading dropdowns (Type → Region → League → Team)
- Validation: Inline red/green indicators

### Modals
- Full-screen overlay with heavy backdrop blur
- Centered card (max-w-md), glassmorphic with strong border
- Close button: Top-right X icon
- Forms: Vertically stacked with clear CTAs

### Tables (Admin)
- Striped rows for readability
- Sticky headers on scroll
- Action columns: Icon buttons (edit, delete, view)
- Responsive: Horizontal scroll on mobile

## Visual Treatments

### Glassmorphism
- Background: rgba(30,30,40,0.6) with backdrop-filter blur(10px)
- Borders: rgba(255,255,255,0.1)
- Multiple layers create depth

### Gradients
- Primary: Linear 135deg from #0051ff to #00f2ff
- Accent: Radial glows for ambiance (low opacity)
- Hero background: Multi-layer radial gradients

### Effects
- Live indicator: Pulsing red dot with box-shadow glow
- Hover cards: Translate -5px, border glow, shadow intensifies
- Loading states: Skeleton screens with shimmer animation
- Success/error: Toast notifications, top-right position

## Images

### Team Logos
**Usage**: Circular containers (80px match cards, 60px watch header)
**Source**: teams_data.json with fallback to default placeholder
**Treatment**: White background circles with subtle border, centered logo, drop-shadow

### Advertisements
**Placement**: Header (below nav), in-content (between sections), footer
**Style**: Labeled "إعلان" badge, contained within glass cards
**Dimensions**: Flexible based on ad content, max-width constraints

### Hero Section
**NO large hero image** - Use pure gradient background with:
- Animated radial gradient orbs (CSS animations)
- Particle effects (optional subtle)
- Focus on typography and CTA

## Accessibility
- Minimum 4.5:1 contrast ratios on all text
- Focus indicators: 2px cyan outline
- Keyboard navigation: Logical tab order
- Screen reader: Semantic HTML, ARIA labels on icons
- RTL support: Consistent mirroring of all directional elements

## Responsive Breakpoints
- Mobile: < 768px (single column, stacked layouts)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full 3-column grids, sidebar visible)
- Admin sidebar: Collapses to hamburger menu on mobile

## Animation Guidelines
**Minimal Approach**: Animations only for feedback and delight
- Transitions: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover states: Subtle lift and glow
- Live indicators: 2s infinite pulse
- Hero gradients: Slow 20s rotation
- NO auto-playing videos or distracting motion

This sports streaming platform demands visual excitement balanced with functional clarity - the design must energize users while keeping match information instantly scannable.