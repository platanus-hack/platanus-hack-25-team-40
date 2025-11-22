# Oregon Health - Generational Health OS

A modern health management platform built with React, TypeScript, Vite, and Supabase.

## Tech Stack

- **React 19** - UI library with React Compiler
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS v4** - Styling with @tailwindcss/vite
- **shadcn/ui** - Component library (New York style)
- **Supabase** - Backend and database
- **Jotai** - State management
- **TanStack Query** - Server state management
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Oregon-He/web-app.git
cd web-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env` with your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

4. Start the dev server:
```bash
pnpm dev
```

5. Open http://localhost:5173

## Project Structure

```
src/
├── shared/
│   ├── ui/          # shadcn components
│   ├── utils/       # Utilities (supabase client, cn helper)
│   └── providers/   # App providers (Jotai, TanStack Query)
├── App.tsx          # Main landing page
└── main.tsx         # Entry point
```

## Environment Variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed documentation.

## Available Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Contributing

See the branch: `feature/add-supabase` for the latest development work.
