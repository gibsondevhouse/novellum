# FAQ

> Last verified: 2026-05-07

## Is Novellum free?

Read [LICENSE](../../LICENSE), [EULA.md](../../EULA.md), and [TERMS.md](../../TERMS.md) for the authoritative answer. Licensing is being formalized as part of [plan-018-v1-product-experience](../../dev-docs/plans/plan-018-v1-product-experience/plan.md).

## Do I need an internet connection?

Only for AI features. Writing, restructuring, exporting, and backing up all work offline.

## Where is my data?

In a single SQLite file on your machine. The path is shown under **Settings → Data → Storage location**.

## Can I open my data without Novellum?

Yes. The DB is a standard SQLite file. Backups are standard ZIP files containing JSON. See [local-first.md](./local-first.md).

## Does Novellum send my writing to anyone?

Only the parts you explicitly send to AI. There is no telemetry, no analytics, no background sync. See [local-first.md](./local-first.md) and [nova.md](./nova.md).

## Why do I need an OpenRouter key?

Novellum is BYOK. We don't host a model; you pick your provider via OpenRouter. See [ai-setup.md](./ai-setup.md).

## My OpenRouter key disappeared after a backup restore

That's by design. Keys live in your OS keyring and are deliberately excluded from backups. Re-enter under **Settings → AI**.

## Can I collaborate with another author?

Not natively. Novellum is single-author. You can hand over a `.novellum.zip` to a collaborator, but only one person should edit at a time.

## Can I sync my project between two computers?

Manually, via `.novellum.zip` backup/restore. There is no built-in sync.

## How do I report a bug?

Open an issue on the GitHub repo. Include:

- App version (Settings → About).
- Operating system.
- Steps to reproduce.
- Anything you see in the Tauri logs (location is OS-dependent).

## How do I get a new feature?

Open an issue describing the use case. If we agree, the work flows into a plan under `dev-docs/plans/`.

## How is Novellum built?

See [../developer/architecture.md](../developer/architecture.md) for a one-pager and [../../dev-docs/](../../dev-docs/) for the full reference.
