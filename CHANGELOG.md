# Changelog

All notable changes to Novellum are documented here.

## [1.0.0-beta.1] — 2026-Q2

### Added

- **Export pipeline** — four manuscript profiles (Standard Manuscript, Reader Copy, Ebook Draft, Plain Text Archive) with Markdown, DOCX, and EPUB drivers. Real manuscript metadata (title, author, subtitle, synopsis, copyright, dedication). Per-profile front matter and back matter flags.
- **Writing-first editor** — TipTap-based prose surface with autosave, scene word count, and keyboard shortcuts. No lag on 5,000-word scenes.
- **Project Hub** — trust-first project list with word count, last-modified date, and quick-access backup link.
- **Settings Trust Center** — AI key management (OpenRouter BYOK), privacy disclosure panel, backup schedule controls, About + Legal routes.
- **Nova AI Assistant** — context-scoped AI sidebar powered by your OpenRouter key. Context policy: scene + adjacent scenes. No auto-apply; all suggestions are explicit.
- **Onboarding flow** — first-launch guide with persistent completion flag.
- **Worldbuilding suite** — Personae, Atlas, Archive, Threads, and Chronicles modules with vertical-domain module boundaries.
- **Navigation and design system** — frozen token set, dark theme, accessibility-reviewed components.
- **Documentation** — user docs (`novellum-docs/user/`) and developer docs (`novellum-docs/developer/`).
- **CI/CD pipeline** — PR gate (`ci.yml`), release workflow with macOS/Windows/Linux Tauri builds (`release.yml`), scheduled visual regression workflow, Dependabot.
- **Legal** — `LICENSE` (Proprietary), `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md`.
- **Error primitives** — `AppError` class and `error-map` with six named error codes replacing raw `Error` throws in Nova and export services.
- **AppVersion** — `APP_VERSION` injected at build time; shown in Settings → About.

### Known Issues (Beta)

- Linux `.AppImage` build is CI-produced and not officially supported.
- No Scrivener / Word import.
- AI context window limited to scene + adjacent scenes.
