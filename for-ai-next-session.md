# AI TODO: Next Session / Roadmap

## 🚧 IN PROGRESS (branch: `production`)

### Performance (Core Web Vitals) — CURRENT FOCUS
- Target Google CWV: LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1
- Remove runtime Tailwind CDN (main-thread cost)
- Reduce animation jank on first load (geometric layers, filters, infinite motion)
- Defer non-critical JS / third-party CSS
- Work stays on `production` until verified; do **not** merge unfinished work to `master` (live)

---

## 📋 QUEUED (do after performance is solid)

### 1. Update Featured Projects (homepage)
- **Status**: Noted / not started
- **Where**: `index.html` featured projects section
- **Goal**: Refresh which projects are featured and their copy/links/thumbnails to match current best work

### 2. Update Projects Page
- **Status**: Noted / not started
- **Where**: `projects.html` (+ related project detail pages if needed)
- **Goal**: Update project list, filters, descriptions, and presentation
- Related prior note: design cards should eventually use real design images in card headers (see below)

### 3. Light / Dark Mode Toggle
- **Status**: Noted / not started
- **Where**: shared nav + `styles.css` / `scripts.js` (theme tokens + persistence)
- **Goal**: Site-wide light/dark toggle with saved preference (`localStorage` + `prefers-color-scheme`)
- Tailwind config already anticipates `darkMode: "class"` once built CSS is in place

### 4. Graphic Design Project Card Visual Enhancement
- **Status**: Planned
- **Priority**: After projects-page content update
- Replace solid color design-card headers with actual assets from `Graphic Designs/`

---

## ✅ COMPLETED (historical)
See prior checklist items below for older completed work.

### Show More Details Removal / Projects Optimizations / Docs / Social Thumbnail / Design Pages
- Completed in earlier sessions (card heights, pagination, docs folder, OG tags, design project pages, Design filter)
