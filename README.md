# Novellum

An AI-assisted novel production system designed to be integrated with the Gemini CLI. Its primary purpose is to empower users to leverage AI capabilities for novel writing and related tasks directly from their terminal.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

## Getting Started

```sh
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- **`.github/`**: Gemini CLI configuration, agents, skills, instructions, and workflows.
- **`dev-docs/`**: Developer documentation, architecture, and planning artifacts.
- **`novellum-docs/`**: End-user documentation and manuals.
- **`src/`**: Application source code organized by vertical domain slice.

## Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `pnpm run dev`     | Start development server |
| `pnpm run build`   | Build for production     |
| `pnpm run preview` | Preview production build |
| `pnpm run lint`    | Run ESLint               |
| `pnpm run format`  | Run Prettier             |
| `pnpm run check`   | TypeScript type check    |
