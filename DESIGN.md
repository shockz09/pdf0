# LocalPDF Design System

## Philosophy: Neo-Brutalist Editorial

LocalPDF rejects the homogenized, purple-gradient, rounded-corner aesthetic that plagues AI-generated interfaces. Instead, it embraces a **Neo-Brutalist Editorial** direction—bold, structural, unapologetic, yet warm and approachable.

### Core Principles

1. **Visible Structure** — No hiding behind soft shadows and blur. Borders are thick (2-3px), black, and proud. Elements have clear boundaries.

2. **Warmth Over Coldness** — Brutalism doesn't mean cold. Our palette is warm paper tones (#FAF7F2), burnt orange (#C84C1C), and forest green (#2D5A3D) for success states.

3. **Typography with Character** — We use Instrument Serif for headlines (distinctive, editorial) paired with Onest for body text (modern, readable). No Inter. No Roboto. No system fonts.

4. **Intentional Asymmetry** — Shadows offset to create depth and movement. Hover states shift elements. The stamp animation rotates slightly. Nothing is perfectly centered when it shouldn't be.

5. **Functional Delight** — Animations serve purpose. The stamp animation celebrates completion. The striped progress bar shows activity. Icon wiggles on hover invite interaction.

---

## Color Palette

```css
/* Background & Paper */
--background: #FAF7F2;        /* Warm paper */
--card: #FFFEFA;              /* Clean white */
--muted: #F0EBE3;             /* Paper texture tone */

/* Primary — Burnt Orange */
--primary: #C84C1C;           /* Main actions, accents */
--primary-foreground: #FFFEFA;

/* Secondary — Deep Ink */
--secondary: #2C2520;         /* Headers, strong text */
--foreground: #1A1612;        /* Body text, borders */

/* Success — Forest Green */
--success: #2D5A3D;           /* Completion states */

/* Accent — Warm Highlight */
--accent: #FFF0D4;            /* Hover backgrounds, info boxes */

/* Destructive */
--destructive: #B91C1C;       /* Errors, delete actions */

/* Muted Text */
--muted-foreground: #6B5E52;  /* Secondary text */
```

### Tool-Specific Colors

Each tool has its own accent color for visual differentiation:

```css
.tool-merge      { --tool-color: #C84C1C; }  /* Burnt Orange */
.tool-split      { --tool-color: #1E4A7C; }  /* Deep Blue */
.tool-compress   { --tool-color: #2D5A3D; }  /* Forest Green */
.tool-pdf-to-images { --tool-color: #7C4A1E; }  /* Warm Brown */
.tool-images-to-pdf { --tool-color: #6B3D7C; }  /* Purple */
.tool-rotate     { --tool-color: #1A6B5A; }  /* Teal */
.tool-watermark  { --tool-color: #8B4513; }  /* Saddle Brown */
.tool-page-numbers { --tool-color: #4A5568; }  /* Slate */
.tool-ocr        { --tool-color: #9C4221; }  /* Rust */
```

---

## Typography

### Font Stack

```css
--font-display: "Instrument Serif", Georgia, serif;
--font-sans: "Onest", system-ui, sans-serif;
--font-mono: ui-monospace, monospace;
```

### Usage

- **Headlines (h1, h2, h3)**: Instrument Serif — elegant, editorial, distinctive
- **Body text, UI elements**: Onest — clean, modern, highly readable
- **Code, extracted text**: System monospace

### Hierarchy

```
h1: text-4xl to text-7xl, font-display
h2: text-2xl to text-3xl, font-display
h3: text-lg, font-bold (Onest)
Body: text-base, font-sans
Small: text-sm, font-medium
Micro: text-xs, font-bold, uppercase, tracking-wider
```

---

## Component Patterns

### Buttons

**Primary Button** — Main actions
```css
.btn-primary {
  background: #C84C1C;
  color: white;
  border: 2px solid #1A1612;
  font-weight: 700;
  padding: 16px 32px;
}
.btn-primary:hover {
  transform: translate(-3px, -3px);
  box-shadow: 3px 3px 0 0 #1A1612;
}
```

**Secondary Button** — Alternative actions
```css
.btn-secondary {
  background: #FFFEFA;
  color: #1A1612;
  border: 2px solid #1A1612;
}
.btn-secondary:hover {
  background: #FFF0D4;
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 0 #1A1612;
}
```

**Success Button** — Download/completion actions
```css
.btn-success {
  background: #2D5A3D;
  color: white;
  border: 2px solid #1A1612;
}
```

### Cards

**Tool Card** — Homepage tool selection
```css
.tool-card {
  background: #FFFEFA;
  border: 2px solid #1A1612;
  padding: 24px;
}
.tool-card:hover {
  transform: translate(-4px, -4px);
  box-shadow:
    4px 4px 0 0 #1A1612,
    8px 8px 0 0 var(--tool-color);
}
```

The double-shadow effect (black + colored) creates depth and reinforces the tool's identity.

**Success Card** — Completion states
```css
.success-card {
  background: #FFFEFA;
  border: 3px solid #2D5A3D;
  padding: 48px;
}
```

Corner brackets (::before, ::after) add a "document approved" feeling.

### Dropzone

Paper/envelope aesthetic with a corner fold effect:

```css
.dropzone {
  border: 3px dashed #C84C1C;
  background: linear-gradient(135deg, #FFFEFA 0%, #FBF8F3 100%);
}
.dropzone::after {
  /* Corner fold */
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, transparent 50%, #F0EBE3 50%);
}
.dropzone:hover::after {
  width: 50px;
  height: 50px;
}
```

### File Items

Index card style with dotted underlines:

```css
.file-item {
  background: #FFFEFA;
  border: 2px solid #1A1612;
  padding: 16px 20px;
}
.file-item::before {
  /* Dotted line effect */
  background: repeating-linear-gradient(
    90deg,
    #E8E0D5,
    #E8E0D5 8px,
    transparent 8px,
    transparent 12px
  );
}
.file-item:hover {
  transform: translateX(4px);
  box-shadow: -4px 0 0 0 #C84C1C;
}
```

### Progress Bar

Industrial striped pattern:

```css
.progress-bar {
  height: 24px;
  background: #F0EBE3;
  border: 2px solid #1A1612;
}
.progress-bar-fill {
  background: repeating-linear-gradient(
    -45deg,
    #C84C1C,
    #C84C1C 10px,
    #E85A2A 10px,
    #E85A2A 20px
  );
  animation: progress-stripe 1s linear infinite;
}
```

### Inputs

Typewriter-style with dramatic focus states:

```css
.input-field {
  background: #FFFEFA;
  border: 2px solid #1A1612;
  padding: 14px 16px;
}
.input-field:focus {
  box-shadow: 4px 4px 0 0 #C84C1C;
  transform: translate(-2px, -2px);
}
```

---

## Animations

### Key Animations

**Stamp** — Success state entrance
```css
@keyframes stamp {
  0% {
    transform: scale(2) rotate(-8deg);
    opacity: 0;
  }
  60% {
    transform: scale(0.95) rotate(-4deg);
  }
  100% {
    transform: scale(1) rotate(-3deg);
  }
}
```

**Fade Up** — Page/element entrance
```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Shake** — Error feedback
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px) rotate(-1deg); }
  40% { transform: translateX(3px) rotate(1deg); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
```

**Icon Wiggle** — Hover delight
```css
@keyframes icon-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

### Staggered Children

For list/grid animations:
```css
.stagger-children > *:nth-child(1) { animation-delay: 0.0s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.06s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.12s; }
/* ... */
```

---

## Layout Patterns

### Page Structure

```
┌─────────────────────────────────────────┐
│ Header (sticky, border-bottom)          │
├─────────────────────────────────────────┤
│                                         │
│   ← Back to tools                       │
│                                         │
│   [Icon] Page Title                     │
│          Subtitle                       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │     Main Content Area           │   │
│   │     (Dropzone / Preview /       │   │
│   │      Success State)             │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [Primary Action Button]               │
│                                         │
├─────────────────────────────────────────┤
│ Footer (border-top)                     │
└─────────────────────────────────────────┘
```

### Max Widths

- **Homepage**: `max-w-6xl` (1152px)
- **Tool pages with previews**: `max-w-5xl` (1024px)
- **Simple tool pages**: `max-w-2xl` (672px)
- **Success cards**: `max-w-2xl` centered

### Grid Systems

**Tool cards**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
**Page thumbnails**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
**Image grid**: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6`

---

## UX Patterns

### File Upload Flow

```
1. Dropzone State
   └── User drops/selects file(s)

2. Configuration State
   ├── File info displayed
   ├── Options/settings shown
   └── Primary action button

3. Processing State
   ├── Progress bar (striped, animated)
   └── Status text with spinner

4. Success State
   ├── Stamp animation
   ├── Result summary
   ├── Download button (primary)
   └── "Do Another" button (secondary)
```

### Interactive Previews

For tools that modify PDFs (Rotate, Watermark, Page Numbers):

1. **Load PDF pages as thumbnails** using pdfjs-dist
2. **Show live preview** of changes on thumbnails
3. **Allow interaction** (click to rotate, see watermark overlay)
4. **Apply changes** only when user clicks the action button

### Error Handling

- Shake animation draws attention
- Red border and background tint
- Icon + text explanation
- Errors clear on new action

---

## What We Avoid

### Generic AI Aesthetics

- ❌ Purple/violet gradients
- ❌ Inter, Roboto, or system fonts
- ❌ Rounded corners everywhere (we use sharp corners)
- ❌ Soft drop shadows (we use hard offset shadows)
- ❌ Predictable card layouts with equal padding
- ❌ Generic icons without character
- ❌ Auto-download (always show success state first)

### Over-Design

- ❌ Gratuitous animations
- ❌ Too many colors
- ❌ Inconsistent border radiuses
- ❌ Multiple competing visual hierarchies

---

## Implementation Notes

### CSS Architecture

All custom styles live in `globals.css` using vanilla CSS:
- CSS custom properties for colors
- No CSS-in-JS for core styles
- Tailwind for utility classes and spacing
- Custom classes for complex components

### Component Philosophy

- **Composition over configuration** — Small, focused components
- **Semantic HTML** — Proper button, input, label usage
- **Accessibility** — Focus states, ARIA labels where needed
- **Progressive enhancement** — Works without JS, enhanced with it

### Performance

- PDF thumbnails rendered at 0.4-0.5x scale for speed
- Lazy loading for large page counts
- Animations use `transform` and `opacity` only
- No layout thrashing

---

## The Memorable Element

The **approval stamp** animation on success states is the signature element. It:

1. Scales down from 2x with a slight rotation
2. Bounces at 0.95x scale
3. Settles at 1x with a -3° rotation
4. Contains an animated checkmark that draws in

This creates a visceral "APPROVED" feeling that users remember—like getting a document officially stamped at a government office, but delightful instead of bureaucratic.

---

*LocalPDF: PDF tools that respect your privacy, with design that respects your intelligence.*
