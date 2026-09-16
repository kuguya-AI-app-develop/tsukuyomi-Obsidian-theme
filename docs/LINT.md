# Stylelint compatibility notes

The theme extends `stylelint-config-obsidianmd`; its network-asset, browser-compatibility and other Obsidian review rules remain enabled. Six narrow overrides preserve existing source contracts:

- Generated `/* Source: ... */` section headers do not require another blank line before the source's opening comment.
- Grouped custom properties retain blank lines for palette readability.
- Prefix media ranges remain because the repository checker validates the exact guarded motion queries.
- Descending-specificity reports are disabled for intentional native component state cascades.
- The class pattern permits Obsidian's `HyperMD-header-*` and CodeMirror `cm-dropCursor` / `cm-selectionBackground` names while keeping kebab-case for theme-owned classes.
- Chained simple `:not()` remains because the motion checker intentionally validates those selectors exactly.

`declaration-no-important` and `plugin/no-unsupported-browser-features` remain enabled as warnings. Version 1.0.3 handles the previous 16 diagnostics as follows:

| Previous diagnostic | Change |
| --- | --- |
| 11 print `!important` declarations | Use scoped print selectors and Obsidian's native variables instead |
| 3 link-decoration declarations | Use native link variables and a dashed editor border for unresolved links |
| 2 print-fragmentation declarations | Retain `break-after: avoid` and `break-inside: avoid`, each with a single `stylelint-disable-next-line plugin/no-unsupported-browser-features` comment |

These are lint diagnostics, not evidence that 16 rendering bugs existed or have all been fixed. The two comments suppress only their following print declaration; the browser-compatibility rule remains active elsewhere.

## Why the two print exceptions remain

[doiuse's multicolumn detector](https://github.com/anandthakker/doiuse/blob/master/data/features/multicolumn.js) groups `break-before`, `break-after`, and `break-inside` with column properties without distinguishing their use in print. Our two declarations occur inside `@media print`, where they control page fragmentation as described by [CSS Fragmentation Level 3](https://www.w3.org/TR/css-break-3/).

[Chrome 108 introduced printing support for the `avoid` value](https://developer.chrome.com/blog/chrome-108-beta) on these break properties. The locally inspected macOS Obsidian 1.13.7 runtime uses Chrome 128. This supports retaining the print rules and correcting this classification locally; it does not establish compatibility for every installer or platform.

Actual PDF regression results belong in [VALIDATION.md](VALIDATION.md). Local lint configuration and these targeted exceptions do not establish that a new release has passed official review; review and client-directory status are recorded in [PUBLISHING.md](PUBLISHING.md).

## Official 1.0.3 result

The released 1.0.3 scan completed with no errors and **2 warnings**, down from 16. The service still reports the two print-fragmentation declarations despite their inline exceptions. The local zero-warning check therefore differs from the server result; ignoring the comments locally reproduces exactly those two warnings. Keep the standard page-break protections: native PDF comparison preserved all six pages and all text. See the [official scan record](review-v1.0.3.txt).
