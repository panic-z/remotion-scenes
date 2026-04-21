---
name: prompt-to-project
description: Use when the user supplies a scenes-prompt.md (or equivalent Markdown matching the remotion-scenes format) and wants to scaffold a new Remotion project that implements it. Part of the remotion-scenes plugin. Does NOT generate the prompt itself (that is the script-to-prompt sub-skill).
---

# prompt-to-project

Scaffold a Remotion project from a scenes-prompt.md.

## When to use

- User provides (or has just generated) a `scenes-prompt.md` and asks to build / scaffold / implement the Remotion project.
- Do NOT use this skill if the user only wants to generate the prompt — that is `script-to-prompt`.

## Required companion skill

If `remotion-best-practices` skill is available, load and apply these rules during this task:
- `rules/animations.md`
- `rules/timing.md`
- `rules/sequencing.md`
- `rules/text-animations.md`
- `rules/compositions.md`
- `rules/transitions.md` (if any scene uses a transition)

If `remotion-best-practices` is not installed, proceed using this skill's `references/animation-patterns.md` as a fallback.

## Inputs

1. **Scenes prompt** — required. Either a file path or pasted Markdown.
2. **Project name** — optional. If missing and CWD is non-empty, ask the user.

## Process

### Step 1: Load and parse the prompt

Read the prompt file (or use the pasted content). Extract:

- Header: `# Video: <title>`, `Dimensions:` (WxH), `FPS:`, `Background:`.
- Each scene block `## Scene N: <name>` with:
  - `Duration:` — parse the frame count from `Ns (Nf frames)`.
  - `Transition-in:` / `Transition-out:` — one of `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `none`.
  - `### Visuals` body (string).
  - `### Animations` bullets (parse each into `{element, verb, direction?, range: [A, B], extras?}`).
  - `### Assets` bullets (`- none` ⇒ empty; `- image: <path-or-url>` ⇒ asset).

**Validation — fail fast with a clear message if:**
- Header is missing any of Dimensions/FPS.
- A scene is missing `Duration` or frame math is inconsistent.
- Any Animation bullet has no frame range.

### Step 2: Decide scaffold directory

- If CWD is empty (no files other than the prompt itself and `.git`): scaffold in place.
- Else if a project name was provided: scaffold in `./<project-name>/`.
- Else: ask the user for a project name. Suggest a slug of the video title.

### Step 3: Run the scaffold

Run from the chosen parent directory:
```bash
npx create-video@latest --yes --blank --no-tailwind <name>
```

For in-place scaffolding, run in a temp sibling directory and move files — or ask the user to confirm creating in a named subdirectory (preferred, simpler). Default behavior: always use a named subdirectory when CWD is non-empty.

If `@remotion/transitions` is needed (any scene boundary not `none`), install it:
```bash
cd <project-dir> && npm install @remotion/transitions
```

### Step 4: Generate source files

Replace the scaffold's default source with files based on the parsed prompt.

#### 4a. `src/Root.tsx`

```tsx
import { Composition } from "remotion";
import { Main } from "./Main";

export const RemotionRoot = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={<TOTAL_FRAMES>}
      fps={<FPS>}
      width={<WIDTH>}
      height={<HEIGHT>}
    />
  );
};
```

Substitute: `TOTAL_FRAMES` = sum of all scene frame counts; `FPS/WIDTH/HEIGHT` from the prompt header.

#### 4b. `src/Main.tsx`

If any boundary uses a transition (not `none`):
```tsx
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
// import scene components
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
// ...

export const Main = () => {
  return (
    <AbsoluteFill style={{ background: "<BACKGROUND>" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={<SCENE_1_FRAMES>}>
          <Scene1 />
        </TransitionSeries.Sequence>
        {/* if transition between 1 and 2 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={<SCENE_2_FRAMES>}>
          <Scene2 />
        </TransitionSeries.Sequence>
        {/* ...more scenes */}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

Otherwise use plain `<Series>` (from `remotion`) + `<Series.Sequence>`.

Transition presentation mapping:
- `fade` → `fade()`
- `slide-left` → `slide({ direction: "from-right" })`  (outgoing slides to left, incoming from right)
- `slide-right` → `slide({ direction: "from-left" })`
- `slide-up` → `slide({ direction: "from-bottom" })`
- `slide-down` → `slide({ direction: "from-top" })`

#### 4c. `src/scenes/SceneN.tsx` — one file per scene

Template per scene:
```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from "remotion";

export const SceneN = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Per-element animation values derived from `### Animations` bullets.
  // Use references/animation-patterns.md for the DSL→code mapping.

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "white", fontFamily: "sans-serif" }}>
      {/* Render elements described in ### Visuals, with style derived from Animations. */}
    </AbsoluteFill>
  );
};
```

For each Animation bullet, translate using `references/animation-patterns.md`. Compose multiple animations on one element by multiplying transforms and combining opacity.

#### 4d. Assets

- Remote URL (`https://...`): use `<Img src={url}>` directly.
- Local `./assets/...` path: ensure `public/assets/` exists; reference via `staticFile("assets/filename.ext")` from `remotion`. If the file doesn't exist yet, render a placeholder colored `<div>` the same size, with a code comment `// TODO: provide <path>` and add the path to a "missing assets" list.

### Step 5: Sanity-check render (optional, recommended)

```bash
cd <project-dir> && npx remotion still Main --scale=0.25 --frame=30 --output=out/frame30.png
```

Report PASS/FAIL. If it fails, surface the error to the user and stop before claiming success.

### Step 6: Summarize

Print:
1. Project directory path.
2. List of files generated.
3. "Missing assets" checklist (paths the user needs to place in `public/assets/`).
4. Next commands:
   ```
   cd <project-dir>
   npx remotion studio
   ```

## Constraints

- Never enable Tailwind — the scaffold flag `--no-tailwind` is mandatory.
- Never add voiceover or subtitle tracks.
- All frame ranges in the scenes prompt are scene-local; convert correctly when the Main composition uses a single global frame (it does not — each `<Sequence>` resets the frame counter inside the child component).
- Do not modify files outside the chosen project directory.

## Output checklist (verify before claiming success)

- [ ] `src/Root.tsx` exists, `durationInFrames` equals sum of scene frames.
- [ ] One `src/scenes/SceneN.tsx` per scene in the prompt.
- [ ] Every Animation bullet in the prompt has a corresponding piece of code in its scene file.
- [ ] Transitions match the prompt's `Transition-in` / `Transition-out` boundaries.
- [ ] Missing-assets list reported to the user (may be empty).
- [ ] `npx remotion studio` command given as the final next step.
