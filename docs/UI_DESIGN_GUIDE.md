# UI Design Guide
## polizeischuesse.cilip.de

**Version:** 1.0
**Last Updated:** December 2025

This guide documents the complete design system for the polizeischuesse.cilip.de project. It provides all the information needed to maintain visual consistency when developing new features or components.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Component Inventory](#component-inventory)
5. [Layout & Responsive Design](#layout--responsive-design)
6. [Icons](#icons)
7. [Visual Elements](#visual-elements)
8. [Accessibility](#accessibility)
9. [Charts & Data Visualization](#charts--data-visualization)
10. [Brand Elements](#brand-elements)
11. [Quick Reference](#quick-reference)

---

## Color Palette

### Primary Colors

The application uses **Mantine's Indigo** as the primary brand color throughout interactive elements, charts, and accents.

### Gray Scale

Custom gray scale defined in `theme.ts` (Mantine v6 restored palette):

| Token | Hex | Usage |
|-------|-----|-------|
| `gray[0]` | `#f8f9fa` | Lightest backgrounds, OG images |
| `gray[1]` | `#f1f3f5` | Light backgrounds |
| `gray[2]` | `#e9ecef` | Map geography, subtle backgrounds |
| `gray[3]` | `#dee2e6` | Borders, dividers |
| `gray[4]` | `#ced4da` | Inactive states |
| `gray[5]` | `#adb5bd` | Disabled text |
| `gray[6]` | `#868e96` | Secondary text |
| `gray[7]` | `#495057` | Body text |
| `gray[8]` | `#343a40` | Dark text |
| `gray[9]` | `#212529` | Darkest text |

### Link Colors

Defined in `styles/globals.css`:

- **Default:** `#228be6` (indigo-6)
- **Hover:** `#1c7ed6` (indigo-7)
- **Focus outline:** `#228be6` with 2px offset

### Chart & Visualization Colors

#### Primary Chart Colors (3-Layer System)

Used in `components/charts/charts.tsx`:

```typescript
// Layer 1 - Primary data
count: theme.colors.indigo[2]      // #748ffc (default)
count (hover): theme.colors.indigo[4]  // #5c7cfa

// Layer 2 - Secondary data
count2: theme.colors.indigo[1]     // #91a7ff (default)
count2 (hover): theme.colors.indigo[3] // #6f8ffb

// Layer 3 - Tertiary data
count3: theme.colors.indigo[3]     // #6f8ffb (default)
count3 (hover): theme.colors.indigo[5] // #4c63ff
```

#### Overview Chart Non-Selected States

```typescript
// When filters are active
Primary non-selected: #BFBFC1 (default), #9FA0A2 (hover)
Secondary non-selected: #EAEAEC (default), #D0D0D2 (hover)
```

#### Map Colors

From `components/Map.tsx`:

- **Geography fill:** `#EAEAEC`
- **Geography stroke:** `#D6D6DA`
- **Marker default:** `grey` with opacity 0.3-0.5 (based on density)
- **Marker hover/active:** `red`

#### HeatMap Colors

- Full Mantine indigo color scale (indigo[0] through indigo[9])
- Quantize scale from 0-100%
- Dynamic text color: white when value > 50, black otherwise

#### Line Chart Colors (Multi-Series)

Categorical palette used for taser statistics:

```typescript
['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
 '#ffff33', '#a65628', '#f781bf', '#999999']
```

### Semantic Badge Colors

Used in `components/Case.tsx` for circumstance tags:

| Circumstance | Color | Variant |
|--------------|-------|---------|
| Schusswechsel (Shootout) | `pink` | `light` |
| SEK-Beteiligung (SWAT) | `grape` | `light` |
| Verletzte/getötete Beamte (Officers injured/killed) | `violet` | `light` |
| Vorbereitete Polizeiaktion (Planned action) | `indigo` | `light` |
| Psychische Ausnahmesituation (Mental health crisis) | `blue` | `light` |
| Alkohol-/Drogenkonsum (Substance use) | `cyan` | `light` |
| Familiäre/häusliche Gewalt (Domestic violence) | `teal` | `light` |
| Unbeabsichtigte Schussabgabe (Accidental discharge) | `green` | `light` |
| Innenraum (Indoor) | `lime` | `light` |

### Background Colors

- **Main background:** White (default)
- **Skip link:** `#000` (black)
- **Tooltip:** `white` with `opacity: 0.95`
- **OG images:** `#f8f9fa` (gray-0)

### Text Colors

- **Primary text:** Default black (from system)
- **Secondary/dimmed:** `gray` (Mantine prop)
- **Tertiary:** `#868e96` (gray-6)
- **Skip link:** `#fff`

---

## Typography

### Font Families

#### Primary Font Stack

Defined in `styles/globals.css`:

```css
font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
  Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
```

#### Special Cases

- **Monospace:** Year listings in statistics
- **System UI:** Map labels (`system-ui`)
- **Inter:** OG image text (`'Inter', sans-serif`)

### Font Sizes

| Context | Size | Usage |
|---------|------|-------|
| Chart labels (desktop) | `12px` | All chart text |
| Chart labels (mobile) | `8px` | Mobile charts |
| Tooltips | `0.85rem` (13.6px) | Hover/click tooltips |
| Anchor link icon | `0.875rem` (14px) | Copy link buttons |
| "Kopiert!" text | `0.75rem` (12px) | Copy confirmation |
| Map city labels | `30px` | City names on map |

#### OG Image Sizes

- Main title: `128px`, weight `700`
- Secondary title: `70px`
- Tertiary: `60px`
- Viz title: `40px`
- Viz description: `20px`
- Viz labels: `13px`, `18px`, `32px`

### Text Hierarchy (Mantine Components)

Use Mantine's `<Title>` and `<Text>` components:

```tsx
// Headings
<Title order={1}>                    // Main page heading (h1)
<Title order={2}>                    // Section heading (h2)
<Title order={2} size="h3">          // Sized as h3 but semantic h2
<Title order={3}>                    // Subsection (h3, with AnchorHeading)
<Title order={4}>                    // Chart titles (h4)

// Body text
<Text>                               // Regular body text
<Text size="lg">                     // Larger body text
<Text size="sm">                     // Smaller text (meta, dates, sources)
<Text c="gray">                      // Gray colored text
<Text c="dimmed">                    // Dimmed text
<Text ta="center">                   // Centered text
```

### Line Heights

- **Body text:** `1.5` (standard)
- **Case component:** `lineHeight: 1.5` (explicit)

### Font Weights

- **OG image titles:** `700` (bold)
- **OG image labels:** `500` (medium)
- **Case card names:** `fw={500}` (medium)
- **Body text:** Default (400)

---

## Spacing System

### Mantine Spacing Scale

Defined in `theme.ts`:

| Token | Value | Pixels |
|-------|-------|--------|
| `xs` | `0.625rem` | 10px |
| `sm` | `0.75rem` | 12px |
| `md` | `1rem` | 16px |
| `lg` | `1.25rem` | 20px |
| `xl` | `1.5rem` | 24px |

### Usage Patterns

#### Vertical Spacing (Space Component)

```tsx
<Space h="sm" />   // Small gap (12px) - minor spacing
<Space h="lg" />   // Large gap (20px) - section spacing
<Space h="xl" />   // Extra large (24px) - major sections

// Multiple xl for significant breaks
<Space h="xl" />
<Space h="xl" />
```

#### Component Padding

Common padding values:

```tsx
// Cards
padding="sm"              // Mantine card padding (12px)
padding="1rem"            // 16px
padding="0.5rem 0.75rem"  // Vertical 8px, Horizontal 12px

// Tooltips
padding: 0.3rem 0.5rem    // Desktop (4.8px 8px)
padding: 0.5rem 0.75rem   // Mobile (8px 12px)

// Buttons
padding: 0.25rem 0.5rem   // Small buttons (4px 8px)
padding: 0.25rem          // Icon buttons (4px)

// Case cards
marginBottom: "2rem"      // 32px bottom spacing
```

#### Chart Margins

**Desktop:**
```typescript
margin: {
  top: 10,
  right: 220,    // Space for legend
  bottom: 30,
  left: 10-60    // Varies by chart type
}
```

**Mobile:**
```typescript
margin: {
  top: 10,
  right: 15,     // Minimal side margin
  bottom: 30-100,  // Extra space for legends
  left: 15-130   // More for y-axis labels
}
```

---

## Component Inventory

### Mantine Core Components

#### Layout Components

```tsx
<Container>              // Main content wrapper (responsive max-width)
<Grid> / <Grid.Col>      // 12-column responsive grid
<Group>                  // Flex group (horizontal)
<Stack>                  // Vertical stacking
<Space>                  // Spacing utility
<Center>                 // Centering wrapper
```

#### Typography

```tsx
<Title order={1-6}>      // Heading component
<Text>                   // Body text with variants
<Anchor>                 // Link component
```

#### Form Inputs

```tsx
<TextInput>              // Search input
<Select>                 // Dropdown (searchable, clearable)
<MultiSelect>            // Multi-select filter
<Textarea>               // Contact form
```

#### Data Display

```tsx
<Card>                   // Case cards with sections
<Badge>                  // Colored tags (light variant)
<Code>                   // Inline code (URLs)
<Pagination>             // Page navigation
```

#### Interactive

```tsx
<Button>                 // Action buttons
<Collapse>               // Expandable content
```

#### Utility Hooks

```tsx
useMantineTheme()        // Access theme object
useClipboard()           // Copy to clipboard
```

### Custom Components

#### Chart Components (`components/charts/`)

```tsx
<VerticalBarChart>       // Vertical bars with mobile support
<HorizontalBarChart>     // Horizontal bars with mobile tooltips
<OverviewChart>          // Year overview with click filtering
<DowChart>               // Day of week distribution
<HeatMapChart>           // State-level heatmap
<WeaponChart>            // Line chart for weapon types
<ShortsPerYear>          // Official statistics chart
<SimpleChart>            // Generic bar chart wrapper
<ChartTooltip>           // Reusable tooltip component
```

#### Data Components

```tsx
<Case>                   // Individual case card display
<CaseList>               // Paginated case listing with filters
<Map>                    // Interactive Germany map
```

#### Input Components

```tsx
<SearchInput>            // Debounced search with Fuse.js
<SelectInput>            // Wrapped select with routing
<CategoryInput>          // Multi-select with exclusion logic
```

#### Layout Components

```tsx
<Layout>                 // Page wrapper with SEO
<AnchorHeading>          // Heading with copy-link button
<VisualizationCard>      // Preview card for viz pages
```

### Third-Party Chart Libraries

- **Nivo:** `@nivo/bar`, `@nivo/line`, `@nivo/heatmap`
- **react-simple-maps:** Map visualization

---

## Layout & Responsive Design

### Breakpoints

CSS media queries defined in `styles/globals.css`:

- **Mobile:** `max-width: 768px`
- **Desktop:** `min-width: 769px`

### Container Sizes

From `theme.ts`:

| Size | Width |
|------|-------|
| `xs` | 540px |
| `sm` | 720px |
| `md` | 960px |
| `lg` | 1140px |
| `xl` | 1320px |

### Grid Responsive Patterns

Common span patterns using Mantine Grid:

```tsx
// Full width mobile, half on desktop
<Grid.Col span={{ base: 12, md: 6 }}>

// Full mobile, 2/3 desktop
<Grid.Col span={{ base: 12, md: 8 }}>

// Full mobile, 1/3 desktop
<Grid.Col span={{ base: 12, md: 4 }}>

// Multiple breakpoints
<Grid.Col span={{ base: 12, sm: 8 }}>
<Grid.Col span={{ base: 12, sm: 4 }}>
<Grid.Col span={{ base: 4, md: 2, lg: 1 }}>

// Grid ordering (reorder on mobile)
<Grid.Col order={{ base: 2, sm: 2 }}>
<Grid.Col order={{ base: 1, sm: 1 }}>
```

### Responsive Chart Strategy

**Dual Rendering Pattern:**

Charts render twice - once for mobile, once for desktop:

```tsx
<div className="only-mobile">
  <ChartComponent {...mobileProps} />
</div>
<div className="only-non-mobile">
  <ChartComponent {...desktopProps} />
</div>
```

**Mobile Optimizations:**
- Font size: 8px (vs 12px desktop)
- Reduced margins
- Click tooltips (vs hover)
- Tighter padding (0.1 vs 0.2)
- Legend repositioning
- Increased bottom margin (100px vs 30px)

### CSS Helper Classes

```css
.only-mobile {
  display: none;
}
@media (max-width: 768px) {
  .only-mobile { display: block; }
  .only-non-mobile { display: none; }
}
```

---

## Icons

### Icon Library

**@tabler/icons-react** (v3.35.0)

### Icons Used

| Icon | Component | Size | Usage |
|------|-----------|------|-------|
| `IconLink` | AnchorHeading | 20 | Copy link button |
| `IconCopy` | Case | 16 | Copy case link |
| `IconShare` | Case | 16 | Share button |

### Custom SVG Icons

**Bootstrap Link Icon:**
```tsx
// 20x20px, fill="currentColor"
// Used for case detail page links
```

### Usage Pattern

```tsx
import { IconCopy } from '@tabler/icons-react';

<IconCopy size={16} />
```

---

## Visual Elements

### Border Radius

| Element | Radius | Usage |
|---------|--------|-------|
| Standard | `4px` | Images, badges, tooltips, skip link |
| Charts | `8px` | OG images |
| Circles | `50%` | Circular markers (taser chart) |

### Shadows

```css
/* Tooltips */
box-shadow: 0 2px 8px rgba(0,0,0,0.2);

/* ChartTooltip */
box-shadow: 0 2px 8px rgba(0,0,0,0.15);

/* Cards */
shadow="sm"  // Mantine prop
```

### Borders

```typescript
// Map geography
stroke: "#D6D6DA"

// Markers
stroke: "#fff"
strokeWidth: 1-2

// HeatMap cells
borderWidth: 3    // Mobile only
borderColor: "#000"
borderWidth: 0    // Desktop
```

### Opacity Values

| Element | Opacity | Usage |
|---------|---------|-------|
| Map markers (sparse) | `0.3` | Few cases |
| Map markers (medium) | `0.4` | Moderate cases |
| Map markers (dense) | `0.5` | Many cases |
| Tooltips | `0.95` | Semi-transparent background |
| HeatMap inactive | `0.5` | Non-hovered cells |
| Chart legend | `0.75` | Default (1 on hover) |
| Anchor heading icon | `0→1` | Transition on hover |

---

## Accessibility

### Focus States

Enhanced focus indicators from `styles/globals.css`:

```css
*:focus-visible,
button:focus-visible,
a:focus-visible,
a:focus {
  outline: 2px solid #228be6;
  outline-offset: 2px;
}
```

### Skip Links

Allow keyboard users to skip to main content:

```css
.skip-link {
  position: absolute;
  left: -9999px;  /* Visually hidden */
}

.skip-link:focus {
  position: fixed;
  left: 10px;
  top: 10px;
  padding: 10px 20px;
  border-radius: 4px;
  background: #000;
  color: #fff !important;
  z-index: 100;
}
```

### ARIA Patterns

**Common ARIA Labels:**

```tsx
// Navigation
aria-label="Hauptnavigation"
aria-label="Zurück zur Startseite"
aria-label="Zum Hauptinhalt springen"

// Interactive elements
role="button"
tabIndex={0}
aria-label="Stadt: Berlin"

// Charts
role="img"
aria-label="Balkendiagramm zeigt..."

// Search
role="search"

// Live regions
role="status"
aria-live="polite"
```

**Pagination:**

```tsx
getControlProps={(control) => {
  if (control === 'previous')
    return { 'aria-label': 'Vorherige Seite' };
  if (control === 'next')
    return { 'aria-label': 'Nächste Seite' };
  return { 'aria-label': `Seite ${control}` };
}}
```

### Keyboard Navigation

- `tabIndex={0}` on custom interactive elements
- `onKeyDown` handlers for Enter/Space
- Proper semantic HTML (`<nav>`, `<main>`, `<button>`)
- Focus management in modals/dialogs

### Color Contrast

- Link colors meet WCAG AA (4.5:1 minimum)
- Focus outlines: 2px solid #228be6
- HeatMap: Dynamic text color based on background value

---

## Charts & Data Visualization

### Chart Types

1. **Vertical Bar Charts** - Year-over-year comparisons
2. **Horizontal Bar Charts** - Rankings, distributions
3. **Stacked Bar Charts** - Multi-category data
4. **Line Charts** - Trends over time
5. **HeatMaps** - State-level distributions
6. **Interactive Maps** - Geographic data

### Chart Color Schemes

#### Bar Charts (Stacked)

```typescript
// 3-layer indigo system
Layer 1: indigo[2] → indigo[4] (hover)
Layer 2: indigo[1] → indigo[3] (hover)
Layer 3: indigo[3] → indigo[5] (hover)
```

#### HeatMap

```typescript
// Quantized indigo scale
colors: theme.colors.indigo  // All 10 shades
quantize: 0-100%
```

#### Line Charts

```typescript
// Categorical palette for multiple series
['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', ...]
```

### Unified Tooltip System

**ChartTooltip Component:**

```tsx
<ChartTooltip
  label1="Jahr"
  value1="2020"
  label2="Anzahl"
  value2={15}
  unit="Fälle"
  unitSingular="Fall"
/>
```

**Tooltip Adapters:**

- `barChartTooltip` - Nivo bar charts
- `simpleBarChartTooltip` - Single-series
- `percentageTooltip` - Percentage display
- `lineChartTooltip` - Line chart points
- `heatMapTooltip` - HeatMap cells

### Mobile vs Desktop

**Desktop:**
- Hover tooltips
- Larger margins for legends
- 12px font size
- More generous spacing

**Mobile:**
- Click tooltips (dismiss by clicking outside)
- Fixed positioning at bottom center
- 8px font size
- Compact margins
- Touch-friendly hit areas

### Chart Responsiveness

- **Label skipping:** Automatic on dense charts
- **Tick selection:** Smart value filtering
- **Margin adjustments:** Context-dependent
- **Legend positioning:** Responsive placement

---

## Brand Elements

### Logo Assets

**CILIP Logo:**
- Format: SVG
- Desktop: `height: "80px"`, `width: "auto"`
- Mobile: `maxWidth: "100%"`

**Grimme Online Award Badge:**
- Format: Image
- Size: `height: "80px"`, `width: "auto"`
- Border radius: `4px`
- Position (desktop): Fixed `left: 5`, `top: 5`
- Position (mobile): Centered

### Cover Images

| Page | Image File |
|------|------------|
| Homepage | `cover_12.jpg` |
| Visualizations | `vis_cover.png` |
| Statistics | `statistik_cover.jpg` |
| New Case | `new_case_cover.jpg` |
| Taser | `taser_cover.jpg` |
| Methodology | `methodik_cover.jpeg` |

### Social Media (Open Graph)

**Dynamic OG Image Generation:**
- Routes: `/api/og-case.png`, `/api/og-viz.png`
- Font: Inter
- Background: #f8f9fa
- Dimensions: 1200×630px
- Format: PNG

### Typography Voice

- **Language:** German (all UI)
- **Formality:** "Sie" form (formal)
- **Tone:** Institutional, fact-based
- **Focus:** Data transparency, source citation

---

## Quick Reference

### New Developer Checklist

✅ **Colors**
- Use `theme.colors.indigo` for interactive elements
- Use custom gray scale for neutrals
- Badge colors: pink, grape, violet, indigo, blue, cyan, teal, green, lime

✅ **Typography**
- System font stack (no custom fonts)
- Use `<Title order={1-6}>` for headings
- Use `<Text>` with size/color props for body text

✅ **Spacing**
- Mantine scale: `xs/sm/md/lg/xl` (10px-24px)
- Major sections: `<Space h="xl" />`
- Minor spacing: `<Space h="lg" />`

✅ **Layout**
- Mobile-first approach
- Breakpoint: 768px (mobile) / 769px+ (desktop)
- Use `span={{ base: 12, md: 6 }}` pattern

✅ **Charts**
- Dual rendering (mobile + desktop versions)
- Indigo color scheme (indigo[1-5])
- Click tooltips on mobile, hover on desktop
- Font: 8px mobile, 12px desktop

✅ **Accessibility**
- Include ARIA labels on interactive elements
- Use semantic HTML
- Ensure focus states visible
- Add skip links for main content

✅ **Icons**
- Use @tabler/icons-react
- Common sizes: 16px, 20px

✅ **Components**
- Prefer Mantine components
- Extend with inline styles when needed
- Keep component files organized

### File Locations

| Type | Location |
|------|----------|
| Theme config | `/theme.ts` |
| Global CSS | `/styles/globals.css` |
| Charts | `/components/charts/` |
| Components | `/components/` |
| Pages | `/pages/` |
| Data | `/public/data.csv` |

### Common Patterns

**Responsive Grid:**
```tsx
<Grid.Col span={{ base: 12, md: 8 }}>
  {/* Content */}
</Grid.Col>
```

**Chart Colors:**
```tsx
const theme = useMantineTheme();
colors={[theme.colors.indigo[2], theme.colors.indigo[1]]}
```

**Mobile/Desktop Toggle:**
```tsx
<div className="only-mobile">{/* Mobile */}</div>
<div className="only-non-mobile">{/* Desktop */}</div>
```

**Spacing:**
```tsx
<Space h="xl" />  {/* 24px vertical space */}
```

---

## Maintenance Notes

### Updating Colors

To maintain visual consistency:
1. Always use theme colors from `theme.ts`
2. For charts, use indigo[1-5] range
3. New semantic colors should use Mantine color names
4. Test color contrast for accessibility

### Adding Components

1. Use Mantine components as base
2. Follow existing naming conventions
3. Implement mobile-responsive patterns
4. Include ARIA labels
5. Add to component inventory in this guide

### Chart Guidelines

1. Always provide mobile and desktop versions
2. Use unified `ChartTooltip` component
3. Follow 3-layer indigo color scheme
4. Include `role="img"` with `aria-label`
5. Test click interactions on mobile

### Accessibility Requirements

- **Minimum contrast:** 4.5:1 for text
- **Focus indicators:** 2px solid outline
- **Keyboard navigation:** All interactive elements
- **ARIA labels:** Descriptive, in German
- **Semantic HTML:** Proper heading hierarchy

---

**Questions or suggestions?** Update this guide as the design system evolves.
