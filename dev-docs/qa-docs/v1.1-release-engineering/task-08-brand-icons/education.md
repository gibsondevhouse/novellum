# Task 08 — Education

## Why each platform needs its own icon format

Each OS evolved its icon system independently and they're not
interchangeable:

- **macOS `.icns`:** Apple's compound format. A single file
  contains 16, 32, 64, 128, 256, 512, 1024 sizes plus their @2x
  retina variants. The Finder / Dock / Mission Control pick the
  right resolution at draw time. Lives at
  `Novellum.app/Contents/Resources/icon.icns` and is referenced by
  `Info.plist` via `CFBundleIconFile`.
- **Windows `.ico`:** Microsoft's compound format. Single file
  with up to 16 layers at sizes 16, 32, 48, 64, 128, 256. Embedded
  into the `.exe` as a Windows resource by the linker; the .msi
  references it via the Wix manifest.
- **Linux PNGs:** No compound format; each desktop environment
  scans `~/.local/share/icons/hicolor/<size>/apps/<id>.png`.
  Tauri's AppImage bundler injects all the sizes into the AppImage
  so it can install them on first run.

Tauri abstracts this via `tauri icon`: feed in one PNG, it builds
the platform compounds for you.

## Why the source must be 1024×1024

The icns format's largest layer is 1024×1024 (Apple introduced
this for Retina 5K iMac). If your source is smaller, that layer is
upscaled and looks blurry on Retina displays. If your source is
larger, the CLI down-samples cleanly.

Aspect ratio must be square. Tauri will refuse non-square inputs
to prevent accidental distortion.

## Why dark backgrounds work better

Both macOS and Windows display app icons over a wide range of
backgrounds (Dock backgrounds vary by wallpaper, taskbar varies by
theme). Light icons on a dark background read well over both
light and dark contexts. Dark icons on a light background fail on
dark themes.

Look at how Spotify, Notion, Obsidian, Slack handle this — all use
high-contrast monochromatic glyphs over saturated dark backgrounds.

## What the Windows Store ladder is for

Plan-018 has a stage to publish to the Microsoft Store. The Store
requires a specific ladder of square logos for tile rendering at
different DPI scales (100%, 125%, 150%, 200%, 400%). The 30×30
Square logo for example is the small "list view" icon; the 310×310
is the wide tile. If you ever submit to the Store, all of these
must exist or submission fails preflight.

For now, generating them up-front is free and saves a future trip
back to the design tool.

## The macOS icon cache trap

macOS keeps an aggressive icon cache (`/Library/Caches/com.apple.iconservices.store`).
After replacing icons in a packaged app, the Dock and Finder may
keep showing the old icon for hours. Workarounds:

```bash
sudo rm -rf /Library/Caches/com.apple.iconservices.store
killall Dock Finder
```

(Yes, this is hacky. It's macOS, not your code.)
