# Novellum Setup Guide

This guide describes how to install and setup Novellum for your local development or usage environment. It integrates directly with the Gemini CLI to empower your workflows.

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- Node.js ≥ 20
- pnpm ≥ 9
- (Optional) Gemini CLI globally installed for integrated command-line intelligence

## Getting Started

1. **Clone the repository:**

   ```sh
   git clone <repository-url> novellum
   cd novellum
   ```

2. **Install dependencies:**
   Using pnpm, install all required Node modules.

   ```sh
   pnpm install
   ```

3. **Start the Development Server:**
   Launch the SvelteKit development server.

   ```sh
   pnpm run dev
   ```

4. **Open the Application:**
   Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to view the Novellum Project Hub.

## Available Scripts

For more development tools, standard commands are included:

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint checks
- `pnpm run format` - Format code using Prettier
- `pnpm run check` - Run TypeScript type checking
