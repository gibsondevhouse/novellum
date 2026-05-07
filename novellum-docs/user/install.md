# Install Novellum

> Last verified: 2026-05-07

Novellum is distributed as a desktop application for **macOS**, **Windows**, and **Linux**. There is no cloud account; nothing to sign up for.

## Download

Grab the latest release from the project's GitHub releases page:

- **macOS:** `Novellum-<version>.dmg`
- **Windows:** `Novellum-<version>.msi`
- **Linux:** `Novellum-<version>.AppImage`

## Install

### macOS

1. Open the `.dmg`.
2. Drag **Novellum** to Applications.
3. First launch: macOS will ask permission to run an unsigned-but-notarized app — confirm.

### Windows

1. Run the `.msi` installer.
2. Accept the EULA.
3. Launch from the Start menu.

### Linux

1. Make the `.AppImage` executable: `chmod +x Novellum-*.AppImage`.
2. Run it.
3. Optionally integrate with your desktop environment via `appimaged` or similar.

## What gets installed

- The Novellum app binary.
- A bundled Node.js runtime (the SvelteKit server runs as a sidecar — see [developer/architecture.md](../developer/architecture.md)).
- Your data file (`novellum.db`) is created in your OS app-data folder on first launch.

Nothing is sent to a remote server. The only outbound traffic Novellum makes is to OpenRouter when you trigger an AI action — and only after you've configured a key. See [ai-setup.md](./ai-setup.md).

## Uninstall

- **macOS:** drag the app to Trash. Your data file remains in `~/Library/Application Support/Novellum/`.
- **Windows:** Use Add/Remove Programs.
- **Linux:** delete the AppImage; data lives under `~/.local/share/Novellum/` (location may vary).

To remove your projects too, delete the `novellum.db` file at the path shown in **Settings → Data**.

## Next

- [quick-start.md](./quick-start.md) — your first project.
