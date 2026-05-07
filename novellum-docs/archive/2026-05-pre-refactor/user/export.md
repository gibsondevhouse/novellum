# Exporting Your Manuscript

When you are ready to share, submit, or publish your work, Novellum's Export feature compiles your scenes into a formatted document. This guide covers the four export profiles, metadata options, how to run an export, and how to handle re-exports.

---

## Opening the Export Dialog

From anywhere inside a project, click the **Export** button in the top-right toolbar. You can also press **Cmd+E** (macOS) or **Ctrl+E** (Windows).

The Export dialog opens. It has three sections: **Profile**, **Metadata**, and **Scope**.

---

## The Four Export Profiles

Novellum provides four compile profiles, each optimised for a different destination or use case.

### Standard Manuscript

The **Standard Manuscript** profile formats your book according to industry-standard submission guidelines used by literary agents and publishers:

- Double-spaced body text
- 12pt Times New Roman (or equivalent serif)
- Header with author name, title, and page number
- Title page with word count, author name, and contact block
- Scene breaks rendered as `#` centred on its own line

**Use this when:** submitting to a literary agent, editor, or publisher.

### Reader Copy

The **Reader Copy** profile produces a clean, readable version suitable for beta readers, critique partners, and personal reading:

- Single-spaced body text
- Clean chapter headings
- Front matter (title page) and back matter (author note placeholder)
- No submission-specific formatting

**Use this when:** sharing a draft with readers for feedback.

### Ebook Draft

The **Ebook Draft** profile generates an EPUB file with proper structure for ebook distribution:

- EPUB 3 format
- Auto-generated table of contents from your chapter headings
- Metadata embedded in the EPUB manifest (title, author, language)
- Clean semantic markup compatible with major ebook readers and distributors

**Use this when:** preparing a file for Kindle Direct Publishing, Draft2Digital, or other ebook platforms.

### Plain Text Archive

The **Plain Text Archive** profile exports your manuscript as a Markdown (`.md`) file with minimal formatting:

- One file per chapter, or all chapters in a single file (your choice)
- Scene breaks preserved as horizontal rules (`---`)
- No font, margin, or spacing information — just the text
- Human-readable in any text editor

**Use this when:** archiving your work, importing into another writing tool, or creating a diff-able version for version control.

---

## Choosing a Format

If you are unsure which profile to use, here is a quick guide:

| Goal | Profile | Output format |
| :--- | :--- | :--- |
| Submit to a literary agent | Standard Manuscript | `.docx` |
| Share with beta readers | Reader Copy | `.docx` or `.pdf` |
| Publish as an ebook | Ebook Draft | `.epub` |
| Archive or import elsewhere | Plain Text Archive | `.md` |

---

## Manuscript Metadata

Before exporting, fill in the **Metadata** section of the export dialog:

- **Title** — the title of your book as it should appear in the document.
- **Author** — your name or pen name.
- **Subtitle** — optional; appears on the title page if present.
- **Synopsis** — a brief description; included as back matter in Reader Copy and Ebook Draft exports.
- **Copyright notice** — defaults to your author name and the current year.

Novellum pre-fills these fields from your project settings. You can override them for any individual export without changing your project settings.

---

## Selecting a Scope (Optional)

By default, Novellum exports your entire manuscript — all acts, chapters, and scenes. If you want to export only a portion:

1. In the **Scope** section of the export dialog, click **Select chapters**.
2. Check or uncheck the chapters you want to include.
3. The estimated word count updates to reflect your selection.

This is useful for exporting a sample chapter for an agent query, or for checking the formatting of a single act before exporting the full manuscript.

---

## Running the Export

1. Choose your **Profile**.
2. Review and edit **Metadata** if needed.
3. Optionally adjust the **Scope**.
4. Click **Export**.
5. A system save dialog appears. Choose a folder and a filename, then click **Save**.

Novellum compiles your manuscript and saves the file. A confirmation notification appears when the export is complete, with a button to open the file directly.

---

## Export Settings and Defaults

You can set default metadata and a default export profile in **Settings → Export Defaults**. Any defaults you set here will pre-fill the export dialog each time, saving you from re-entering the same information on every export.

---

## Re-Exporting After Edits

Each time you export, Novellum creates a new file. It does not overwrite your previous export. If you export the same manuscript twice, you will have two files — for example, `My-Novel-v1.docx` and `My-Novel-v2.docx`.

This means you can safely keep previous exports as milestones while continuing to edit. Novellum will never silently replace a file you have previously exported.
