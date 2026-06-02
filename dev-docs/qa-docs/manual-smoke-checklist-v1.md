# Novellum — Manual smoke checklist (packaged build)

> Last verified: 2026-06-01
>
> Originally cut for the internal V1 desktop checkpoint (plan-025). Still the
> canonical smoke checklist for any packaged Tauri build.

Run this checklist on the **packaged Tauri `.app`** (output of
`pnpm desktop:build`) before any release. The vitest suite plus
`pnpm smoke:built` exercise everything that can be probed automatically;
this list covers what only the bundled desktop shell can prove.

Use a **fresh user profile** (rename or move
`~/Library/Application Support/com.novellum.app/` aside on macOS so the
app boots into a clean state). Note the build under test
(`pnpm --silent exec node -e "console.log(require('./package.json').version)"`).

Pass criteria: every step succeeds, no red console errors anywhere
(Tauri inspector → Console), no unexplained warnings about missing
modules, no UI affordances that say "coming soon".

---

## 1. Cold boot

- [ ] Double-click the bundled `.app`.
- [ ] Onboarding lands cleanly on the welcome screen.
- [ ] No red errors in `~/Library/Logs/com.novellum.app/` or in
      DevTools Console.

## 2. Save an OpenRouter key (keyring backend)

- [ ] Settings → AI → OpenRouter → paste a valid key → **Save**.
- [ ] Status flips to "Connected" and the masked tail of the key is
      shown.
- [ ] Quit the app (⌘Q), reopen, return to Settings → AI. Status is
      still "Connected" — proves the `@napi-rs/keyring` native module
      loaded inside the packaged sidecar.

## 3. Legal / Privacy / Storage panels

- [ ] Settings → About → **License (EULA)** renders the full document.
- [ ] Settings → Privacy renders the Privacy Policy.
- [ ] Settings → Third-Party Notices renders. (Confirms the SvelteKit
      `?raw` markdown imports bundle into the adapter-node output.)
- [ ] Settings → Storage Location shows a real path under
      `~/Library/Application Support/com.novellum.app/` (not
      `/tmp/...` or `~/.novellum`).

## 4. Create → type → restart

- [ ] Projects → **New project**. Name it `smoke-<date>`.
- [ ] Open the manuscript, type a paragraph in a scene, wait for the
      auto-save indicator to settle ("Saved").
- [ ] Quit and reopen the app. Project and paragraph are still there.
      (Confirms SQLite + `better-sqlite3` prebuild loaded and the DB
      writes landed in the packaged app-data dir.)

## 5. Character image attachment

- [ ] World-building → **New character** → upload a portrait image.
- [ ] Image renders in the character card.
- [ ] Restart the app. Image still loads from
      `…/com.novellum.app/scratchpads/characters/<id>/…`.
      (Confirms plan-025 phase A1 fix — scratchpad root now uses
      `resolveAppDataDir()`.)

## 6. Backup

- [ ] Open the project hub for the smoke project.
- [ ] Tools → **Back up this project**. Save the `.novellum.zip` to
      `~/Desktop`.
- [ ] Inspect the zip — it contains `manifest.json`, the SQLite
      snapshot, and the scratchpad payload.
- [ ] (Optional) Run **Restore preview** on the zip. Validation
      passes with no errors.

## 7. Nova streaming

- [ ] Open Nova in the manuscript view.
- [ ] Ask: `Write a one-line continuation for this scene.`
- [ ] Tokens stream into the panel and a final response renders.
      (Confirms OpenRouter SSE round-trip through the packaged
      sidecar — covers the regression that took out `/api/ai` on
      2026-05-12.)
- [ ] Click **Stop** mid-stream on a longer prompt. The stream halts
      and the partial text remains.

## 8. Ollama fallback (optional, requires local daemon)

- [ ] Start `ollama serve` and pull a small model (e.g. `llama3.2:1b`).
- [ ] Settings → AI → switch active provider to **Ollama**.
- [ ] Repeat step 7. Stream succeeds against `127.0.0.1:11434`.
- [ ] Switch back to OpenRouter; status returns to "Connected".

## 9. Console hygiene

- [ ] Throughout steps 1–7, keep DevTools Console open.
- [ ] **Zero** red errors. Yellow warnings should be limited to
      known third-party noise (Tauri devtools probe, source-map
      lookups). If you see a `Cannot find module …`,
      `ERR_REQUIRE_ESM`, or `ERR_DLOPEN_FAILED`, log it as a
      regression and file evidence under
      `dev-docs/plans/plan-025-functional-after-build/evidence/`.

---

When every box above is checked, V1 is functionally green for ship.
Save the output of `pnpm smoke:built` plus a short note ("date,
commit SHA, all 9 steps passed") to
`dev-docs/plans/plan-025-functional-after-build/evidence/manual-smoke-<date>.md`.
