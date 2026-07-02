# Banner System - Quick Reference

## Adding a Banner to a New Page

### Option 1: Using Hero Section Style (Inline)

```tsx
<section
  style={{
    backgroundImage: "url('/banners/xxx banner.ext')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#f5f5f5",
    minHeight: 320,
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    padding: "40px",
  }}
>
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)",
      zIndex: 1,
    }}
  />
  <div style={{ position: "relative", zIndex: 2 }}>
    {/* Your content */}
  </div>
</section>
```

### Option 2: Using CSS Class

```tsx
<section className="hero">
  {/* Content */}
</section>
```

```css
.hero {
  position: relative;
  background-image: url('/banners/xxx banner.ext');
  background-size: cover;
  background-position: center;
  background-color: #f5f5f5;
  min-height: 320px;
  display: flex;
  align-items: flex-end;
  padding: 40px;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
  z-index: 1;
}

.hero > * {
  position: relative;
  z-index: 2;
}
```

## Banner File Paths

### Exact Banner Filenames (Copy-Paste)
```
/banners/accreditations banner.jpg
/banners/alumni banner.jpg
/banners/anti-ragging banner.jpg
/banners/civil banner.avif
/banners/contact us banner.webp
/banners/cse banner.jpg
/banners/cultural banner.jpg
/banners/ece banner.jpg
/banners/edc banner.avif
/banners/eee banner.jpg
/banners/examinations banner.jpg
/banners/h&s banner.png
/banners/hostel banner.jpg
/banners/iqac banner.webp
/banners/mba banner.avif
/banners/mechanical banner.jpg
/banners/naac banner.webp
/banners/nss banner.jpg
/banners/sports banner.png
/banners/startup banner.jpg
/banners/transport banner.webp
```

### Fallback Images (Filtered Folder)
```
/gallery/Gallery _ KSRM College of Engineering_files/
  - library.jpg (for academic/library pages)
  - lab.jpg, labw.jpg, roboticslab.jpg (for research/lab pages)
  - block.jpg, blocktop.jpg, topview.jpg (for campus pages)
  - seminar.jpg (for events/news)
  - event.jpg, event2.jpg, fest.jpg (for events)
  - sportsground.jpg, sportsg3.jpg (for sports)
  - studentsinlib.jpg (for library/academic)
  - achievements.jpg (for placement/achievements)
  - activity.jpg, activity2.jpg, activity3.jpg (for campus life)
  - inaugaration.jpg, inaugaration2.jpg (for inauguration events)
  - buses.jpg (for transport)
```

## DO's ✅
- ✅ Use `backgroundImage: url('...')` 
- ✅ Use `backgroundSize: "cover"`
- ✅ Use `backgroundPosition: "center"`
- ✅ Set fallback color to `#f5f5f5` (light gray)
- ✅ Use light overlay: `rgba(0,0,0,0.15)` to `rgba(0,0,0,0.25)`
- ✅ Keep text white: `color: "#fff"`
- ✅ Add text-shadow for readability
- ✅ Maintain z-index layering properly
- ✅ Keep hero height at minimum 320px

## DON'Ts ❌
- ❌ Don't use blue gradients: `linear-gradient(135deg, #2B3490...)`
- ❌ Don't use blue fallback: `backgroundColor: "#2B3490"`
- ❌ Don't use dark overlays: `rgba(0,0,0,0.5+)`
- ❌ Don't hide the image with overlays
- ❌ Don't forget z-index layering
- ❌ Don't use stretched or distorted images
- ❌ Don't forget `backgroundSize: "cover"`
- ❌ Don't leave hero sections empty

## Common Image Choices by Page Type

| Page Type | Best Banner | Alternative |
|-----------|------------|-------------|
| Academic | library.jpg, classroom | block.jpg |
| Department | department-specific banner | blocktop.jpg |
| Event/News | event.jpg, seminar.jpg | activity.jpg |
| Campus Life | topview.jpg, blocktop.jpg | activity.jpg |
| Admissions | contact us banner | topview.jpg |
| Placements | startup banner | achievements.jpg |
| Sports | sports banner | sportsground.jpg |
| Library | library.jpg | studentsinlib.jpg |
| Labs | lab.jpg, roboticslab.jpg | labw.jpg |

## Validation

Run the validation script to check all pages:
```bash
node frontend/scripts/validate-banners.js
```

## Troubleshooting

**Problem: Blue banner still showing**
- Solution: Check file paths use EXACT spacing (e.g., "alumni banner.jpg" not "alumni-banner.jpg")

**Problem: Text not readable**
- Solution: Overlay might be too light. Increase opacity to `rgba(0,0,0,0.3)` or `rgba(0,0,0,0.4)`

**Problem: Image looks stretched**
- Solution: Ensure `backgroundSize: "cover"` and `backgroundPosition: "center"` are set

**Problem: Image not loading**
- Solution: Check path spelling and ensure file exists in /banners/ or /gallery/ folder

## Resources

See also:
- `BANNER_MAPPING.md` - Complete page-to-banner mapping
- `BANNER_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `ROUTE_CHECKLIST.md` - All pages that need banners
