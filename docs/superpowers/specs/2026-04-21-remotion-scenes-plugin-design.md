# Remotion Scenes Plugin — Design Spec

**Date:** 2026-04-21
**Status:** Approved, ready for implementation planning

## Purpose

A Claude Code plugin that turns a video script into a working Remotion project in two steps:

1. **script-to-prompt** — transform a script (narrative or storyboard) into a structured "Remotion scenes prompt" in Markdown.
2. **prompt-to-project** — consume that prompt to scaffold a Remotion project from scratch and implement the animations.

The two sub-skills are intentionally decoupled so that the Markdown "scenes prompt" is a human-readable, editable contract between them. Users can review/modify the prompt before building.

## Non-Goals

- No voiceover / TTS integration.
- No subtitles / caption track.
- No TailwindCSS (avoids config drift vs. the blank scaffold).
- No automated test harness inside the plugin (validation via examples).

## Distribution

- Packaged as a Claude Code Plugin.
- Installed via `/plugin marketplace add <git-url>` + `/plugin install remotion-scenes`, or manual clone into `~/.claude/plugins/`.
- Parent skill is **index-only** — it documents the two sub-skills and the typical workflow; it does **not** auto-dispatch.

## Repository Layout

```
remotion-scenes-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── remotion-scenes/          # parent skill (index)
│   │   └── SKILL.md
│   ├── script-to-prompt/         # sub-skill 1
│   │   ├── SKILL.md
│   │   └── templates/
│   │       └── scenes-prompt-template.md
│   └── prompt-to-project/        # sub-skill 2
│       ├── SKILL.md
│       └── references/
│           └── animation-patterns.md
├── README.md
├── examples/
│   ├── example-script.md
│   └── example-scenes-prompt.md
└── LICENSE
```

## Contract: Scenes Prompt Format

The Markdown format exchanged between the two sub-skills:

```markdown
# Video: <title>
Dimensions: 1920x1080
FPS: 30
Background: #0a0a0a

## Scene 1: <scene-name>
Duration: 3s (90 frames)
Transition-in: fade | slide-left | none
Transition-out: fade | slide-right | none

### Visuals
<Description of elements on screen and layout>

### Animations
- elementA: fade-in at 0-15f, then scale 0.8→1.0 via spring
- elementB: slide-in from right at 10-25f

### Assets
- image: ./assets/logo.png          # user-provided
- image: https://example.com/x.png  # remote

## Scene 2: ...
```

**Rules:**
- `Duration` must include both seconds and frames (`Ns (Nf frames)`) to avoid miscalculation.
- Animations are natural-language but must include explicit frame ranges (`0-15f`).
- `Assets` lists both remote URLs and local paths. Local paths imply user needs to provide the file.
- Default dimensions 1920x1080 @ 30fps; user may override per video.

## Sub-Skill 1: `script-to-prompt`

**When to use:** user supplies a script (pasted text or file path) and asks to generate a Remotion scenes prompt.

**Inputs:**
- Script content: pasted text OR file path (`.txt` / `.md`). Both supported.
- Optional parameters: total duration, dimensions, FPS, visual style.

**Behavior:**
1. Detect input type:
   - **Storyboard** (already segmented into Scene/镜头): preserve structure, fill in animation/timing details.
   - **Narrative** (continuous prose): semantically split into 3–8 scenes.
2. If parameters missing, ask for:
   - Total duration (default: AI estimates 30–60s based on content density).
   - Dimensions/FPS (default: 1920x1080 @ 30fps).
   - Visual style (default: "modern minimal").
3. Generate Markdown conforming to the Scenes Prompt Format.
4. Write output to `./scenes-prompt.md` (override path on request). Also show in chat.
5. Append a checklist of user-provided assets (if any).
6. Tell the user the next step: invoke `prompt-to-project`.

## Sub-Skill 2: `prompt-to-project`

**When to use:** user supplies a scenes-prompt (file path or pasted) and asks to build the Remotion project.

**Inputs:**
- Scenes prompt (Markdown).
- Optional project name.

**Behavior:**
1. Parse prompt. Validate `Dimensions`, `FPS`, at least one `## Scene` block. Fail fast with a clear error if malformed.
2. Determine scaffold directory:
   - Empty CWD → scaffold in place.
   - Non-empty CWD that is not already a Remotion project → ask for a subdirectory name.
3. Scaffold via remotion-best-practices:
   ```bash
   npx create-video@latest --yes --blank --no-tailwind <name>
   ```
4. Generate source files:
   - `src/Root.tsx` — register one Composition; `durationInFrames` = sum of all scene frames; width/height/fps from prompt.
   - `src/Main.tsx` — top-level component using `<Series>` (or `<Sequence>`) to chain scenes.
   - `src/scenes/SceneN.tsx` — one file per scene.
   - `src/transitions.ts` — if `Transition-in/out` is used, wire via `@remotion/transitions`.
5. Animation implementation rules:
   - Use `interpolate` + `spring` per `skills/remotion-best-practices/rules/animations.md` and `timing.md`.
   - Follow sequencing patterns from `rules/sequencing.md`.
   - Text animations per `rules/text-animations.md`.
6. Assets handling:
   - Remote URL → `<Img src={url}>`.
   - Local path → create `public/assets/`, emit a placeholder colored block with a `TODO` comment referencing the filename.
   - Summarize missing assets at the end.
7. Post-generation:
   - Instruct user to run `npx remotion studio` for preview.
   - Optionally run `npx remotion still --scale=0.25 --frame=30` as a sanity check.
   - Print summary: files generated, missing assets, next commands.

**Constraints:**
- No Tailwind (matches scaffold flag).
- No voiceover, no subtitles.
- Sub-skill's `SKILL.md` must reference `remotion-best-practices` rules so Claude loads domain knowledge on demand.

## Parent Skill: `remotion-scenes`

Index-only skill. `SKILL.md` contents:
- One-line purpose.
- Brief description of each sub-skill and when to use.
- Typical workflow:
  1. Have a script.
  2. Invoke `script-to-prompt` → review `scenes-prompt.md`.
  3. Invoke `prompt-to-project` → scaffold + animate.
  4. `npx remotion studio` to preview.
- Pointers to README and `examples/`.
- Explicitly: does **not** auto-dispatch sub-skills.

## README.md Structure

1. Intro — one-liner.
2. Install:
   - **A (recommended):** `/plugin marketplace add <git-url>` → `/plugin install remotion-scenes`.
   - **B (manual):** clone into `~/.claude/plugins/` and enable in `~/.claude/settings.json`.
3. Prerequisites — Node.js ≥ 18, npm or pnpm.
4. Quick start — 3-step walkthrough with an example script.
5. Sub-skills reference — trigger, inputs, outputs, parameters.
6. Scenes Prompt format spec (copy of the Contract section).
7. Examples — pointer to `examples/`.
8. FAQ — change resolution, add audio/subtitles later, missing assets.
9. Contributing / License.

## Examples

- `examples/example-script.md` — a ~150-word product-intro narrative script.
- `examples/example-scenes-prompt.md` — the expected scenes prompt output for that script (3–5 scenes, ~30s total).

## Defaults & Metadata

- Plugin name: `remotion-scenes`
- Version: `0.1.0`
- License: MIT
- No automated tests; examples serve as validation.

## Open Questions / Deferred

None blocking. Future iterations may add: voiceover integration, subtitle track, Tailwind support, multi-composition projects, a visual preview companion.
