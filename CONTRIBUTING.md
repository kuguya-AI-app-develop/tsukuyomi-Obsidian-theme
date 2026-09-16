# Contributing to Tsukuyomi

Bug reports, documentation improvements, and focused theme changes are welcome. For installation and settings, see the [README](README.md) or [中文说明](README.zh-CN.md).

## Report an issue

Open an [issue](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/issues) with:

- Your Obsidian version, operating system, and Tsukuyomi version.
- Dark or light mode, relevant Style Settings values, and any custom CSS snippets or plugins involved.
- Minimal reproduction steps, the expected result, and what actually happened.
- A screenshot or small example note when useful, including the affected view: Reading, Live Preview, Source, or an empty pane.

Redact private note content, account details, and sensitive paths from screenshots and logs. Use a small example instead of uploading your vault. For feature requests, describe the use case and how the change would preserve readability.

## Make a change

Fork the repository and create a branch for your change. Use **Node.js 22.9.0 or later**.

Edit CSS in `src/`, not the generated root `theme.css` or files under `dist/Tsukuyomi/`. Keep changes focused and preserve existing reading, static-motion, and small-pane fallbacks.

For theme or build changes, run:

```sh
npm ci
npm test
npm run lint
npm run lab
```

`npm test` rebuilds the theme and runs the repository checks. Stylelint uses the official Obsidian configuration with the compatibility adjustments documented in [LINT.md](docs/LINT.md). Local checks do not replace Obsidian directory review.

`npm run lab` builds and installs only into `lab/Tsukuyomi Lab/`. Open that experimental vault in Obsidian for visual checks; use it instead of your primary vault. Keep personal notes and local appearance changes out of the pull request.

Only when changing the corresponding artwork or animation, regenerate its SVG assets before running the checks:

```sh
node scripts/generate-fish.mjs
node scripts/generate-mascots.mjs
```

Run the fish generator for fish changes, and the mascot generator for companion changes, including `render-mendako.mjs` and `render-fox.mjs`. The build rejects stale generated artwork. Regenerate distribution files through the build rather than editing them by hand.

## Open a pull request

Explain the problem and the behavior before and after your change. Link any related issue. For visual changes, include screenshots from the lab vault and describe the views and modes checked.

List the commands you actually ran and their results, along with the Obsidian version and operating system used for manual checks. State what remains untested; checks on one platform do not establish support for every platform. See [VALIDATION.md](docs/VALIDATION.md) for the project's existing verification limits.

## Code and artwork rights

Only contribute work you have the right to share. The [MIT License](LICENSE) applies to software contributions the maintainer can license; it does not grant rights to the original work's characters, trademarks, or other third-party material.

Read and follow [NOTICE.md](NOTICE.md) before changing or adding artwork, drawing data, or embedded assets. Keep source attribution clear. Redrawing a character as SVG does not remove the original rights holder's conditions. Theme assets must remain self-contained, without runtime scripts or remote resources.
