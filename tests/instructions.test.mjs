import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const parseScenes = (prompt) => {
  const scenes = [];
  const sceneRegex =
    /^## Scene (\d+): (.+)\nDuration: (\d+)s \((\d+) frames\)\nTransition-in: (.+)\nTransition-out: (.+)\n\n### Visuals\n([\s\S]*?)\n\n### Animations\n([\s\S]*?)\n\n### Assets\n([\s\S]*?)(?=\n## Scene |\s*$)/gm;

  for (const match of prompt.matchAll(sceneRegex)) {
    scenes.push({
      index: Number(match[1]),
      name: match[2],
      seconds: Number(match[3]),
      frames: Number(match[4]),
      transitionIn: match[5].trim(),
      transitionOut: match[6].trim(),
      visuals: match[7].trim(),
      animations: match[8]
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      assets: match[9]
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  }

  return scenes;
};

test("README quick start installs dependencies before launching Remotion Studio", () => {
  const readme = read("README.md");
  const quickStartPattern =
    /cd my-video\s+npm (?:install|i)\s+npx remotion studio/s;

  assert.match(readme, quickStartPattern);
});

test("prompt-to-project skill installs project dependencies before follow-up commands", () => {
  const skill = read("skills/prompt-to-project/SKILL.md");

  assert.match(
    skill,
    /cd <project-dir> && npm (?:install|i)\b/,
    "expected an explicit dependency installation step after scaffolding",
  );

  assert.match(
    skill,
    /cd <project-dir>\s+npm (?:install|i)\s+npx remotion studio/s,
    "expected the final next-step commands to install dependencies before studio",
  );
});

test("parent remotion-scenes skill mentions installing dependencies before preview", () => {
  const skill = read("skills/remotion-scenes/SKILL.md");

  assert.match(
    skill,
    /install dependencies, then run `npx remotion studio`/i,
  );
});

test("Claude Code marketplace manifest exists for slash-command installation", () => {
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));

  assert.equal(marketplace.name, "remotion-scenes");
  assert.ok(Array.isArray(marketplace.plugins));
  assert.equal(marketplace.plugins[0]?.name, "remotion-scenes");
});

test("Codex marketplace manifest exists for remote marketplace installation", () => {
  const marketplace = JSON.parse(read(".codex-plugin/marketplace.json"));

  assert.equal(marketplace.name, "remotion-scenes");
  assert.ok(Array.isArray(marketplace.plugins));
  assert.equal(marketplace.plugins[0]?.name, "remotion-scenes");
});

test("README documents Claude Code slash-command installation", () => {
  const readme = read("README.md");

  assert.match(readme, /codex plugin marketplace add \./);
  assert.match(readme, /codex plugin marketplace add \/path\/to\/remotion-scenes/);
  assert.match(readme, /\/plugin marketplace add panic-z\/remotion-scenes/);
  assert.match(readme, /\/plugin install remotion-scenes@remotion-scenes/);
});

test("Chinese README documents Claude Code slash-command installation", () => {
  const readme = read("README.zh-CN.md");

  assert.match(readme, /codex plugin marketplace add \./);
  assert.match(readme, /codex plugin marketplace add \/path\/to\/remotion-scenes/);
  assert.match(readme, /\/plugin marketplace add panic-z\/remotion-scenes/);
  assert.match(readme, /\/plugin install remotion-scenes@remotion-scenes/);
});

test("Codex and Claude manifests keep shared metadata in sync", () => {
  const codex = JSON.parse(read(".codex-plugin/plugin.json"));
  const claude = JSON.parse(read(".claude-plugin/plugin.json"));

  for (const key of [
    "name",
    "version",
    "description",
    "author",
    "homepage",
    "repository",
    "license",
    "keywords",
  ]) {
    assert.deepEqual(
      claude[key],
      codex[key],
      `expected shared field ${key} to match between plugin manifests`,
    );
  }
});

test("Codex marketplace entry stays aligned with the plugin manifest", () => {
  const marketplace = JSON.parse(read(".codex-plugin/marketplace.json"));
  const plugin = JSON.parse(read(".codex-plugin/plugin.json"));
  const entry = marketplace.plugins[0];

  assert.equal(marketplace.name, plugin.name);
  assert.equal(entry.name, plugin.name);
});

test("Claude marketplace entry stays aligned with the plugin manifest", () => {
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
  const entry = marketplace.plugins[0];

  assert.equal(marketplace.name, plugin.name);
  assert.equal(marketplace.owner?.name, "remotion-scenes contributors");
  assert.match(marketplace.metadata?.description ?? "", /Remotion/i);
  assert.equal(entry.name, plugin.name);
  assert.equal(entry.source, "./");
});

test("internal design docs no longer advertise stale install or preview flows", () => {
  const spec = read("docs/superpowers/specs/2026-04-21-remotion-scenes-plugin-design.md");
  const plan = read("docs/superpowers/plans/2026-04-21-remotion-scenes-plugin.md");

  assert.doesNotMatch(spec, /\/plugin marketplace add https:\/\/github\.com\/panic-z\/remotion-scenes\.git/);
  assert.doesNotMatch(plan, /\/plugin marketplace add https:\/\/github\.com\/panic-z\/remotion-scenes\.git/);
  assert.doesNotMatch(plan, /\/plugin marketplace add git@github\.com:panic-z\/remotion-scenes\.git/);
  assert.doesNotMatch(spec, /Instruct user to run `npx remotion studio` for preview\./);
  assert.doesNotMatch(plan, /cd <project> and run `npx remotion studio` to preview\./);
  assert.doesNotMatch(plan, /cd my-video\s+npx remotion studio/s);
  assert.match(plan, /cd my-video\s+npm install\s+npx remotion studio/s);
});

test("example scenes prompt satisfies the documented contract", () => {
  const prompt = read("examples/example-scenes-prompt.md");

  assert.match(prompt, /^# Video: .+/m);
  assert.match(prompt, /^Dimensions: \d+x\d+$/m);
  assert.match(prompt, /^FPS: \d+$/m);
  assert.match(prompt, /^Background: .+$/m);

  const scenes = parseScenes(prompt);
  assert.ok(scenes.length > 0, "expected at least one scene in the example prompt");

  for (const scene of scenes) {
    assert.equal(
      scene.frames,
      scene.seconds * 30,
      `scene ${scene.index} should have consistent second/frame math at 30fps`,
    );
    assert.ok(scene.visuals.length > 0, `scene ${scene.index} should include visuals text`);
    assert.ok(scene.animations.length > 0, `scene ${scene.index} should include animation bullets`);
    assert.ok(scene.assets.length > 0, `scene ${scene.index} should include assets bullets`);

    for (const animation of scene.animations) {
      assert.match(
        animation,
        /^- [^:]+: /,
        `scene ${scene.index} animation bullet should start with element:`,
      );
      assert.match(
        animation,
        /\d+-\d+f/,
        `scene ${scene.index} animation bullet should include a frame range`,
      );
    }

    for (const asset of scene.assets) {
      assert.match(
        asset,
        /^- (none|image: )/,
        `scene ${scene.index} asset bullet should use a supported asset type`,
      );
      if (asset.startsWith("- image: ./")) {
        assert.match(
          asset,
          /^- image: \.\/assets\//,
          `scene ${scene.index} local asset paths must stay under ./assets/`,
        );
      }
    }
  }

  assert.equal(scenes[0]?.transitionIn, "none");
  assert.equal(scenes.at(-1)?.transitionOut, "none");

  for (let i = 0; i < scenes.length - 1; i += 1) {
    assert.equal(
      scenes[i].transitionOut,
      scenes[i + 1].transitionIn,
      `scene boundary ${scenes[i].index}->${scenes[i + 1].index} should use matching transitions`,
    );
  }
});

test("internal docs describe the plugin as dual-target, not Codex-only", () => {
  const spec = read("docs/superpowers/specs/2026-04-21-remotion-scenes-plugin-design.md");
  const plan = read("docs/superpowers/plans/2026-04-21-remotion-scenes-plugin.md");

  assert.doesNotMatch(spec, /^A Codex plugin that turns/m);
  assert.doesNotMatch(spec, /Packaged as a Codex plugin\./);
  assert.doesNotMatch(plan, /\*\*Goal:\*\* Build a Codex plugin/m);
  assert.doesNotMatch(
    plan,
    /\*\*Tech Stack:\*\* Codex plugin manifest \(JSON\), skills/,
  );
  assert.doesNotMatch(plan, /^A Codex plugin that turns/m);
});
