# Novellum v2 — author-first UI kit

A complete refactor of the Novellum interface for authors and fan-fiction writers — warmer surfaces, real text serif, per-book mood theming, and a stronger sense of *place* for every screen.

Open `index.html` to use it.

## The five surfaces

| Surface | What it is | Key moves vs v1 |
| --- | --- | --- |
| **The Study** (`Study.jsx`) | Replaces the Library dashboard | Atmospheric study scene with a candle vignette, a daily greeting that knows what time it is and what the weather's doing, a streak chip, a literary quote chip, one big "where you left off" continue card (with an *actual excerpt*, not a logline), then a vertical shelf of books with spine type. |
| **Project Hub** (`Hub.jsx`) | The overview when you open a book | Project-mood-tinted gradient sky, large cover + serif title + italic logline, six narrative tiles (Manuscript / Outline / World / Reader / Continuity / Export) with body copy that reads like notes-to-self, not status labels. |
| **The Page** (`Page.jsx`) | The manuscript editor | Real parchment surface, brass drop cap, Crimson Pro for prose, scene rail on the left with chapter context + done/active/empty status, breath chips at the bottom (words today · streak), and Nova as **marginalia in the right margin** — not a floating panel. |
| **The Reading Room** (`Room.jsx`) | Read-through view | Two-page parchment spread on a warm-lit desk, chapter ornament (❦), brass drop cap, red ribbon bookmark, folio page numbers, candle vignette overhead, "21 minutes left in this chapter" reading estimate. |
| **The Muse** (`Muse.jsx`) | Nova as a side overlay | Slides in from the right over a scrim. Conversation reads as **correspondence**, not chat — your prompts are italic serif tucked right, Nova's replies are full marginal notes signed with a brass nib initial. Inline candle-warm highlights flag continuity issues. Composer is a serif italic field with scope chips. |

## Chrome

| File | What it does |
| --- | --- |
| `Chrome.jsx` → `Sidebar` | Slim sidebar with brand mark + grouped nav (Library / Active project / Settings). Active item gets a candle-warm rail that shifts to the active project's mood color when one is open. Auto-collapses to a 56px rail when the user enters the Editor or Reader (immersion). |
| `Chrome.jsx` → `Header` | 52px header with three columns: route eyebrow + serif title on the left, a project "breath line" in the center (status · word count · streak), Nova + theme buttons on the right. |
| `app.jsx` | Top-level state. Drives route, project, museOpen, sidebarCollapsed. Auto-collapses sidebar in immersive surfaces. |

## Per-book mood theming

Each project in `primitives.jsx` carries a `mood` object with four colors:

```js
mood: { ink: '#0e1b29', wash: '#1a3148', accent: '#9ec5e8', warm: '#c89a5b', name: 'Deep sea' }
```

The `useMood(project)` hook returns a style object that sets `--mood-ink/--mood-wash/--mood-warm/--mood-accent` as CSS custom properties on the surface container. Every project-scoped element (the Hub gradient sky, the Editor page tint, the Reader candle, the Muse nib, the sidebar active rail, the header breath bar) reads from those vars — so when you enter Vellum & Bone the chrome warms toward violet; when you enter Amber Roads it warms toward amber.

Outside any project (in the Study), the chrome returns to neutral candle-warm.

## Tokens

`tokens.css` has the full token table. The decisions worth knowing:

- **Surfaces** are warmer than v1. `--night-raised` is `#221d17` (vs old `#191917`) — a touch of umber.
- **Two serifs do work.** `--display` is DM Serif Display (headings, titles, hero); `--text` is **Crimson Pro** (prose, marginalia, dialog, italic loglines). Crimson Pro is the one you can actually *read* an 80k draft in.
- **Two accents only.** `--candle` (#f0bb70) is the default warm; per-project `--mood-warm` overrides it on project surfaces. Nova-blue is gone from the v2 chrome.

## Click-through

1. **Study** (default) → click any shelf book → Project Hub
2. **Hub** → "Continue writing" → Editor · "Read what's there" → Reader · click any tile that's wired (Manuscript / Reader)
3. **Editor** → sidebar Reader item → Reader · header Nova → Muse overlay
4. **Reader** → header Nova → Muse overlay
5. **Muse** (overlay) → click scrim or × → close

## Known shortcuts (mocks, not production)

- Outline, World Building, Continuity, Export, Settings tiles are placeholder routes — they currently bounce you back to the Hub.
- The "Reading appearance" button in the Reader header is decorative.
- The candle vignette uses pure CSS gradients; in production we'd add a subtle film grain / animated flicker.
- The Muse `replyTo()` is scripted heuristics on a few keywords ("summarize", "continuity", "quint"). In production this is wired to your OpenRouter call.
