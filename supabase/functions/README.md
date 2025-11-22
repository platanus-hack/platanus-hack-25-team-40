# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the Family Health OS MVP.

## Structure

```
supabase/functions/
├── analyze-pdf/         # Main PDF analysis function
│   └── index.ts
├── deno.json           # Deno configuration
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Local Development

### Prerequisites

- Install [Supabase CLI](https://supabase.com/docs/guides/cli)
- Install [Deno](https://deno.land/) (optional, Supabase CLI includes it)

### Setup

1. Copy environment variables:
   ```bash
   cd supabase/functions
   cp .env.example .env
   # Edit .env with your actual keys
   ```

2. Start Supabase locally (from project root):
   ```bash
   supabase start
   ```

3. Serve functions locally:
   ```bash
   supabase functions serve --env-file ./supabase/functions/.env
   ```

4. Or serve a specific function:
   ```bash
   supabase functions serve analyze-pdf --env-file ./supabase/functions/.env
   ```

### Testing

Test the function locally:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-pdf' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"file_path":"health_records/test.pdf"}'
```

## Deployment

Deploy to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy analyze-pdf

# Set environment variables (production)
supabase secrets set ANTHROPIC_API_KEY=your-key-here
```

## Functions

### analyze-pdf

**Purpose:** Download a PDF from Supabase Storage, extract text, analyze with Claude AI, and return structured medical data.

**Endpoint:** `POST /functions/v1/analyze-pdf`

**Request Body:**
```json
{
  "file_path": "health_records/user-id/filename.pdf"
}
```

**Response:**
```json
{
  "record_type": "LAB_RESULT",
  "specialty": "Cardiology",
  "event_date": "2024-11-20",
  "title": "Blood Work Nov 2024",
  "description_text": "Análisis de sangre completo...",
  "ai_interpretation": "Interpretación detallada...",
  "worrying_metrics": [
    {
      "metric": "LDL Cholesterol",
      "value": "160 mg/dL",
      "status": "High",
      "risk_level": "Red"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (use carefully) | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |

## Notes

- Functions run on Deno runtime
- CORS is enabled for local development (`*` origin)
- RLS policies are respected when using user auth context
- For hackathon purposes, you may use service role key if needed


