# Tasks: Homepage Slider Redesign (Split Layout)

## Task 1: Update slide data model with bgColor property
- [ ] Replace the `color` (gradient) field with `bgColor` (solid Tailwind class) in each slide object
- [ ] Slide 1: `bgColor: "bg-[#2d4a35]"` (dark green)
- [ ] Slide 2: `bgColor: "bg-[#3a5a3a]"` (forest green)
- [ ] Slide 3: `bgColor: "bg-[#4a3f2d]"` (earthy brown-green)

## Task 2: Implement split layout grid structure
- [ ] Replace the current full-width overlay layout with a CSS Grid: `grid-cols-1 md:grid-cols-[45%_55%]`
- [ ] Left panel: flex column, justify-center, padding, dynamic bgColor from slide data
- [ ] Right panel: relative, overflow-hidden, full height for image
- [ ] Ensure the outer container keeps `rounded-[36px]`, border, and shadow

## Task 3: Build left panel text content with animations
- [ ] Render subtitle badge, title (h1), description, and CTA button in the left panel
- [ ] Apply fadeInUp animations to text elements using key-based re-render on slide change
- [ ] CTA button navigates to `/shop` on click
- [ ] Add subtle decorative gradient edge on the right side of left panel

## Task 4: Build right panel image carousel
- [ ] Implement horizontal slide transition (translateX) for images
- [ ] Images display with `object-cover` and full height, no gradient overlay
- [ ] Ensure smooth 1000ms ease-in-out transition between slides

## Task 5: Relocate navigation controls to left panel bottom
- [ ] Move prev/next arrows to bottom of left panel (always visible, not hover-only)
- [ ] Move dot indicators to bottom of left panel, between or beside arrows
- [ ] Style arrows and indicators with white/semi-transparent styling on dark background
- [ ] Maintain click handlers: prev, next, and direct slide selection

## Task 6: Implement responsive behavior for mobile/tablet
- [ ] Mobile (<768px): Stack layout - image on top (~200px), text below with smaller padding
- [ ] Tablet (768-1023px): Split 50/50 with slightly smaller text
- [ ] Desktop (≥1024px): Split 45/55 as designed
- [ ] Ensure all interactive elements remain accessible on all breakpoints
