# Technical Design: Homepage Slider Redesign (Split Layout)

## Overview

Redesign component `HeroBanner` từ layout full-width overlay sang **Split Layout** (text bên trái trên nền màu, ảnh bên phải). Giữ nguyên chức năng auto-play, navigation, và indicators.

## High-Level Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Container (rounded-[36px], border, shadow)                  │
│ ┌──────────────────────────┬────────────────────────────────┐│
│ │                          │                                ││
│ │   TEXT CONTENT (45%)     │      IMAGE (55%)               ││
│ │                          │                                ││
│ │   [subtitle badge]       │   ┌────────────────────────┐  ││
│ │                          │   │                        │  ││
│ │   Title Heading          │   │    Product/Plant       │  ││
│ │                          │   │    Image               │  ││
│ │   Description text       │   │                        │  ││
│ │                          │   │                        │  ││
│ │   [CTA Button]           │   └────────────────────────┘  ││
│ │                          │                                ││
│ │   ● ● ●  (indicators)   │                                ││
│ └──────────────────────────┴────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
HeroBanner (stateful - manages slide index, auto-play)
├── Left Panel (text content)
│   ├── Subtitle Badge
│   ├── Title (h1)
│   ├── Description (p)
│   ├── CTA Button
│   └── Indicators + Navigation Arrows
└── Right Panel (image)
    └── Slide Image (with subtle overlay/decoration)
```

### Data Model (unchanged)

```typescript
interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgColor: string; // NEW: background color for left panel (replaces gradient overlay)
}
```

### Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1024px) | Split 45/55 side-by-side |
| Tablet (768-1023px) | Split 50/50, smaller text |
| Mobile (<768px) | Stacked: image on top, text below |

## Low-Level Design

### Slide Data Update

```typescript
const slides = [
  {
    id: 1,
    title: "Trồng một mầm xanh",
    subtitle: "Gieo mầm hy vọng",
    description: "Mỗi cái cây bạn trồng không chỉ làm đẹp không gian...",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?...",
    bgColor: "bg-[#2d4a35]", // dark green
  },
  {
    id: 2,
    title: "Chạm vào thiên nhiên",
    subtitle: "Sống chậm lại",
    description: "Mang hơi thở của rừng xanh vào ngôi nhà của bạn...",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?...",
    bgColor: "bg-[#3a5a3a]", // forest green
  },
  {
    id: 3,
    title: "Món quà từ đất mẹ",
    subtitle: "Gắn kết yêu thương",
    description: "Cây xanh là món quà ý nghĩa nhất...",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?...",
    bgColor: "bg-[#4a3f2d]", // earthy brown-green
  },
];
```

### Component Structure (JSX)

```tsx
<div className="container mx-auto mt-2 px-6 py-8 md:px-12">
  <div className="group relative h-[500px] w-full overflow-hidden rounded-[36px] border border-white/45 shadow-[...]">
    
    {/* Split Layout Grid */}
    <div className="grid h-full grid-cols-1 md:grid-cols-[45%_55%]">
      
      {/* Left Panel - Text Content */}
      <div className={`relative flex flex-col justify-center p-10 md:p-14 ${slides[currentSlide].bgColor} transition-colors duration-700`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black/5 to-transparent" />
        
        {/* Content with animations */}
        <span className="subtitle-badge">...</span>
        <h1 className="title">...</h1>
        <p className="description">...</p>
        <button className="cta-button">...</button>
        
        {/* Bottom: Indicators + Arrows */}
        <div className="mt-auto flex items-center gap-4">
          <button onClick={prevSlide}>←</button>
          <div className="indicators">...</div>
          <button onClick={nextSlide}>→</button>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="relative h-full overflow-hidden">
        <div 
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="h-full w-full flex-shrink-0">
              <img src={slide.image} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
```

### Animation Strategy

- **Text content**: Fade-in-up animation khi chuyển slide (dùng key-based re-render hoặc CSS animation reset)
- **Image**: Slide transition (translateX) giữ nguyên như hiện tại
- **Background color**: Smooth transition via `transition-colors duration-700`
- **Indicators/Arrows**: Luôn hiển thị (không cần hover), đặt ở bottom-left panel

### Styling Details

- Left panel: Solid dark color background (per slide), white text
- Right panel: Image full-height, object-cover, slight rounded corner ở góc phải
- Decorative: Subtle gradient edge giữa 2 panel để tạo depth
- Mobile: Image chiếm ~200px phía trên, text phía dưới với padding nhỏ hơn

### Key Differences from Current

| Aspect | Current | New |
|---|---|---|
| Layout | Full-width image + overlay | Split 45/55 grid |
| Text background | Gradient overlay on image | Solid color panel |
| Navigation | Arrows center (hover) | Arrows bottom-left (always visible) |
| Indicators | Bottom center | Bottom-left panel |
| Image | Background, covered by gradient | Clean, full display |
| Readability | Depends on image contrast | Always high contrast |

## Files Modified

- `frontend/src/components/home/HeroBanner.tsx` - Complete rewrite of component layout

## Dependencies

- No new packages needed
- Uses existing: `@phosphor-icons/react`, `react-router`, Tailwind CSS
