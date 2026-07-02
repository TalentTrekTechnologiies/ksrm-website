# Banner Implementation Guide

## Quick Reference

### Banner File Paths
All banners are in: `public/banners/`

Exact file names (with spaces):
```
- accreditations banner.jpg
- alumni banner.jpg
- anti-ragging banner.jpg
- civil banner.avif
- contact us banner.webp
- cse banner.jpg
- cultural banner.jpg
- ece banner.jpg
- edc banner.avif
- eee banner.jpg
- examinations banner.jpg
- h&s banner.png
- hostel banner.jpg
- iqac banner.webp
- mba banner.avif
- mechanical banner.jpg
- naac banner.webp
- nss banner.jpg
- sports banner.png
- startup banner.jpg
- transport banner.webp
```

### Filtered Image Path
Fallback images are in: `public/gallery/Gallery _ KSRM College of Engineering_files/`

### Standard Hero Section Template

```tsx
<section
  style={{
    position: "relative",
    backgroundImage: "url('/banners/xxx banner.ext')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#f5f5f5",
    minHeight: 320,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
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
  <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
    {/* Content here */}
  </div>
</section>
```

## What to Remove
❌ DO NOT USE:
- `linear-gradient(135deg, #2B3490 0%, #1e2570 100%)` - BLUE GRADIENT
- `rgba(43, 52, 144, 0.85)` - BLUE OVERLAY
- `background-color: #2B3490` - BLUE FALLBACK
- `::after` with dark gradient hiding image
- Opacity reduction on hero
- Black overlays

## What to Keep
✅ ALWAYS USE:
- `backgroundImage: url('/banners/...')`
- `backgroundSize: "cover"`
- `backgroundPosition: "center"`
- Light overlay: `rgba(0,0,0,0.15)` to `rgba(0,0,0,0.25)` (for text contrast only)
- White text: `color: "#fff"`
- Subtle text-shadow: `textShadow: "0 2px 8px rgba(0,0,0,0.4)"`

## Z-Index Layering
```
Background image: implicit z-index 0
Light overlay (::before): z-index 1
Content div: z-index 2 or position: relative
```

## Testing Checklist
When updating a page:
1. ✅ Banner image visible
2. ✅ Image not stretched or distorted
3. ✅ No blue color visible
4. ✅ No dark overlay hiding image
5. ✅ Text readable (white on any background)
6. ✅ Hero height consistent (320px+)
7. ✅ Responsive on mobile
8. ✅ Image loads without error

## Common Mistakes to Avoid

### ❌ Wrong: Dark overlay hiding image
```tsx
background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)"
// This hides 55% of the image - TOO DARK
```

### ✅ Right: Light overlay only for contrast
```tsx
background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)"
// This only darkens 15-25% for text readability
```

### ❌ Wrong: Blue gradient background
```tsx
background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)"
// This is the OLD STYLE we're removing
```

### ✅ Right: Real image background
```tsx
backgroundImage: "url('/banners/xxx banner.jpg')"
// This shows the actual image
```

## Migration Checklist

For EVERY page update:
- [ ] Read page content/purpose
- [ ] Select appropriate banner from mapping
- [ ] Replace background-image with banner path
- [ ] Remove ::after overlay if it has dark gradient
- [ ] Add light overlay only (if needed for contrast)
- [ ] Verify text is white and readable
- [ ] Test image loads
- [ ] Commit with message: "Add proper hero banner to [page name]"

## Future Additions

When adding new pages:
1. Check BANNER_MAPPING.md for recommended banner
2. Use template above
3. Keep consistent with existing pages
4. Test on light and dark banners
5. Never use blue gradients

## Questions?

Refer to BANNER_MAPPING.md for complete page-to-banner mapping.
