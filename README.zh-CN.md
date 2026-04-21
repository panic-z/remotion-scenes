# remotion-scenes

[English README](./README.md)

一个同时支持 Codex 和 Claude Code 的插件，用两步把视频脚本转换成可运行的 [Remotion](https://remotion.dev) 项目。

```
script（文本或 .md）
     │
     ▼  script-to-prompt
scenes-prompt.md  ←── 可人工编辑的 Markdown 约定文件
     │
     ▼  prompt-to-project
Remotion 项目 + 已实现动画的场景
     │
     ▼
npx remotion studio
```

## 安装

这个仓库只需要克隆一次，然后按你使用的工具进行注册即可。仓库同时提供两个 manifest：

- Codex 插件：`plugins/remotion-scenes/.codex-plugin/plugin.json`
- Codex marketplace：`.agents/plugins/marketplace.json`
- Claude Code：`.claude-plugin/plugin.json`
- Claude Code marketplace：`.claude-plugin/marketplace.json`

### Codex

在仓库根目录里，当前已验证可用的最快安装方式是：

```bash
codex plugin marketplace add .
```

如果你当前不在仓库根目录，也可以直接传你本机 checkout 的绝对路径：

```bash
codex plugin marketplace add /absolute/path/to/remotion-scenes
```

等包含 `.agents/plugins/marketplace.json` 的版本发布到 GitHub 后，下面这个 shorthand 也应该能工作：

```bash
codex plugin marketplace add panic-z/remotion-scenes
```

Codex 会把这个仓库注册成 marketplace。开启一个新的会话后，`remotion-scenes`、`script-to-prompt` 和 `prompt-to-project` 就会可用。

如果你的 Codex 版本只注册了 marketplace，但没有真正加载这些 skills，可以直接安装到 `~/.codex/skills`：

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo panic-z/remotion-scenes \
  --path skills/remotion-scenes skills/script-to-prompt skills/prompt-to-project
```

然后重新开启一个 Codex 会话，并用下面的命令验证：

```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  "List the exact available skill names matching remotion-scenes, script-to-prompt, and prompt-to-project if they are loaded in this fresh session. If none are loaded, say none."
```

预期输出应包含：

- `remotion-scenes`
- `script-to-prompt`
- `prompt-to-project`

### Claude Code

在 Claude Code 里目前最短的安装方式是：

```text
/plugin marketplace add panic-z/remotion-scenes
/plugin install remotion-scenes@remotion-scenes
/reload-plugins
```

之所以可以这样装，是因为仓库现在包含了 Claude Code marketplace manifest：`.claude-plugin/marketplace.json`。

如果你更想走本地 manifest 注册方式，也可以复用同一个 checkout，并在你的本地 Claude Code 插件注册流程中指向：

```text
~/plugins/remotion-scenes/.claude-plugin/plugin.json
```

如果你的 Claude Code 环境已经支持本地插件目录，就不需要再额外克隆第二份仓库。验证方式：开启一个新的 Claude Code 会话，确认 `remotion-scenes`、`script-to-prompt` 和 `prompt-to-project` 可用。

## 前置条件

- **Node.js ≥ 18**（`create-video@latest` 需要）
- **npm** 或 **pnpm**
- （推荐）安装 `remotion-best-practices` skill，`prompt-to-project` 会加载其中的动画和时序最佳实践规则

## 快速开始

1. 把脚本写到 `my-script.md` 中，或者直接粘贴给 Codex。
2. 在 Codex 或 Claude Code 中输入：
   > "Use script-to-prompt to turn my-script.md into a scenes prompt."

   检查生成的 `scenes-prompt.md`，并按需编辑。
3. 然后输入：
   > "Use prompt-to-project with scenes-prompt.md and call the project my-video."
4. 预览：
   ```bash
   cd my-video
   npm install
   npx remotion studio
   ```

完整示例可参考 `examples/example-script.md` → `examples/example-scenes-prompt.md`。

## 子技能

### `script-to-prompt`

- **输入：** 一个脚本（连续叙述文本或 storyboard），可以直接粘贴，也可以给文件路径
- **输出：** `scenes-prompt.md`（路径可配置）
- **参数：** 总时长、尺寸（默认 1920x1080）、fps（默认 30）、视觉风格（默认 `"modern minimal"`）、输出路径（默认 `./scenes-prompt.md`）

### `prompt-to-project`

- **输入：** 一个 `scenes-prompt.md`
- **输出：** 一个完整的 Remotion 项目，包含 `src/Root.tsx`、`src/Main.tsx`，以及每个场景对应的 `src/scenes/SceneN.tsx`
- **脚手架命令：** `npx create-video@latest --yes --blank --no-tailwind <name>`
- **转场：** 当场景边界不是 `none` 时，会使用 `@remotion/transitions`

### 父技能 `remotion-scenes`

这是一个索引型 skill。它只负责列出两个子技能及典型工作流，不会自动分发执行。

## Scenes Prompt 格式

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

关键规则：
- 帧范围是 **scene-local** 的，也就是每个场景开始时重新计数
- 时长必须同时包含秒和帧：`Ns (Nf frames)`
- 动画 bullet 使用 `element: clause, clause` 格式，而且每个 clause 都必须有自己的帧范围
- 动画动词包括：`fade-in`、`fade-out`、`slide-in from <dir>`、`slide-out to <dir>`、`scale X→Y via spring`、`typewriter`、`stagger-in`
- 相邻场景边界必须一致：`Scene N` 的 `Transition-out` 必须和 `Scene N+1` 的 `Transition-in` 相同
- 本地资源路径必须以 `./assets/` 开头，表示这些文件需要由用户提供，并最终放到 `public/assets/` 下，同时保留 `./assets/` 之后的子目录结构
- 第一场必须使用 `Transition-in: none`，最后一场必须使用 `Transition-out: none`

## FAQ

**Q: 可以修改分辨率或 fps 吗？**  
A: 可以。在运行 `prompt-to-project` 之前，先编辑 `scenes-prompt.md` 里的 `Dimensions:` 和 `FPS:`。生成出来的 `Composition` 会直接使用这些值。

**Q: 之后可以自己加音频、配音或字幕吗？**  
A: 可以。这个插件只是刻意不把它们纳入默认流程。配音可参考 `remotion-best-practices/rules/voiceover.md`，字幕可参考 `remotion-best-practices/rules/subtitles.md`。

**Q: 如果资源文件缺失怎么办？**  
A: `prompt-to-project` 会生成占位色块，并加上 `// TODO: provide <path>` 注释，同时输出一份缺失资源清单。你把文件放到 `public/assets/` 下，并保留 `./assets/` 之后的子目录结构后，再重新运行 studio 即可。

**Q: 可以用 Tailwind 吗？**  
A: 默认不启用。这个工作流仍然会传 `--no-tailwind`，但当前的 `create-video@latest` 模板可能依然带上闲置的 Tailwind 依赖。生成出来的场景代码应继续使用普通 CSS / inline styles；如果你确实需要 Tailwind，再按 Remotion 官方文档手动接入。

**Q: 我想用 pnpm / yarn / bun。**  
A: 脚手架阶段固定通过 `npx create-video@latest` 调用。创建完成后，先进入项目目录并用你喜欢的包管理器安装依赖（如 `npm install`、`pnpm install`），再继续运行 studio 或 render 命令。

## 贡献

欢迎提 issue 和 PR。这个插件刻意保持精简；如果你想加入 Tailwind、voiceover、subtitles、multi-composition 等能力，建议先通过 issue 讨论。

## 许可证

MIT，见 `LICENSE`。
