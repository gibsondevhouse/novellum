# Frequently Asked Questions

---

### Is my data safe if I lose my computer?

Your data is as safe as your backup habits. Because Novellum is local-first, your projects are stored on your device — not in the cloud. If your computer fails and you have not created a backup, the data cannot be recovered.

To protect your work, use Novellum's built-in backup feature regularly: **Settings → Backup → Create Backup Now**. Save the resulting `.novellum.zip` file to an external drive or cloud storage service (like iCloud, Dropbox, or Google Drive). That way, even if your computer fails, you can restore everything to a new machine. See [Local-First & Your Data](local-first.md) for full backup instructions.

---

### Can I use Novellum without the internet?

Yes. Novellum is fully functional offline. All your projects, outlines, scenes, and worldbuilding data are stored locally on your device. You can write, edit, reorganise, and export without any internet connection.

The only feature that requires internet is the **Nova AI writing assistant**, which sends requests to OpenRouter. If you are offline, Nova will show an error and you can dismiss the sidebar and continue writing normally.

---

### What happens if I uninstall the app — will I lose my work?

No. Uninstalling Novellum removes the application but **does not delete your project data**. Your database lives in your OS application-support folder (`~/Library/Application Support/Novellum/` on macOS, `%APPDATA%\Novellum\` on Windows). The uninstaller never touches that folder.

If you want to permanently delete your data, you must manually delete that folder after uninstalling.

---

### Does Novellum read my manuscript?

Novellum the application reads your manuscript only to display it to you. No data is ever sent to Novellum's servers — because there are no Novellum servers.

If you use the **Nova AI assistant**, a scoped portion of your manuscript (typically the current scene and any characters you have tagged as active) may be sent to the AI model provider you have configured via OpenRouter. The **Context disclosure** in the Nova sidebar shows you exactly what will be sent before you confirm any request. You are always in control.

---

### How do I move my project to a new computer?

1. On your old computer, create a backup: **Settings → Backup → Create Backup Now**. Copy the `.novellum.zip` file to a USB drive, AirDrop it, or upload it to cloud storage.
2. Install Novellum on your new computer and complete onboarding.
3. On the new computer, go to **Settings → Backup → Restore from Backup**, select the `.novellum.zip` file, and follow the prompts.

All your projects, scenes, and worldbuilding data will be restored exactly as they were.

---

### Can I import from Scrivener or Microsoft Word?

Novellum currently supports importing plain text (`.txt`) and Markdown (`.md`) files. Full Scrivener (`.scriv`) and Microsoft Word (`.docx`) import is on the development roadmap.

As a workaround for now:

- **From Scrivener:** Use Scrivener's **File → Export → Files…** to export your manuscript as plain text or Markdown, then import that into Novellum.
- **From Microsoft Word:** Copy and paste the text of each scene directly into the Novellum editor. Word formatting will be stripped down to plain text, which you can then re-format as needed.

---

### What AI models does Novellum support?

Novellum uses [OpenRouter](https://openrouter.ai) as its AI gateway, which means you can use any model available on the OpenRouter platform. At the time of writing this includes:

- **Anthropic:** Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus
- **OpenAI:** GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Google:** Gemini 1.5 Pro, Gemini 1.5 Flash
- **Meta:** Llama 3.1 series (open-weight)
- **Mistral:** Mistral Medium, Mistral Small

The available model list may change as OpenRouter adds or removes providers. Check the [OpenRouter models page](https://openrouter.ai/models) for the current list.

---

### How do I turn off the AI features entirely?

If you prefer to write without AI assistance, you do not need to configure an API key. Nova will be present in the UI but will prompt you to add a key if you try to use it — simply ignore the sidebar.

If you have already added a key and want to disable AI completely:

1. Go to **Settings → AI**.
2. Clear the **API Key** field and click **Save**.

The Nova sidebar will remain in the UI but will not function without a key.

---

### Where are my backups saved?

By default, Novellum saves backup archives in the `Backups` subfolder of your application-support directory:

- **macOS:** `~/Library/Application Support/Novellum/Backups/`
- **Windows:** `%APPDATA%\Novellum\Backups\`

You can change this location in **Settings → Backup → Backup Location**. If you move your backups to an external drive or cloud storage folder, Novellum will save future backups there automatically.

---

### What export formats are supported and which should I choose?

Novellum currently supports four export profiles:

| Format | Profile | Best for |
| :--- | :--- | :--- |
| `.docx` (Microsoft Word) | Standard Manuscript or Reader Copy | Literary agent submissions, beta readers |
| `.epub` | Ebook Draft | Self-publishing, ebook distribution |
| `.md` (Markdown) | Plain Text Archive | Archiving, version control, importing elsewhere |

**For literary agents,** use **Standard Manuscript** (`.docx`) — it follows industry submission formatting. **For self-publishing,** use **Ebook Draft** (`.epub`). **For sharing a draft with beta readers,** use **Reader Copy** (`.docx`). See the full [Export Guide](export.md) for details on each profile.

---

### What platforms are supported?

Novellum currently supports:

- **macOS** — macOS 12 Monterey or later (Intel and Apple Silicon)
- **Windows** — Windows 10 (64-bit) or later

A Linux build (Ubuntu 20.04+, AppImage) is available for technical users and is produced by the CI pipeline, but is not officially supported at this time.

A mobile or tablet version is not currently planned for V1.
