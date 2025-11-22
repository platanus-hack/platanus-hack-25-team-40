# Environment Setup

## Quick Start

1. Create `.env` in the project root with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Get credentials from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

3. Start dev server: `pnpm dev`

## Usage

Import the Supabase client in your components:

```typescript
import { supabase } from "@/shared/utils/supabase";

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

## TypeScript Support

Environment variables are typed in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}
```

## Adding New Variables

1. Add to `.env`: `VITE_YOUR_VAR=value`
2. Add TypeScript type in `src/vite-env.d.ts`
3. Restart dev server

## Notes

- `.env` is gitignored - never commit it
- Only `VITE_` prefixed variables are exposed to client
- `VITE_APP_VERSION` is auto-injected from package.json
- Supabase anon key is safe to expose (protected by RLS)

## Security

✓ **Safe to expose:**
- `VITE_SUPABASE_URL` (public URL)
- `VITE_SUPABASE_ANON_KEY` (protected by Row Level Security)

✗ **Never expose (don't use VITE_ prefix):**
- Database passwords
- Service role keys
- API secrets
