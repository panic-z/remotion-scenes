# remotion-scenes

A Claude Code plugin that turns a video script into a working [Remotion](https://remotion.dev) project in two steps.

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

```
/plugin marketplace add <git-url-of-this-repo>
/plugin install remotion-scenes
```

### B. Manual

```bash
git clone <git-url> ~/.claude/plugins/remotion-scenes
```

Then enable the plugin in `~/.claude/settings.json`:
```json
{
  "plugins": {
    "remotion-scenes": { "enabled": true }
  }
}
```

Restart Claude Code. Verify: in a new session, ask "list available skills" and confirm `remotion-scenes`, `script-to-prompt`, and `prompt-to-project` appear.

## Prerequisites

- **Node.js ≥ 18** (required by `create-video@latest`).
- **npm** or **pnpm**.
- (Recommended) The `remotion-best-practices` skill installed — the `prompt-to-project` sub-skill loads its rules for animation/timing best practices.

## Quick start

1. Put a script in `my-script.md` (or paste it directly).
2. In Claude Code:
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
- **Parameters:** total duration, dimensions (default 1920x1080), fps (default 30), visual style (default "modern minimal").

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
Transition-in: fade | slide-left | slide-right | slide-up | slide-down | none
Transition-out: fade | slide-left | slide-right | slide-up | slide-down | none

### Visuals
<description of what appears on screen>

### Animations
- element: fade-in at 0-15f
- element: scale 0.9→1.0 via spring at 0-30f

### Assets
- none | image: ./assets/foo.png | image: https://...
```

Key rules:
- Frame ranges are **scene-local** (reset at the start of each scene).
- Duration includes both seconds and frames: `Ns (Nf frames)`.
- Animation verbs: `fade-in`, `fade-out`, `slide-in from <dir>`, `slide-out to <dir>`, `scale X→Y via spring`, `typewriter`, `stagger-in`.
- Local asset paths start with `./` — these are files the user must provide in `public/assets/`.

## FAQ

**Q: Can I change resolution or fps?**
A: Yes. Edit the `Dimensions:` and `FPS:` lines in `scenes-prompt.md` before running `prompt-to-project`. The generated `Composition` uses those values directly.

**Q: Can I add audio/voiceover or subtitles later?**
A: Yes — this plugin intentionally leaves both out. For voiceover, see `remotion-best-practices/rules/voiceover.md`. For subtitles, see `remotion-best-practices/rules/subtitles.md`.

**Q: What if an asset file is missing?**
A: `prompt-to-project` will generate placeholder colored blocks with `// TODO: provide <path>` and print a missing-assets checklist. Drop the files into `public/assets/` and re-run the studio.

**Q: Can I use Tailwind?**
A: Not out of the box. The scaffold uses `--no-tailwind` for config simplicity. Add Tailwind manually per the Remotion docs if needed.

**Q: I want to use pnpm / yarn / bun.**
A: The scaffold is invoked via `npx create-video@latest`. After scaffolding, `cd` into the project and use any package manager you prefer.

## Contributing

Issues and PRs welcome. The plugin is intentionally minimal; feature additions (Tailwind, voiceover, subtitles, multi-composition) should be proposed as issues first.

## License

MIT. See `LICENSE`.
