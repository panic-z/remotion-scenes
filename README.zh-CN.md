# remotion-scenes

[English README](./README.md)

一个 Codex 插件，用两步把视频脚本转换成可运行的 [Remotion](https://remotion.dev) 项目。

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

### 推荐：本地 Codex 插件安装

先把插件克隆到本地 Codex 插件目录：

```bash
mkdir -p ~/plugins
git clone https://github.com/panic-z/remotion-scenes.git ~/plugins/remotion-scenes
```

如果你已经配置了 SSH，也可以用：
```bash
mkdir -p ~/plugins
git clone git@github.com:panic-z/remotion-scenes.git ~/plugins/remotion-scenes
```

然后在 `~/.agents/plugins/marketplace.json` 中注册它：

```json
{
  "name": "local-marketplace",
  "interface": {
    "displayName": "Local plugins"
  },
  "plugins": [
    {
      "name": "remotion-scenes",
      "source": {
        "source": "local",
        "path": "./plugins/remotion-scenes"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Coding"
    }
  ]
}
```

如果 `~/.agents/plugins/marketplace.json` 已经存在，不要覆盖整个文件，只需要把 `remotion-scenes` 这一项追加到 `plugins` 数组中。

Codex 会通过 `~/plugins/remotion-scenes/.codex-plugin/plugin.json` 识别这个插件。验证方式：开启一个新的 Codex 会话，确认 `remotion-scenes`、`script-to-prompt` 和 `prompt-to-project` 出现在可用技能/插件列表中。

## 前置条件

- **Node.js ≥ 18**（`create-video@latest` 需要）
- **npm** 或 **pnpm**
- （推荐）安装 `remotion-best-practices` skill，`prompt-to-project` 会加载其中的动画和时序最佳实践规则

## 快速开始

1. 把脚本写到 `my-script.md` 中，或者直接粘贴给 Codex。
2. 在 Codex 中输入：
   > "Use script-to-prompt to turn my-script.md into a scenes prompt."

   检查生成的 `scenes-prompt.md`，并按需编辑。
3. 然后输入：
   > "Use prompt-to-project with scenes-prompt.md and call the project my-video."
4. 预览：
   ```bash
   cd my-video
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
A: 默认不启用。脚手架固定使用 `--no-tailwind`，这样配置更简单；如果你需要，可以之后按 Remotion 官方文档自行接入。

**Q: 我想用 pnpm / yarn / bun。**  
A: 脚手架阶段固定通过 `npx create-video@latest` 调用。创建完成后，进入项目目录，用你喜欢的包管理器继续即可。

## 贡献

欢迎提 issue 和 PR。这个插件刻意保持精简；如果你想加入 Tailwind、voiceover、subtitles、multi-composition 等能力，建议先通过 issue 讨论。

## 许可证

MIT，见 `LICENSE`。
