# Requirements: Homepage Slider Redesign (Split Layout)

## Requirement 1: Split Layout Structure
### Acceptance Criteria
- GIVEN the homepage is loaded WHEN the HeroBanner renders THEN it displays a split layout with text content on the left (45%) and image on the right (55%)
- GIVEN the slider container WHEN viewed on desktop (≥1024px) THEN the grid is `grid-cols-[45%_55%]`
- GIVEN the slider container WHEN viewed on tablet (768-1023px) THEN the grid is `grid-cols-[50%_50%]`
- GIVEN the slider container WHEN viewed on mobile (<768px) THEN the layout stacks vertically (image on top, text below)

## Requirement 2: Left Panel - Text Content
### Acceptance Criteria
- GIVEN the left panel WHEN a slide is active THEN it shows: subtitle badge, title (h1), description paragraph, and CTA button
- GIVEN the left panel WHEN the slide changes THEN the background color transitions smoothly to the new slide's `bgColor`
- GIVEN the left panel text WHEN a new slide appears THEN text elements animate in with fadeInUp effect
- GIVEN the CTA button WHEN clicked THEN it navigates to `/shop`

## Requirement 3: Right Panel - Image Display
### Acceptance Criteria
- GIVEN the right panel WHEN a slide is active THEN it displays the slide's image with `object-cover` filling the full height
- GIVEN the right panel WHEN the slide changes THEN the image transitions with a horizontal slide (translateX) animation
- GIVEN the image WHEN displayed THEN it has no gradient overlay obscuring it (clean display)

## Requirement 4: Navigation Controls
### Acceptance Criteria
- GIVEN the navigation arrows WHEN the slider renders THEN they are always visible in the bottom-left panel (not hover-only)
- GIVEN the previous arrow WHEN clicked THEN it navigates to the previous slide (wraps to last)
- GIVEN the next arrow WHEN clicked THEN it navigates to the next slide (wraps to first)
- GIVEN the dot indicators WHEN rendered THEN they appear in the bottom area of the left panel
- GIVEN a dot indicator WHEN clicked THEN it navigates directly to that slide

## Requirement 5: Auto-play Functionality
### Acceptance Criteria
- GIVEN the slider WHEN loaded THEN it auto-advances every 6 seconds
- GIVEN the auto-play WHEN the component unmounts THEN the interval is cleared (no memory leak)

## Requirement 6: Visual Design Consistency
### Acceptance Criteria
- GIVEN the slider container WHEN rendered THEN it maintains `rounded-[36px]`, border, and shadow styling consistent with current design
- GIVEN the left panel text WHEN displayed THEN it has high contrast (white text on dark background) regardless of image content
- GIVEN the overall slider WHEN viewed THEN it uses the project's existing color palette (primary greens, accent golds, earthy tones)
