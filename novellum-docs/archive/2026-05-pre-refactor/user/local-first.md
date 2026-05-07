# Local-First & Your Data

Novellum is a **local-first** application. This page explains exactly what that means, where your data lives, how to back it up, and what to do if you need to move your projects to a new computer.

---

## What "Local-First" Means

When you use a cloud-based writing app, your manuscripts are stored on someone else's server. You depend on that company staying in business, keeping their servers online, and protecting your work from data breaches.

Novellum works differently. **All your project data is stored on your own device** in a local database. There is no Novellum server that holds your manuscripts, no cloud sync, and no account required to use the app.

This means:

- **You own your data.** No subscription, no lock-in. Your files belong to you.
- **The app works offline.** You can write anywhere, even without an internet connection. The only feature that requires internet is the optional AI assistant.
- **Your writing is private.** Novellum never reads your manuscript unless you explicitly send a passage to the AI assistant — and even then, it goes directly to the AI provider you choose, not to Novellum.
- **No server downtime.** If Novellum ever shuts down, your projects are still on your computer, in an open database format you can read with any SQLite tool.

---

## Where Your Data Lives

Novellum stores all project data in a single SQLite database file in your operating system's application-support directory:

**macOS:**

```text
~/Library/Application Support/Novellum/novellum.db
```

To open this folder in Finder, press **Cmd+Shift+G** and paste the path above.

**Windows:**

```text
%APPDATA%\Novellum\novellum.db
```

To open this folder in Windows Explorer, press **Win+R**, type `%APPDATA%\Novellum`, and press Enter.

You do not need to interact with this file directly. Novellum manages it for you. But knowing where it is means you can always find your work, even outside the app.

---

## Backing Up Your Work

Because your data lives on your device, **you are responsible for backing it up**. If your computer fails and you have no backup, your projects cannot be recovered.

Novellum provides a built-in backup system that creates a portable `.novellum.zip` archive of all your projects.

### Automatic Backups

Novellum automatically creates a backup archive at regular intervals. You can configure the backup frequency in **Settings → Backup**. Backups are stored in a `Backups` subfolder of your Novellum application-support directory.

### Manual Backup

To create a backup at any time:

1. Open **Settings** (gear icon in the sidebar, or **Cmd+,** on macOS).
2. Navigate to **Backup**.
3. Click **Create Backup Now**.

Novellum generates a `.novellum.zip` file and shows you where it was saved.

### What a Backup Contains

A `.novellum.zip` backup archive is a complete, portable snapshot of all your projects, including every scene, outline node, worldbuilding entry, and metadata. It is not an export for publishing — it is a full restoration point.

---

## Backup vs. Export: What's the Difference?

These two features serve different purposes:

| Feature | Purpose | Format | Contents |
| :--- | :--- | :--- | :--- |
| **Backup** | Restore your projects inside Novellum | `.novellum.zip` | Full project data, all scenes, all worldbuilding |
| **Export** | Submit or publish your manuscript | `.docx`, `.epub`, `.md` | Formatted manuscript text only |

Use **Backup** to protect your work. Use **Export** to share or publish it.

---

## Moving Projects to a New Computer

To move all your projects to a new computer:

1. **On your old computer:** Create a manual backup via **Settings → Backup → Create Backup Now**. Note where the `.novellum.zip` file is saved.
2. **Transfer the file** to your new computer (USB drive, AirDrop, email, etc.).
3. **On your new computer:** Install Novellum and complete the onboarding flow.
4. Open **Settings → Backup → Restore from Backup**, select the `.novellum.zip` file, and follow the prompts.

All your projects will be restored exactly as they were.

---

## A Note on Cloud Storage and Sync Services

You can store your `.novellum.zip` backup files in iCloud Drive, Dropbox, or any other cloud service — this is a great way to keep an offsite backup.

However, **do not point a cloud sync service directly at the Novellum application-support folder** (the folder containing `novellum.db`). Cloud sync services can cause corruption in actively-used database files by modifying them while the app is running. Always use Novellum's built-in backup feature instead of syncing the raw database.
