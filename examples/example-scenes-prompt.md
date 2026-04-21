# Video: Introducing FluxNote
Dimensions: 1920x1080
FPS: 30
Background: #0a0a0a

## Scene 1: Title
Duration: 4s (120 frames)
Transition-in: none
Transition-out: fade

### Visuals
Center-aligned bold title "FluxNote" in large white sans-serif (120px). A subtitle "think in connections" appears below in 36px muted gray (#888).

### Animations
- title: fade-in at 0-20f, scale 0.9→1.0 via spring at 0-30f
- subtitle: fade-in at 15-35f, slide-in from bottom at 15-35f

### Assets
- none

## Scene 2: Nodes and links
Duration: 6s (180 frames)
Transition-in: fade
Transition-out: fade

### Visuals
Five circular nodes labeled as short words ("idea", "note", "link", "graph", "you") arranged across the canvas. Thin lines (2px, #4f8cff) progressively connect them.

### Animations
- nodes: stagger-in at 0-60f
- links: stagger-in at 60-120f
- callout text: fade-in at 120-150f, fade-out at 160-180f

### Assets
- none

## Scene 3: Cross-device sync
Duration: 5s (150 frames)
Transition-in: fade
Transition-out: fade

### Visuals
Three device silhouettes (desktop, phone, tablet) side by side with a pulsing sync arc above them. Caption "sync in seconds" below.

### Animations
- desktop device: slide-in from bottom at 0-20f
- phone device: slide-in from bottom at 10-30f
- tablet device: slide-in from bottom at 20-40f
- sync-arc: fade-in at 30-60f, scale 0.8→1.0 via spring at 30-60f, fade-out at 105-120f
- caption: fade-in at 60-90f

### Assets
- image: ./assets/device-desktop.svg
- image: ./assets/device-phone.svg
- image: ./assets/device-tablet.svg

## Scene 4: CTA
Duration: 3s (90 frames)
Transition-in: fade
Transition-out: none

### Visuals
Large text "Free for your first 100 notes" centered, with a smaller button-styled text "fluxnote.app" below in accent color (#4f8cff).

### Animations
- headline: typewriter at 0-40f
- cta: fade-in at 40-60f, scale 0.95→1.0 via spring at 40-70f

### Assets
- none
