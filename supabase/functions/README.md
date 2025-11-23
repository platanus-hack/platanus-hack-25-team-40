# Supabase Edge Functions

Deno-based Edge Functions for Oregon Health.

## Structure

```
supabase/functions/
├── analyze-record/          # Health record analysis function
│   ├── index.ts
│   ├── prompts.ts
│   └── README.md            # Function-specific documentation
├── generate_suggestions/    # AI health intelligence suggestions
│   ├── index.ts
│   ├── prompts.ts
│   └── README.md            # Function-specific documentation
├── deno.json                # Deno configuration
├── .env                     # Environment variables (not committed)
└── README.md                # This file
```

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Deno (optional, Supabase CLI includes it)

## Environment Setup

Create a `.env` file in `supabase/functions/`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
GROQ_API_KEY=gsk_...
```

## Local Development

1. **Start Supabase locally** (from project root):
   ```bash
   supabase start
   ```

2. **Serve functions**:
   ```bash
   # Serve all functions
   supabase functions serve --env-file ./supabase/functions/.env --no-verify-jwt
   
   # Or serve specific function:
   supabase functions serve analyze-record --env-file ./supabase/functions/.env --no-verify-jwt
   supabase functions serve generate_suggestions --env-file ./supabase/functions/.env --no-verify-jwt
   ```

## Deployment

```bash
# Deploy specific function
supabase functions deploy analyze-record
supabase functions deploy generate_suggestions

# Set production secrets (don't commit .env!)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set GROQ_API_KEY=gsk_...

# View secrets
supabase secrets list
```

## Functions

### analyze-record

Analyzes medical records (PDFs, Images, Audio recordings, or Text notes) using Claude AI (and Groq for audio transcription) to return structured data optimized for Chilean healthcare.

**See:** [`analyze-record/README.md`](./analyze-record/README.md) for full documentation.

**Endpoint:** `POST /functions/v1/analyze-record`

### generate_suggestions

AI-powered health intelligence system that analyzes user health records and family history to generate personalized suggestions. Automatically triggered via database webhooks.

**See:** [`generate_suggestions/README.md`](./generate_suggestions/README.md) for full documentation.

**Endpoint:** `POST /functions/v1/generate_suggestions`

## General Notes

- Functions run on Deno runtime
- CORS enabled for local development (`*` origin)
- RLS policies respected when using user auth context
- Service role key used when bypassing RLS is required
