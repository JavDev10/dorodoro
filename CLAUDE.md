# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install   # Install dependencies (requires onlyBuiltDependencies config for electron)
pnpm start     # Run the Electron app
```

## Architecture

Single-file SPA inside Electron. All UI lives in `renderer/index.html` — no build step, no bundler.

**`main.js`** — Electron entry point. Creates a 500×500 frameless transparent `BrowserWindow` and loads `renderer/index.html`. `contextIsolation: false`, `nodeIntegration: false`.

**`renderer/index.html`** — Contains everything: HTML for all 4 views, Tailwind CDN config, CSS, and all JavaScript inline.

### View System
Four `<div class="view" id="view-{name}">` blocks (home, focus, break, settings). CSS: `.view { display: none }` / `.view.active { display: flex }`. `showView(name)` switches between them and updates `state.view`.

### State
```js
const state = {
  focusMin, breakMin, cycles, currentCycle,
  view, prevView, lang,
  timeLeft, totalTime, isPaused,
  wasRunningBeforeSettings, timer
}
```

### Theming
`THEMES` object has 4 keys: `noqui`, `chloe`, `max`, `black`. `applyTheme(name)` injects CSS with `!important` overrides into `<style id="theme-style">` and directly updates SVG stroke attributes. Theme buttons must have `data-theme` matching these keys exactly.

### Internationalization
`STRINGS` object with `es` / `en` sub-objects. Translatable elements carry `data-i18n="key"` attributes. For elements mixing icons + text, wrap only the text portion in a `<span data-i18n="key">`. `applyLang(lang)` iterates all `[data-i18n]` elements. Language defaults to `'es'`.

### Timer / Flow
Home → Focus (N cycles) → Break → Home. SVG progress rings use `id="focus-ring"` / `id="break-ring"` (filled circle) and `id="focus-track"` / `id="break-track"` (background). Ring circumference ≈ 270.18 (r=43). Progress is set via `stroke-dashoffset`.

### Drag
Header area uses `-webkit-app-region: drag` via `.app-drag` class. Interactive elements inside use `.app-no-drag`.

## Key Constraints

- **pnpm config**: `"pnpm": { "onlyBuiltDependencies": ["electron"] }` in `package.json` is required — pnpm v10 blocks postinstall scripts by default and this allows electron's binary download.
- **Tailwind CDN**: Runtime CSS variable injection doesn't work reliably; use `!important` CSS overrides in `<style id="theme-style">` for dynamic theming instead.
- **Window size**: Fixed 500×500, non-resizable. All views use `w-[500px] h-[500px]`.
