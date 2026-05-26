# Task 08 — Replace Placeholder Icons

**Goal:** Replace the default Tauri logo in `src-tauri/icons/` with
real Novellum branding so the installer, dock/taskbar entry, and
window icon all show the product identity.

## Why You Need This

Today `src-tauri/icons/` contains the assets `tauri init` shipped
(generic Tauri logo). Every screenshot, every test install, every
CI artifact ships those defaults. It's small but it's the kind of
unprofessional detail beta testers notice immediately.

This is also a hard prerequisite for Apple notarisation: the
notary service does not literally check the icon, but Apple's
review (when you eventually submit to the Mac App Store) will
reject generic / placeholder branding.

## Required Asset Set

Tauri's `bundle.icon` array in `tauri.conf.json` references all of
these. You need each one:

- `32x32.png` — small window icon (Linux GTK).
- `128x128.png` — medium app icon (Linux).
- `128x128@2x.png` — Retina version of above.
- `icon.icns` — macOS bundle icon (compound format with all sizes
  inside).
- `icon.ico` — Windows app icon (compound format with multiple
  resolutions: 16, 32, 48, 64, 128, 256).

Plus, if you target the Windows Store later (plan-018):

- `Square30x30Logo.png`
- `Square44x44Logo.png`
- `Square71x71Logo.png`
- `Square89x89Logo.png`
- `Square107x107Logo.png`
- `Square142x142Logo.png`
- `Square150x150Logo.png`
- `Square284x284Logo.png`
- `Square310x310Logo.png`
- `StoreLogo.png` (50×50)

## Steps

1. **Source a 1024×1024 PNG master.** Either:
   - Commission a designer.
   - Use a quick-and-dirty FOSS option: pair the Novellum wordmark
     with a single glyph (book / quill / open-page motif) over a
     dark background that matches the app's design tokens (see
     `src/styles/tokens.css`).

   Save as `src-tauri/icons/source-1024.png`. Keep this file as
   the source of truth for re-runs.

2. **Use Tauri's CLI to auto-generate the full set.**

   ```bash
   pnpm tauri icon src-tauri/icons/source-1024.png
   ```

   This populates `src-tauri/icons/` with all required sizes,
   including the Windows Store ladder. The CLI uses `image` and
   `ico` Rust crates internally — no third-party dependency.

3. **Verify the manifest.** Open `src-tauri/tauri.conf.json` and
   confirm `bundle.icon` lists exist:

   ```json
   "icon": [
     "icons/32x32.png",
     "icons/128x128.png",
     "icons/128x128@2x.png",
     "icons/icon.icns",
     "icons/icon.ico"
   ]
   ```

4. **Rebuild and verify.**

   ```bash
   pnpm desktop:build
   ```

   Then on macOS:

   ```bash
   open src-tauri/target/release/bundle/macos/Novellum.app/Contents/Resources/icon.icns
   ```

   The Preview app should show all icon sizes embedded. The dock
   icon when you launch should be your new design, not the Tauri
   logo.

5. **Commit the icons.** They're small (a 1024 PNG is ~50 KB,
   compound formats ~200 KB) and they're branding source — yes,
   commit them.

   ```bash
   git add src-tauri/icons/
   git commit -m "chore(branding): replace placeholder Tauri icons with Novellum"
   ```

## Done When

Running the packaged app shows your icon in:

- The dock / taskbar / Activity Monitor.
- The window's title-bar (Linux / Windows).
- The installer (DMG window background can also be customised, but
  that's optional).
- Finder / Explorer file listing of the .app / .exe.

## Common Failures

- **Tauri CLI complains "ICO format requires 256x256 maximum"**: your
  source PNG is too large or has alpha channel in an unsupported
  bit-depth. Re-export from your design tool with 8-bit RGBA.
- **macOS still shows the old icon after rebuild**: macOS caches
  icons aggressively. Run
  `touch /Applications/Novellum.app && killall Finder` to refresh.
- **Windows icon looks pixelated at small sizes**: the .ico needs
  hand-crafted 16×16 and 32×32 layers because down-scaling a
  detailed 1024 PNG produces noise. Use a proper icon tool
  (IcoFX, GIMP icon export) for these two sizes specifically.
