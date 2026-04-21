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
