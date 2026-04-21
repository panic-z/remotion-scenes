# Remotion Scenes Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Codex plugin `remotion-scenes` containing one parent index skill and two sub-skills (`script-to-prompt`, `prompt-to-project`) that turn a video script into a working Remotion project.

**Architecture:** Plugin directory with `.codex-plugin/plugin.json` manifest and three skills under `skills/`. The parent skill is documentation-only; sub-skills are discoverable and invokable independently. The two sub-skills communicate via a Markdown "scenes prompt" file format that is both human-editable and LLM-parseable. Sub-skill 2 delegates Remotion domain knowledge to the existing `remotion-best-practices` skill by referencing its rules.

**Tech Stack:** Codex plugin manifest (JSON), skills (Markdown with YAML frontmatter), target runtime is Remotion (create-video@latest, blank template, no Tailwind).

**Testing note:** This plan produces primarily Markdown/JSON artifacts (skills, docs, manifest). There is no unit test harness in the plugin. Verification is done by (a) loading the plugin in a fresh Codex session, (b) running the end-to-end example, (c) asserting files exist with correct frontmatter. These verification steps are explicit tasks.

**Repo root for this plan:** `/Users/wubaiyu/DEV/side-projects/remotion-scenes/`

---

## File Structure

Files this plan creates (all paths relative to repo root):

- `.codex-plugin/plugin.json` — plugin manifest (name, version, description, author)
- `skills/remotion-scenes/SKILL.md` — parent index skill
- `skills/script-to-prompt/SKILL.md` — sub-skill 1: script → scenes prompt
- `skills/script-to-prompt/templates/scenes-prompt-template.md` — blank template referenced by sub-skill 1
- `skills/prompt-to-project/SKILL.md` — sub-skill 2: scenes prompt → Remotion project
- `skills/prompt-to-project/references/animation-patterns.md` — code snippets for common animations
- `README.md` — user-facing install & usage documentation
- `examples/example-script.md` — sample input
- `examples/example-scenes-prompt.md` — expected sub-skill 1 output for the sample
- `LICENSE` — MIT
- `.gitignore` — ignore node_modules, .DS_Store

**Responsibility split:**
- `script-to-prompt/SKILL.md` owns prompting logic for *content analysis* (narrative vs storyboard detection, scene segmentation).
- `prompt-to-project/SKILL.md` owns *project scaffolding orchestration* and defers animation implementation to `remotion-best-practices` rules.
- `animation-patterns.md` in sub-skill 2 is a minimal crib sheet mapping the scenes-prompt animation DSL (e.g. `fade-in at 0-15f`) → concrete Remotion code, so the sub-skill doesn't redefine what `remotion-best-practices/rules/animations.md` already explains.

---

## Task 1: Initialize repo and git

**Files:**
- Create: `.gitignore`
- Git init at repo root

- [ ] **Step 1: Check current state**

Run: `ls -la /Users/wubaiyu/DEV/side-projects/remotion-scenes/`
Expected: shows existing `docs/` directory (spec + plan) and nothing else that conflicts.

- [ ] **Step 2: Init git**

Run:
```bash
cd /Users/wubaiyu/DEV/side-projects/remotion-scenes && git init -b main
```
Expected: "Initialized empty Git repository".

- [ ] **Step 3: Write `.gitignore`**

Create `.gitignore` with exactly:
```
node_modules/
.DS_Store
dist/
out/
*.log
.env
.env.local
```

- [ ] **Step 4: First commit**

```bash
git add .gitignore docs/
git commit -m "chore: initial commit with spec and plan"
```
Expected: commit created.

---

## Task 2: Plugin manifest

**Files:**
- Create: `.codex-plugin/plugin.json`

- [ ] **Step 1: Write `.codex-plugin/plugin.json`**

Exact content:
```json
{
  "name": "remotion-scenes",
  "version": "0.1.0",
  "description": "Turn a video script into a working Remotion project: script → scenes prompt → scaffolded project with animations.",
  "author": {
    "name": "remotion-scenes contributors"
  },
  "homepage": "https://github.com/panic-z/remotion-scenes",
  "license": "MIT",
  "keywords": ["remotion", "video", "animation", "scenes"]
}
```

- [ ] **Step 2: Verify JSON parses**

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')).name)"`
Expected: `remotion-scenes`

- [ ] **Step 3: Commit**

```bash
git add .codex-plugin/plugin.json
git commit -m "feat: add plugin manifest"
```

---

## Task 3: Parent skill (index)

**Files:**
- Create: `skills/remotion-scenes/SKILL.md`

- [ ] **Step 1: Write `skills/remotion-scenes/SKILL.md`**

Exact content:
````markdown
---
name: remotion-scenes
description: Index skill for the remotion-scenes plugin. Use when the user mentions turning a script into a Remotion video, or asks what the remotion-scenes plugin offers. This skill does not perform work itself — it points at two sub-skills.
---

# remotion-scenes (index)

This plugin provides a **two-step workflow** for producing Remotion video projects from a script.

## The two sub-skills

1. **`script-to-prompt`** — Input: a video script (narrative text or storyboard, pasted or file path). Output: a structured Markdown "scenes prompt" (`scenes-prompt.md`) that describes each scene's visuals, animations, timing, and assets.

2. **`prompt-to-project`** — Input: a scenes-prompt.md. Output: a scaffolded Remotion project (using `npx create-video@latest --yes --blank --no-tailwind`) with each scene implemented as an animated component.

The two skills communicate via the **scenes-prompt format**, which is human-readable and editable — users should review/edit the prompt between the two steps.

## Typical workflow

1. User has a script (narration text, bullet points, or a storyboard).
2. Invoke `script-to-prompt` → produces `scenes-prompt.md`.
3. User reviews and edits `scenes-prompt.md` if needed.
4. Invoke `prompt-to-project` → scaffolds Remotion project + writes scene components.
5. `cd <project>` and run `npx remotion studio` to preview.

## What this skill does NOT do

- It does **not** auto-dispatch the sub-skills. The user (or the orchestrating Codex) invokes them explicitly.
- It does **not** integrate voiceover, subtitles, or Tailwind.

## References

- Install and full usage: see the plugin `README.md`.
- Worked example: `examples/example-script.md` + `examples/example-scenes-prompt.md`.
- Domain knowledge for Remotion: the `remotion-best-practices` skill (installed separately).
````

- [ ] **Step 2: Verify frontmatter**

Run: `head -5 skills/remotion-scenes/SKILL.md`
Expected: starts with `---`, contains `name: remotion-scenes`, contains `description:` line.

- [ ] **Step 3: Commit**

```bash
git add skills/remotion-scenes/SKILL.md
git commit -m "feat: add parent index skill"
```

---

## Task 4: Scenes prompt template

**Files:**
- Create: `skills/script-to-prompt/templates/scenes-prompt-template.md`

- [ ] **Step 1: Write the template**

Exact content:
````markdown
# Video: <TITLE>
Dimensions: 1920x1080
FPS: 30
Background: #0a0a0a

<!--
Duration format: every scene MUST include BOTH seconds and frames: "3s (90 frames)" at 30fps.
Transition-in / Transition-out allowed: fade | slide-left | slide-right | slide-up | slide-down | none.
Animation frame ranges are relative to the scene (scene-local frames), not global.
Assets prefixed with "./" are user-provided local files; URLs are remote.
-->

## Scene 1: <SCENE_NAME>
Duration: 3s (90 frames)
Transition-in: none
Transition-out: fade

### Visuals
<One short paragraph: what appears on screen, layout, colors, typography.>

### Animations
- <element>: <what happens> at <start>-<end>f, <easing/spring>
- <element>: ...

### Assets
- none
- image: ./assets/foo.png
- image: https://example.com/foo.png
<!-- Use one or more real asset bullets above; do not keep all three. -->

## Scene 2: <SCENE_NAME>
Duration: Xs (Nf frames)
Transition-in: fade
Transition-out: none

### Visuals
...

### Animations
- <element>: <action> at <start>-<end>f, <action> at <start>-<end>f

### Assets
- none
````

- [ ] **Step 2: Commit**

```bash
git add skills/script-to-prompt/templates/scenes-prompt-template.md
git commit -m "feat: add scenes prompt template"
```

---

## Task 5: Sub-skill 1 — script-to-prompt

**Files:**
- Create: `skills/script-to-prompt/SKILL.md`

- [ ] **Step 1: Write `skills/script-to-prompt/SKILL.md`**

Exact content:
````markdown
---
name: script-to-prompt
description: Use when the user provides a video script (narrative prose OR storyboard) as text or a file path and wants to generate a Remotion "scenes prompt" Markdown file. Part of the remotion-scenes plugin. Does NOT scaffold a Remotion project (that is the prompt-to-project sub-skill).
---

# script-to-prompt

Convert a video script into a structured Markdown scenes prompt that the `prompt-to-project` sub-skill can consume.

## When to use

- User pastes a script or gives a file path (`.txt` / `.md`) and asks for a Remotion prompt / scenes prompt / storyboard in the format this plugin uses.
- Do NOT use this skill if the user asks to directly build the Remotion project — that is `prompt-to-project`.

## Inputs

1. **Script content** — required. Either pasted in chat, or a file path. If a path is given, read the file first.
2. **Optional parameters** — use defaults unless the user has already specified overrides, or the task clearly requires clarification:
   - Total duration (default: estimate 30–60s based on script length; ~1s per 3–4 spoken words).
   - Dimensions (default: `1920x1080`).
   - FPS (default: `30`).
   - Visual style (default: "modern minimal"). Examples: minimal, tech, playful, corporate.
   - Output path (default: `./scenes-prompt.md`).

If you do need to ask about overrides, ask all of them together in one message, not serially.

## Process

### Step 1: Classify the input

- **Storyboard**: contains explicit scene markers (`Scene 1`, `镜头 1`, `## 1.`, numbered list of shots). → Preserve the segmentation 1:1.
- **Narrative**: continuous prose. → Semantically segment into **3–8 scenes** along topic/beat boundaries.
- **Mixed**: treat as storyboard.

State which classification you chose and why, in one sentence, before generating the prompt.

### Step 2: Plan scenes

For each scene, decide:
- A short scene name (2–4 words).
- Duration in seconds, then convert: `frames = seconds * fps`.
- Key elements on screen (title text, bullets, image, icon, chart).
- 2–4 animations per scene: use verbs from this vocabulary: `fade-in`, `fade-out`, `slide-in from {left|right|top|bottom}`, `slide-out to ...`, `scale X→Y via spring`, `typewriter`, `stagger-in`.
- Transitions between scenes: default `fade` both sides for adjacent scenes, `none` for scene 1's `Transition-in` and last scene's `Transition-out`.
- If the user supplied a total duration, allocate scene durations so the sum matches that target as closely as possible after frame rounding.
- Use the chosen visual style to shape `### Visuals` descriptions consistently across scenes (layout, palette, typography, and motion tone).

Total frames must equal the sum of scene frames. Verify arithmetic.

### Step 3: Emit the Markdown

Use the template at `templates/scenes-prompt-template.md` as the structural skeleton. Rules:

- Header block: `# Video: <title>`, `Dimensions:`, `FPS:`, `Background:` on separate lines.
- Every scene MUST include: `## Scene N: <name>`, `Duration: Ns (Nf frames)`, `Transition-in:`, `Transition-out:`, and the three subsections `### Visuals`, `### Animations`, `### Assets`.
- Animation bullets MUST use `element: action, action` format, and every animation clause MUST include an explicit frame range (`0-15f`) — scene-local frames, NOT global.
- If no asset is needed: write `- none` (literal) under Assets.
- Local assets MUST be prefixed with `./assets/` (e.g. `./assets/logo.png`) so the downstream skill can map them into `public/assets/` without ambiguity.

### Step 4: Write output

- Default path: `./scenes-prompt.md` (overwrite if exists — warn the user first).
- Also print the full content in the chat for review.

### Step 5: Summarize for the user

Print:
- Scene count and total duration (seconds + frames).
- A checklist of any user-provided assets (local `./assets/...` paths). If none: say "No user assets required."
- Next step: "Invoke `prompt-to-project` with this file to scaffold the Remotion project."

## Constraints

- No voiceover, no subtitle/caption descriptions — this plugin intentionally excludes both.
- Do not invent remote asset URLs. If the script needs an image you don't have, use a local `./assets/...` placeholder and list it in the user-provided checklist.
- Do not produce Tailwind class names — downstream project uses plain CSS / inline styles.

## Output checklist (verify before finishing)

- [ ] All scenes have `Duration: Ns (Nf frames)` with correct frame math (frames = seconds * fps).
- [ ] Every `### Animations` bullet starts with `element:`.
- [ ] Every animation clause has a frame range.
- [ ] Every `### Assets` subsection either lists assets or says `- none`.
- [ ] Total duration announced to the user matches sum of scene durations.
````

- [ ] **Step 2: Verify frontmatter**

Run: `head -5 skills/script-to-prompt/SKILL.md`
Expected: `name: script-to-prompt`, description mentions "scenes prompt".

- [ ] **Step 3: Commit**

```bash
git add skills/script-to-prompt/
git commit -m "feat: add script-to-prompt sub-skill"
```

---

## Task 6: Animation patterns reference for sub-skill 2

**Files:**
- Create: `skills/prompt-to-project/references/animation-patterns.md`

- [ ] **Step 1: Write the reference**

Exact content:
````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add skills/prompt-to-project/references/animation-patterns.md
git commit -m "feat: add animation patterns reference"
```

---

## Task 7: Sub-skill 2 — prompt-to-project

**Files:**
- Create: `skills/prompt-to-project/SKILL.md`

- [ ] **Step 1: Write `skills/prompt-to-project/SKILL.md`**

Exact content:
````markdown
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
2. **Project name** — optional. If missing, ask the user. Suggest a slug of the video title.

## Process

### Step 1: Load and parse the prompt

Read the prompt file (or use the pasted content). Extract:

- Header: `# Video: <title>`, `Dimensions:` (WxH), `FPS:`, `Background:`.
- Each scene block `## Scene N: <name>` with:
  - `Duration:` — parse the frame count from `Ns (Nf frames)`.
  - `Transition-in:` / `Transition-out:` — one of `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `none`.
  - `### Visuals` body (string).
  - `### Animations` bullets (parse each as `element: clause, clause, ...`, then split into one or more animation clauses such as `{element, verb, direction?, range: [A, B], extras?}`).
  - `### Assets` bullets (`- none` ⇒ empty; `- image: <path-or-url>` ⇒ asset). Treat any other asset type as unsupported.

**Validation — fail fast with a clear message if:**
- Header is missing the `# Video: <title>` line.
- Header is missing any of Dimensions/FPS/Background.
- A scene is missing `Duration` or frame math is inconsistent.
- Any Animation bullet is missing the `element:` prefix.
- Any animation clause in a bullet has no frame range.
- Any asset bullet uses an unsupported type (anything other than `none` or `image:`).
- Any local asset path does not start with `./assets/`.
- The first scene's `Transition-in` is not `none`.
- The last scene's `Transition-out` is not `none`.

### Step 2: Decide scaffold directory

- If a project name was provided: scaffold in `./<project-name>/`.
- Else: ask the user for a project name. Suggest a slug of the video title.
- Do **not** scaffold in place by default. In-place generation is only allowed if the user explicitly requests it and confirms the directory is safe to overwrite.

### Step 3: Run the scaffold

Run from the chosen parent directory:
```bash
npx create-video@latest --yes --blank --no-tailwind <name>
```

If the user explicitly asks for in-place scaffolding, run in a temp sibling directory and move files after generation. Otherwise prefer a named subdirectory because it is simpler and less error-prone.

If `@remotion/transitions` is needed (any validated scene boundary not `none`), install it:
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
- Local `./assets/...` path: ensure `public/assets/` exists; preserve the relative path after `./assets/` and reference it via `staticFile("assets/...")` from `remotion` (for example, `./assets/icons/logo.svg` → `public/assets/icons/logo.svg` → `staticFile("assets/icons/logo.svg")`). If the file doesn't exist yet, render a placeholder colored `<div>` the same size, with a code comment `// TODO: provide <path>` and add the path to a "missing assets" list.

### Step 5: Sanity-check render (optional, recommended)

```bash
cd <project-dir> && npx remotion still Main --scale=0.25 --frame=30 --output=out/frame30.png
```

Report PASS/FAIL. If it fails, surface the error to the user and stop before claiming success.

### Step 6: Summarize

Print:
1. Project directory path.
2. List of files generated.
3. "Missing assets" checklist (paths the user needs to place under `public/assets/`, preserving any subdirectories after `./assets/`).
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
````

- [ ] **Step 2: Verify frontmatter**

Run: `head -5 skills/prompt-to-project/SKILL.md`
Expected: `name: prompt-to-project`.

- [ ] **Step 3: Commit**

```bash
git add skills/prompt-to-project/SKILL.md
git commit -m "feat: add prompt-to-project sub-skill"
```

---

## Task 8: Example script

**Files:**
- Create: `examples/example-script.md`

- [ ] **Step 1: Write the example**

Exact content:
````markdown
# Example Script — "Introducing FluxNote"

FluxNote is a new kind of note-taking app designed for people who think in connections, not folders.

Every note you write is a node. Link two notes together and FluxNote draws the line for you. The more you write, the richer your knowledge graph becomes.

Capture ideas anywhere — our desktop, mobile, and web apps keep everything in sync within seconds. No manual saving, no lost drafts.

FluxNote is free for your first 100 notes. Sign up today and start thinking in graphs.
````

- [ ] **Step 2: Commit**

```bash
git add examples/example-script.md
git commit -m "docs: add example script"
```

---

## Task 9: Example scenes prompt

**Files:**
- Create: `examples/example-scenes-prompt.md`

- [ ] **Step 1: Write the example output**

Exact content:
````markdown
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
````

- [ ] **Step 2: Verify total frames**

Total = 120 + 180 + 150 + 90 = **540 frames** (= 18s at 30fps). Note this in the commit message for reviewer clarity.

- [ ] **Step 3: Commit**

```bash
git add examples/example-scenes-prompt.md
git commit -m "docs: add example scenes prompt (540 frames / 18s)"
```

---

## Task 10: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

Exact content:
````markdown
# remotion-scenes

A Codex plugin that turns a video script into a working [Remotion](https://remotion.dev) project in two steps.

```
script (text or .md)
     │
     ▼  script-to-prompt
scenes-prompt.md  ←── human-editable Markdown contract
     │
     ▼  prompt-to-project
Remotion project + animated scenes
     │
     ▼
npx remotion studio
```

## Install

### A. Plugin marketplace (recommended)

```bash
/plugin marketplace add https://github.com/panic-z/remotion-scenes.git
/plugin install remotion-scenes
```

If you prefer SSH:
```bash
/plugin marketplace add git@github.com:panic-z/remotion-scenes.git
```

### B. Manual

```bash
mkdir -p ~/plugins
git clone https://github.com/panic-z/remotion-scenes.git ~/plugins/remotion-scenes
```

SSH alternative:
```bash
mkdir -p ~/plugins
git clone git@github.com:panic-z/remotion-scenes.git ~/plugins/remotion-scenes
```

Then register the plugin in `~/.agents/plugins/marketplace.json`.

Restart Codex. Verify in a new session that `remotion-scenes`, `script-to-prompt`, and `prompt-to-project` appear in the available skills/plugins list.

## Prerequisites

- **Node.js ≥ 18** (required by `create-video@latest`).
- **npm** or **pnpm**.
- (Recommended) The `remotion-best-practices` skill installed — the `prompt-to-project` sub-skill loads its rules for animation/timing best practices.

## Quick start

1. Put a script in `my-script.md` (or paste it directly).
2. In Codex:
   > "Use script-to-prompt to turn my-script.md into a scenes prompt."

   Review the resulting `scenes-prompt.md`. Edit freely.
3. Then:
   > "Use prompt-to-project with scenes-prompt.md and call the project my-video."
4. Preview:
   ```bash
   cd my-video
   npx remotion studio
   ```

See `examples/example-script.md` → `examples/example-scenes-prompt.md` for a worked sample.

## Sub-skills

### `script-to-prompt`

- **Input:** a script (narrative prose or storyboard), pasted or file path.
- **Output:** `scenes-prompt.md` (path configurable).
- **Parameters:** total duration, dimensions (default 1920x1080), fps (default 30), visual style (default "modern minimal"), output path (default `./scenes-prompt.md`).

### `prompt-to-project`

- **Input:** a `scenes-prompt.md`.
- **Output:** a full Remotion project with `src/Root.tsx`, `src/Main.tsx`, and one `src/scenes/SceneN.tsx` per scene.
- **Scaffolder:** `npx create-video@latest --yes --blank --no-tailwind <name>`.
- **Transitions:** uses `@remotion/transitions` when any scene boundary is not `none`.

### Parent skill `remotion-scenes`

An index-only skill. Lists the two sub-skills and the typical workflow. Does not auto-dispatch.

## Scenes prompt format

```markdown
# Video: <title>
Dimensions: 1920x1080
FPS: 30
Background: #0a0a0a

## Scene 1: <name>
Duration: 3s (90 frames)
Transition-in: none
Transition-out: fade | slide-left | slide-right | slide-up | slide-down

### Visuals
<description of what appears on screen>

### Animations
- element: fade-in at 0-15f, scale 0.9→1.0 via spring at 0-30f

### Assets
- none
- image: ./assets/foo.png
- image: https://example.com/foo.png

## Scene 2: <name>
Duration: 3s (90 frames)
Transition-in: fade | slide-left | slide-right | slide-up | slide-down
Transition-out: none
```

Key rules:
- Frame ranges are **scene-local** (reset at the start of each scene).
- Duration includes both seconds and frames: `Ns (Nf frames)`.
- Animation verbs: `fade-in`, `fade-out`, `slide-in from <dir>`, `slide-out to <dir>`, `scale X→Y via spring`, `typewriter`, `stagger-in`.
- Local asset paths must start with `./assets/` — these are files the user must provide under `public/assets/`, preserving any subdirectories after `./assets/`.
- The first scene must use `Transition-in: none`, and the last scene must use `Transition-out: none`.

## FAQ

**Q: Can I change resolution or fps?**
A: Yes. Edit the `Dimensions:` and `FPS:` lines in `scenes-prompt.md` before running `prompt-to-project`. The generated `Composition` uses those values directly.

**Q: Can I add audio/voiceover or subtitles later?**
A: Yes — this plugin intentionally leaves both out. For voiceover, see `remotion-best-practices/rules/voiceover.md`. For subtitles, see `remotion-best-practices/rules/subtitles.md`.

**Q: What if an asset file is missing?**
A: `prompt-to-project` will generate placeholder colored blocks with `// TODO: provide <path>` and print a missing-assets checklist. Put the files under `public/assets/`, preserving any subdirectories after `./assets/`, and re-run the studio.

**Q: Can I use Tailwind?**
A: Not out of the box. The scaffold uses `--no-tailwind` for config simplicity. Add Tailwind manually per the Remotion docs if needed.

**Q: I want to use pnpm / yarn / bun.**
A: The scaffold is invoked via `npx create-video@latest`. After scaffolding, `cd` into the project and use any package manager you prefer.

## Contributing

Issues and PRs welcome. The plugin is intentionally minimal; feature additions (Tailwind, voiceover, subtitles, multi-composition) should be proposed as issues first.

## License

MIT. See `LICENSE`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with install and usage instructions"
```

---

## Task 11: LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Write MIT LICENSE**

Exact content:
```
MIT License

Copyright (c) 2026 remotion-scenes contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Commit**

```bash
git add LICENSE
git commit -m "docs: add MIT license"
```

---

## Task 12: Structural verification

**Files:** none (verification only)

- [ ] **Step 1: Check all expected files exist**

Run:
```bash
cd /Users/wubaiyu/DEV/side-projects/remotion-scenes && \
  ls .codex-plugin/plugin.json \
     skills/remotion-scenes/SKILL.md \
     skills/script-to-prompt/SKILL.md \
     skills/script-to-prompt/templates/scenes-prompt-template.md \
     skills/prompt-to-project/SKILL.md \
     skills/prompt-to-project/references/animation-patterns.md \
     README.md LICENSE .gitignore \
     examples/example-script.md examples/example-scenes-prompt.md
```

Expected: every path listed, no errors.

- [ ] **Step 2: Validate all SKILL.md frontmatter**

Run:
```bash
for f in skills/*/SKILL.md; do
  echo "=== $f ==="
  head -5 "$f"
done
```

Expected: each file starts with `---`, has a `name:` matching its parent dir (`remotion-scenes`, `script-to-prompt`, `prompt-to-project`), and a non-empty `description:` line.

- [ ] **Step 3: Validate plugin.json**

Run: `node -e "const p=require('./.codex-plugin/plugin.json'); console.log(p.name, p.version); if(p.name!=='remotion-scenes'||!p.version) process.exit(1)"`
Expected: prints `remotion-scenes 0.1.0`, exit 0.

- [ ] **Step 4: Example consistency check**

Verify the example scenes prompt's total frames:
```bash
grep -E "Duration: [0-9]+s \([0-9]+ frames\)" examples/example-scenes-prompt.md
```
Expected: four lines, frame counts 120 + 180 + 150 + 90 = 540.

- [ ] **Step 5: Git status clean**

Run: `git status`
Expected: "nothing to commit, working tree clean".

No commit for this task (verification only).

---

## Task 13: End-to-end dogfood (manual)

**Files:** none — this task produces a throwaway project for validation.

Goal: verify the two skills actually produce a working Remotion project when followed by Codex.

- [ ] **Step 1: In a separate scratch directory, simulate running `prompt-to-project`**

```bash
mkdir -p /tmp/remotion-scenes-dogfood && cd /tmp/remotion-scenes-dogfood && \
  cp /Users/wubaiyu/DEV/side-projects/remotion-scenes/examples/example-scenes-prompt.md ./scenes-prompt.md
```

- [ ] **Step 2: Scaffold with the documented command**

Run:
```bash
cd /tmp/remotion-scenes-dogfood && npx create-video@latest --yes --blank --no-tailwind my-video
```
Expected: a new `my-video/` directory with Remotion scaffolding (package.json, src/, remotion.config.ts).

- [ ] **Step 3: Install transitions (example uses fades)**

```bash
cd /tmp/remotion-scenes-dogfood/my-video && npm install @remotion/transitions
```
Expected: package added, no errors.

- [ ] **Step 4: Sanity-check the scaffold**

Run:
```bash
cd /tmp/remotion-scenes-dogfood/my-video && npx remotion still Main --frame=0 --scale=0.25 --output=out/check.png
```
Expected: PNG produced. (We don't need to render our scenes here — this only verifies the scaffold command itself works on this machine.)

- [ ] **Step 5: Clean up**

```bash
rm -rf /tmp/remotion-scenes-dogfood
```

- [ ] **Step 6: Record result**

If all steps passed, create a final commit on the plan repo:
```bash
cd /Users/wubaiyu/DEV/side-projects/remotion-scenes && \
  git commit --allow-empty -m "chore: verified scaffold command e2e on local machine"
```

If any step fails, DO NOT mark complete — surface the error to the user, update the plan, and retry.

---

## Done criteria

- All 13 tasks complete.
- `git log --oneline` shows a clean history of feature commits.
- A fresh Codex session with this plugin installed can (a) list all three skills and (b) run the example end-to-end.
- README quick-start instructions work verbatim on a fresh machine.
