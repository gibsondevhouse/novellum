# Task 08 — Checklist (with how-to)

Replace the default Tauri icons with Novellum branding.

---

### 1. Provide a 1024×1024 source PNG

You need a single high-res PNG to feed Tauri's icon generator.
Either:

- Get one from your designer, or
- Use a quick wordmark + glyph in any tool (Figma, Affinity,
  Photoshop, GIMP).

Requirements:
- 1024×1024 pixels exactly
- 8-bit RGBA (transparent background OK)
- Square; no padding wider than the artwork

**Save it at:**

```
src-tauri/icons/source-1024.png
```

**Verify:**

```bash
file src-tauri/icons/source-1024.png
```

**Expect:** `PNG image data, 1024 x 1024, 8-bit/color RGBA, ...`.

- [ ] `src-tauri/icons/source-1024.png` exists
- [ ] Confirmed 1024×1024 PNG

---

### 2. Generate all icon sizes

**Run:**

```bash
pnpm tauri icon src-tauri/icons/source-1024.png
```

This populates `src-tauri/icons/` with every size Tauri's bundler
references.

**Verify the five base files exist:**

```bash
ls src-tauri/icons/{32x32.png,128x128.png,128x128@2x.png,icon.icns,icon.ico}
```

**Expect:** all five paths print without errors.

- [ ] `32x32.png` generated
- [ ] `128x128.png` generated
- [ ] `128x128@2x.png` generated
- [ ] `icon.icns` generated
- [ ] `icon.ico` generated

---

### 3. (Optional) Confirm Windows Store square logos

Only needed if you intend to ship to the Microsoft Store later.

```bash
ls src-tauri/icons/Square*Logo.png src-tauri/icons/StoreLogo.png 2>/dev/null
```

**Expect:** ten `Square*Logo.png` files plus `StoreLogo.png`.

- [ ] Square logos present (skip if not targeting MS Store)

---

### 4. Confirm tauri.conf.json references the icons

**Run:**

```bash
grep -A 7 '"icon"' src-tauri/tauri.conf.json
```

**Expect:** the array lists the five base icons listed in step 2.
No edit required if you didn't change paths — `tauri icon`
overwrote the existing files in place.

- [ ] `bundle.icon` array still references the regenerated files

---

### 5. Rebuild the app

**Run:**

```bash
pnpm desktop:build
```

Wait for `Bundling Novellum.app` and `Bundling Novellum_*.dmg`.

- [ ] Rebuild succeeded

---

### 6. Confirm the .icns inside the bundle is yours

**Run:**

```bash
open "src-tauri/target/release/bundle/macos/Novellum.app/Contents/Resources/icon.icns"
```

This opens the icon in Preview. You should see your design at
multiple resolutions.

**Expect:** your artwork, not the generic Tauri logo.

- [ ] `icon.icns` inside the bundle shows your branding

---

### 7. Confirm Finder + Dock show the new icon

1. **Reinstall** the new `.app` (drag the rebuilt one into
   `/Applications`, replacing the old one).
2. Force Finder to refresh its icon cache:

   ```bash
   touch /Applications/Novellum.app
   killall Finder
   ```

3. Open Finder → Applications. Look at the `Novellum` icon.
4. Launch it. Look at the Dock icon.

**Expect:** new branding in both places. If you still see the old
Tauri icon, repeat step 7.2 — macOS caches icons aggressively.

- [ ] Finder shows the new icon
- [ ] Dock shows the new icon at launch

---

### 8. Commit the icons

The icon files are branding source-of-truth — commit them.

**Run:**

```bash
git add src-tauri/icons/
git status -- src-tauri/icons/
git commit -m "chore(branding): replace placeholder Tauri icons with Novellum"
```

- [ ] `src-tauri/icons/` committed

---

## Done

All boxes green = the app no longer ships with the placeholder
Tauri logo. Move to [Task 09 — Acquire Signing Certificates](../task-09-signing-certs/task.md)
(if you haven't already started it in parallel).
