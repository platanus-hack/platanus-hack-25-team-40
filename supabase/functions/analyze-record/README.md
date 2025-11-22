# analyze-record Edge Function

Analyzes medical records (PDFs, Audio recordings, or Text notes) using Claude AI (and Groq for audio transcription) to return structured data optimized for Chilean healthcare.

## Overview

This function processes medical documents in three formats:
- **PDF**: Direct analysis using Claude's native PDF support
- **Audio**: Transcription via Groq Whisper API, then analysis by Claude
- **Text**: Direct analysis of text input

## Endpoint

`POST /functions/v1/analyze-record`

## Request Body

```typescript
interface AnalyzeRecordRequest {
  type: 'pdf' | 'audio' | 'text';
  file_path?: string; // Required for 'pdf' and 'audio'. Path in storage (e.g., "user-id/file.pdf")
  text_content?: string; // Required for 'text'. Direct text input.
}
```

## Request Examples

### PDF Analysis
```json
{
  "type": "pdf",
  "file_path": "user-123/exam.pdf"
}
```

### Audio Analysis
```json
{
  "type": "audio",
  "file_path": "user-123/note.webm"
}
```

### Text Analysis
```json
{
  "type": "text",
  "text_content": "Consulta por dolor abdominal..."
}
```

## Response Structure

```typescript
interface AnalyzeRecordResponse {
  record_type: string;
  specialty: string;
  event_date: string; // YYYY-MM-DD
  title: string;
  description_text: string;
  ai_interpretation: {
    summary: string; // Clear, empathetic explanation for the patient
    detected_conditions: string[]; // List of confirmed diagnoses
    biomarkers: Array<{
      name: string;
      value: number;
      unit: string;
      status: "Normal" | "Alto" | "Bajo";
      reference_range: string;
      risk_level: "Green" | "Yellow" | "Orange" | "Red";
    }>;
    medications_found: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    suggested_actions: Array<{
      title: string;
      reason: string;
      urgency: "low" | "medium" | "high" | "critical";
      category: "screening" | "medication" | "lifestyle" | "follow_up";
      action_type: "schedule_appointment" | "take_medication" | "buy_pharmacy";
    }>;
  };
}
```

## Response Example

```json
{
  "record_type": "LAB_RESULT",
  "specialty": "Cardiología",
  "event_date": "2024-11-20",
  "title": "Examen de Sangre Noviembre 2024",
  "description_text": "Análisis de sangre completo con perfil lipídico y hemograma",
  "ai_interpretation": {
    "summary": "Los resultados muestran que tu colesterol LDL está ligeramente elevado, lo cual requiere atención pero no es urgente. El resto de tus valores están dentro del rango normal.",
    "detected_conditions": [
      "Hipercolesterolemia"
    ],
    "biomarkers": [
      {
        "name": "Colesterol LDL",
        "value": 160,
        "unit": "mg/dL",
        "status": "Alto",
        "reference_range": "70 - 100",
        "risk_level": "Orange"
      },
      {
        "name": "Hemoglobina",
        "value": 14.2,
        "unit": "g/dL",
        "status": "Normal",
        "reference_range": "12.0 - 16.0",
        "risk_level": "Green"
      }
    ],
    "medications_found": [
      {
        "name": "Atorvastatina",
        "dosage": "20 mg",
        "frequency": "una vez al día"
      }
    ],
    "suggested_actions": [
      {
        "title": "Agendar control con cardiólogo",
        "reason": "Colesterol LDL elevado requiere seguimiento",
        "urgency": "medium",
        "category": "follow_up",
        "action_type": "schedule_appointment"
      },
      {
        "title": "Tomar medicamento recetado",
        "reason": "Atorvastatina 20mg para controlar colesterol",
        "urgency": "high",
        "category": "medication",
        "action_type": "take_medication"
      }
    ]
  }
}
```

## Record Types

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

## Error Responses

### 400 Bad Request
Missing required fields:
```json
{
  "error": "type is required (pdf, audio, or text)"
}
```
or
```json
{
  "error": "file_path is required for pdf and audio types"
}
```

### 404 Not Found
File not found in storage:
```json
{
  "error": "Failed to download file: ..."
}
```

### 500 Internal Server Error
Processing error:
```json
{
  "error": "Failed to analyze record",
  "message": "Error details...",
  "stack": "..."
}
```

## Local Testing

### 1. Upload Test Files

**Via Supabase Studio UI:**
- Open `http://localhost:54323` → Storage → `health_records` bucket
- Create folder: `test-user-123`
- Upload your medical PDF or Audio file

**Via CLI:**
```bash
supabase storage cp ./path/to/medical-report.pdf \
  health_records/test-user-123/lab-results.pdf
```

### 2. Test the Function

**Test PDF Analysis:**
```bash
curl -i http://localhost:54321/functions/v1/analyze-record \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pdf",
    "file_path": "test-user-123/lab-results.pdf"
  }'
```

**Test Audio Analysis (Transcription + Analysis):**
```bash
curl -i http://localhost:54321/functions/v1/analyze-record \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "audio",
    "file_path": "test-user-123/doctor-note.webm"
  }'
```

**Test Text Analysis:**
```bash
curl -i http://localhost:54321/functions/v1/analyze-record \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text_content": "Paciente: Juan Pérez. Motivo: Dolor de cabeza persistente y fiebre de 38.5 grados por 3 días. Diagnóstico: Migraña aguda. Tratamiento: Paracetamol 500mg cada 8 horas."
  }'
```

### 3. View Logs

```bash
supabase functions logs analyze-record --follow
```

## Frontend Integration

### Using Supabase Client

```typescript
import { supabase } from '@/shared/utils/supabase';

// Example: Analyze a PDF
const { data, error } = await supabase.functions.invoke('analyze-record', {
  body: {
    type: 'pdf',
    file_path: 'user-123/exam.pdf'
  }
});

// Example: Analyze text directly
const { data, error } = await supabase.functions.invoke('analyze-record', {
  body: {
    type: 'text',
    text_content: 'Doctor notes here...'
  }
});

// Example: Analyze audio (after uploading to storage)
const { data, error } = await supabase.functions.invoke('analyze-record', {
  body: {
    type: 'audio',
    file_path: 'user-123/recording.webm'
  }
});
```

## Notes

- Audio files are transcribed using Groq's Whisper API before analysis
- PDFs are analyzed directly by Claude (native PDF support)
- Text input is analyzed directly by Claude
- Functions run on Deno runtime
- CORS enabled for local development (`*` origin)
- RLS policies respected when using user auth context

