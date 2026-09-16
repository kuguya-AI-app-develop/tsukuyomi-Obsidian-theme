# Stylelint compatibility notes

The theme extends `stylelint-config-obsidianmd`; its network-asset, browser-compatibility and other Obsidian review rules remain enabled. Six narrow overrides preserve existing source contracts:

- Generated `/* Source: ... */` section headers do not require another blank line before the source's opening comment.
- Grouped custom properties retain blank lines for palette readability.
- Prefix media ranges remain because the repository checker validates the exact guarded motion queries.
- Descending-specificity reports are disabled for intentional native component state cascades.
- The class pattern permits Obsidian's `HyperMD-header-*` and CodeMirror `cm-dropCursor` / `cm-selectionBackground` names while keeping kebab-case for theme-owned classes.
- Chained simple `:not()` remains because the motion checker intentionally validates those selectors exactly.

`declaration-no-important` and `plugin/no-unsupported-browser-features` stay enabled as warnings. The remaining `!important` declarations are confined to print overrides that must defeat application state styles.
