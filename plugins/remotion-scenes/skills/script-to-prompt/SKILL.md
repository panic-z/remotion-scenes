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

1. **Script content** — required. Either pasted in chat, or a file path.
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
