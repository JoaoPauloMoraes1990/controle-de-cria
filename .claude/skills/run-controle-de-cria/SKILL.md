---
name: run-controle-de-cria
description: Build, run, and drive the Controle de Cria web app (Vite + React PWA). Use when asked to start controle-de-cria, run its dev server, run its tests, build it, take a screenshot of its UI, or interact with the running app (fill forms, click buttons, check for console errors).
---

Controle de Cria is a Vite + React + TypeScript PWA (no backend — all data
lives in IndexedDB in the browser). There is no `chromium-cli` in this
environment, so it's driven via a small Playwright REPL driver at
`.claude/skills/run-controle-de-cria/driver.mjs`: start the Vite dev server,
then pipe commands to the driver over stdin.

All paths below are relative to the repo root (this is a single-project
repo — the unit is the whole repo).

## Prerequisites

Node.js and npm (already required by the project itself). Playwright and its
Chromium browser, both used only for driving/testing, not shipped in the app:

```bash
npm install -D playwright   # already in devDependencies — only needed on a fresh clone if node_modules was wiped
npx playwright install chromium
```

The browser binary is cached per-user (`~/AppData/Local/ms-playwright` on
Windows, `~/.cache/ms-playwright` on Linux/Mac), not per-project — on a
machine that already ran Playwright before, `install chromium` is a fast
no-op.

## Setup

```bash
npm install
```

## Build

```bash
npm run build   # tsc -b && vite build → static output in dist/
```

## Run (agent path)

1. Start the dev server in the background and wait for it to actually serve:

```bash
npm run dev > /tmp/vite-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

2. Pipe commands to the driver, one per line, via a heredoc:

```bash
node .claude/skills/run-controle-de-cria/driver.mjs <<'EOF'
nav http://localhost:5173/#/
wait 900
screenshot inicio
fill input[placeholder="Buscar animal pelo número"] :: 999999
wait 400
screenshot busca-nao-encontrado
console --errors
quit
EOF
```

3. Stop the dev server when done (find the process on port 5173 and kill it):

```bash
# Windows / PowerShell:
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }"
# Linux/Mac:
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```

Screenshots land in `.claude/skills/run-controle-de-cria/screenshots/`.

Driver commands (one per stdin line; blank lines and lines starting with `#`
are ignored):

| command | what it does |
|---|---|
| `nav <url>` | `page.goto(url)` |
| `wait-for <selector>` | wait for a selector to be visible (Playwright selector syntax, incl. `text=Foo`) |
| `click <selector>` | click |
| `fill <selector> :: <value>` | fill an input — note the ` :: ` separator, not a plain space (see Gotchas) |
| `upload <selector> :: <path>` | `page.setInputFiles(selector, path)` — same ` :: ` separator, for `input[type=file]` |
| `press <key>` | keyboard press, e.g. `press Enter`, `press F` |
| `type <text>` | keyboard type |
| `wait <ms>` | fixed pause |
| `screenshot [name]` | saves `screenshots/<name-or-counter>.png` (viewport only) |
| `screenshot-full [name]` | same, but `fullPage: true` — use for long scrollable pages like `/numeros/detalhado` |
| `eval <js>` | `page.evaluate(js)`, prints the JSON result |
| `console --errors` | prints accumulated `console.error`/`pageerror` messages as JSON |
| `quit` / `exit` | closes the browser and exits |

The whole app is client-side routed with `HashRouter`, so URLs look like
`http://localhost:5173/#/nascimento`, `#/pesagem`, `#/venda`, `#/morte`,
`#/virou-novilha`, `#/animais/:id`, `#/backup`, `#/cadastro-inicial`,
`#/numeros`, `#/descarte`.

## Run (human path)

```bash
npm run dev   # → http://localhost:5173/ , Ctrl-C to stop
```

## Test

```bash
npm run test          # vitest run — 56 tests, domain-logic modules under src/dominio + src/utilitarios
npx tsc -b && npm run build   # typecheck + production build
npx oxlint src         # lint — expect exactly one harmless warning (react/only-export-components in ConfirmacaoContexto.tsx)
```

---

## Gotchas

- **App shows a splash screen for 700ms on every load** (`src/App.tsx`,
  `DURACAO_SPLASH_MS`) with the *same* "Controle de Cria" text as the real
  home screen underneath. `wait-for text=Controle de Cria` matches during the
  splash too, so a `fill`/`click` right after can silently target an element
  that's present in the DOM but visually covered. Fix: `wait 900` after
  every `nav` before interacting, don't rely on that text as a readiness
  signal.
- **`fill` needs ` :: ` as the selector/value separator, not a space.**
  Selectors in this app are frequently Portuguese placeholder/text strings
  with spaces in them (e.g. `input[placeholder="Buscar animal pelo
  número"]`) — splitting on the first space breaks the selector. The driver
  splits on literal ` :: ` instead.
- **The readline `'line'` handler must be queued, not fired async-in-parallel.**
  `readline`'s `'line'` event doesn't wait for an `async` handler to resolve
  before emitting the next line, and piping a heredoc dumps all lines
  essentially at once — an earlier driver version ran `nav`/`click`/`quit`
  concurrently, and `quit` would close the browser mid-navigation, producing
  cascades of "Target page, context or browser has been closed". Fixed by
  chaining each line's handler onto a single `Promise` queue
  (`filaDeComandos`) in `driver.mjs`.
- **`rl.on('close', ...)` must await that same queue before closing the
  browser.** A heredoc closes stdin right after sending its last line, which
  fires `readline`'s `'close'` event essentially immediately — before the
  queued command promises have actually run. If `close` calls
  `browser.close()` unconditionally, the last few queued commands fail
  against a closed browser. Fixed by `await filaDeComandos` first.
- **No `chromium-cli` in this container.** `/run`'s fallback for browser
  apps ("adapt `_electron`'s REPL, import `{ chromium }` instead") is
  exactly what `driver.mjs` does.
- **Each `node driver.mjs` invocation is a brand-new browser with empty
  IndexedDB.** `chromium.launch()` here has no persistent user-data-dir, so
  data created in one invocation (e.g. matrizes lançadas via
  `/cadastro-inicial`) is gone in the next one. To test a flow that creates
  data and then reads it back (e.g. lançar uma matriz, then check
  `/numeros/detalhado`), do it all in **one** heredoc/session — don't split
  setup and verification across two `node driver.mjs` calls.

## Troubleshooting

- **`page.fill: Unexpected token "" while parsing css selector`**: the
  selector string got cut at a space that was inside it (either the driver's
  old first-space split, or a selector typed with an un-escaped space in
  this REPL's own command line). Use ` :: ` before the value, and keep
  selectors on one line.
- **Everything after the first command fails with `Target page, context or
  browser has been closed`**: symptom of the two ordering bugs above — if
  you're editing `driver.mjs`, check the command queue and the `close`
  handler are still wired together.
- **`npx playwright install chromium` prints a warning about installing
  project dependencies first**: harmless if `npm install` already ran in
  this repo; the warning is generic advice from Playwright's CLI, not an
  actual failure.
