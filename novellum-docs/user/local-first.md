# Local-First

> Last verified: 2026-05-07

Novellum is **local-first**. That's a small word that does a lot of work. Here's what it means concretely.

## Your data lives on your disk

Every project, scene, character, lore entry, snapshot, and asset lives in a single SQLite file on your machine. You can find it under **Settings → Data → Storage location**. Move it. Back it up. Inspect it with any SQLite tool.

There is no Novellum cloud. No account. No upload. Nothing to "log in" to.

## The app works offline

Without a network connection, you can still write, restructure, browse world-building, export to DOCX/EPUB/Markdown/TXT, and back up to a `.novellum.zip`. The only feature that needs the network is AI — and only when you trigger it.

## You own your file

If Novellum stops working tomorrow:

- Your `novellum.db` is a standard SQLite database. It will still open with any SQLite client.
- Your `.novellum.zip` backups are plain ZIP files containing JSON. They are inspectable forever.
- Your exported DOCX/EPUB/Markdown/TXT files are standard formats.

There is no proprietary container, no DRM, no encryption you can't undo.

## AI calls are explicit

When you ask Nova for help (or run a continuity check, edit suggestion, etc.), Novellum sends the **smallest viable context** for that task to your configured OpenRouter endpoint. It does not send your full manuscript. It does not poll in the background.

You are in control of when and what gets sent.

## Your key is yours

Your OpenRouter API key is stored in your operating system's keyring (macOS Keychain, Windows Credential Manager, libsecret on Linux). It is **never** included in backups, exports, or telemetry. There is no telemetry.

## What you give up

- **No multi-device sync.** If you write on a laptop and want to continue on a desktop, you back up and restore. (We may explore opt-in sync later, but only on user-controlled storage.)
- **No collaboration.** Novellum is a single-author tool by design.
- **No "open from anywhere."** Your data is where you put it. That's the point.

## Why we built it this way

Long-form fiction takes years. Tools come and go. We want your novel to outlive the tool you wrote it in.
