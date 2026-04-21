# Animation Patterns (scenes-prompt DSL → Remotion code)

This file maps the animation vocabulary used in scenes-prompt files to concrete Remotion implementations. Keep each pattern minimal and composable. For deeper explanations, load `remotion-best-practices/rules/animations.md` and `rules/timing.md`.

All examples assume:
```ts
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
```

`frame` is the **scene-local** frame (inside a `<Sequence>` or `<Series.Sequence>`), matching the scenes-prompt DSL's frame ranges.

## fade-in at A-Bf

```tsx
const frame = useCurrentFrame();
const opacity = interpolate(frame, [A, B], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
return <div style={{ opacity }}>...</div>;
```

## fade-out at A-Bf

```tsx
const opacity = interpolate(frame, [A, B], [1, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## slide-in from {left|right|top|bottom} at A-Bf

```tsx
// from left → element enters moving rightward
const x = interpolate(frame, [A, B], [-200, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
return <div style={{ transform: `translateX(${x}px)` }}>...</div>;
```

Direction → axis/sign:
- left: translateX from `-OFFSET` to `0`
- right: translateX from `+OFFSET` to `0`
- top: translateY from `-OFFSET` to `0`
- bottom: translateY from `+OFFSET` to `0`

Default `OFFSET = 200`.

## slide-out to {left|right|top|bottom} at A-Bf

```tsx
// to left → element exits moving leftward
const x = interpolate(frame, [A, B], [0, -200], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
return <div style={{ transform: `translateX(${x}px)` }}>...</div>;
```

Direction → axis/sign:
- left: translateX from `0` to `-OFFSET`
- right: translateX from `0` to `+OFFSET`
- top: translateY from `0` to `-OFFSET`
- bottom: translateY from `0` to `+OFFSET`

## scale X→Y via spring at A-Bf

```tsx
const { fps } = useVideoConfig();
const progress = spring({
  frame: frame - A,
  fps,
  config: { damping: 12, stiffness: 120 },
  durationInFrames: B - A,
});
const scale = interpolate(progress, [0, 1], [X, Y]);
return <div style={{ transform: `scale(${scale})` }}>...</div>;
```

## typewriter at A-Bf

Reveal characters one by one across the frame range:
```tsx
const visibleChars = Math.floor(
  interpolate(frame, [A, B], [0, text.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
);
return <span>{text.slice(0, visibleChars)}</span>;
```

## stagger-in at A-Bf (list)

Each item starts `STEP` frames after the previous:
```tsx
const STEP = 5;
return items.map((item, i) => {
  const start = A + i * STEP;
  const opacity = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div key={i} style={{ opacity }}>{item}</div>;
});
```

## Transitions between scenes

When adjacent scenes specify `Transition-out: fade` / `Transition-in: fade`, use `@remotion/transitions`:

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}><Scene1 /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence durationInFrames={120}><Scene2 /></TransitionSeries.Sequence>
</TransitionSeries>
```

Transition duration default: 15 frames (0.5s @ 30fps).

When no transition is specified for a boundary, use plain `<Series>` + `<Series.Sequence>` without `<TransitionSeries.Transition>`.
