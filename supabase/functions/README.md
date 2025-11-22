# Supabase Edge Functions

Deno-based Edge Functions for Oregon Health.

## Structure

```
supabase/functions/
├── analyze-pdf/         # Main PDF analysis function
│   ├── index.ts
│   └── prompts.ts
├── deno.json           # Deno configuration
├── .env                # Environment variables (not committed)
└── README.md           # This file
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
```

## Local Development

1. **Start Supabase locally** (from project root):
   ```bash
   supabase start
   ```

2. **Serve functions**:
   ```bash
   supabase functions serve --env-file ./supabase/functions/.env
   # Or serve specific function:
   supabase functions serve analyze-pdf --env-file ./supabase/functions/.env
   ```

## Testing

### 1. Upload Test PDF

**Via Supabase Studio UI:**
- Open `http://localhost:54323` → Storage → `health_records` bucket
- Create folder: `test-user-123`
- Upload your medical PDF

**Via CLI:**
```bash
supabase storage cp ./path/to/medical-report.pdf \
  health_records/test-user-123/lab-results.pdf
```

### 2. Test the Function

```bash
curl -i http://localhost:54321/functions/v1/analyze-pdf \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"file_path":"test-user-123/lab-results.pdf"}'
```

### 3. View Logs

```bash
supabase functions logs analyze-pdf --follow
```

### Expected Response

**Success (200):**
```json
{
  "record_type": "LAB_RESULT",
  "specialty": "Medicina General",
  "event_date": "2024-11-15",
  "title": "Hemograma Completo",
  "description_text": "Examen de sangre completo...",
  "ai_interpretation": {
    "interpretation": "Los resultados muestran...",
    "worrying_metrics": [...]
  }
}
```

**Common Errors:**
- `400`: Missing `file_path` in request body
- `404`: PDF not found in storage (check path format: `user-id/filename.pdf`, no leading slash)
- `500`: Claude API error (check PDF size <32MB, pages <100, not password-protected)

## Deployment

```bash
# Deploy specific function
supabase functions deploy analyze-pdf

# Set production secrets (don't commit .env!)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...

# View secrets
supabase secrets list
```

## Functions

### analyze-pdf

Analyzes medical PDFs from Supabase Storage using Claude AI and returns structured data optimized for Chilean healthcare.

**Endpoint:** `POST /functions/v1/analyze-pdf`

**Request:**
```json
{
  "file_path": "user-uuid/filename.pdf"
}
```

**Response:**
```json
{
  "record_type": "LAB_RESULT",
  "specialty": "Cardiología",
  "event_date": "2024-11-20",
  "title": "Examen de Sangre Noviembre 2024",
  "description_text": "Análisis de sangre completo...",
  "ai_interpretation": {
    "interpretation": "Los resultados muestran...",
    "worrying_metrics": [
      {
        "metric": "Colesterol LDL",
        "value": "160 mg/dL",
        "status": "Alto",
        "risk_level": "Orange"
      }
    ]
  }
}
```

**Record Types:**
- `LAB_RESULT` - Exámenes de laboratorio
- `IMAGING` - Imágenes médicas (radiografías, TAC, etc.)
- `CONSULTATION` - Consultas médicas
- `PRESCRIPTION` - Recetas médicas
- `EMERGENCY_REPORT` - Informes de urgencia
- `HOSPITALIZATION` - Epicrisis
- `SURGERY_REPORT` - Protocolos operatorios
- `VACCINATION` - Certificados de vacunación
- `MEDICAL_CERTIFICATE` - Certificados/licencias médicas
- `OTHER` - Otros documentos

## Notes

- Functions run on Deno runtime
- CORS enabled for local development (`*` origin)
- RLS policies respected when using user auth context
