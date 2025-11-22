# Generate Suggestions Edge Function

This Edge Function analyzes user health records and family history to generate personalized health intelligence suggestions.

## Overview

The function is triggered automatically via Supabase Database Webhooks when:
- A new health record is inserted
- A patient profile is updated

It collects comprehensive health data (user profile, all records, family members' profiles and records) and sends it to Claude AI for analysis.

## Setup

### 1. Deploy the Function

```bash
supabase functions deploy generate_suggestions
```

### 2. Configure Environment Variables

The function requires these environment variables (set in Supabase Dashboard → Edge Functions → Secrets):

- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase (required to bypass RLS and read family data)
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude

### 3. Configure Database Webhooks

Go to Supabase Dashboard → Database → Webhooks and create two webhooks:

#### Webhook 1: New Health Record

- **Name:** `trigger_suggestions_on_new_record`
- **Table:** `health_records`
- **Events:** `INSERT`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions`
- **HTTP Headers:**
  ```
  Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "type": "NEW_RECORD",
    "user_id": "{{record.user_id}}",
    "record_id": "{{record.id}}"
  }
  ```

#### Webhook 2: Profile Update

- **Name:** `trigger_suggestions_on_profile_update`
- **Table:** `patient_profiles`
- **Events:** `UPDATE`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions`
- **HTTP Headers:**
  ```
  Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "type": "PROFILE_UPDATE",
    "user_id": "{{record.user_id}}"
  }
  ```

**Note:** Replace `[YOUR_SERVICE_ROLE_KEY]` with your actual service role key from Supabase Dashboard → Settings → API.

## How It Works

1. **Trigger:** Webhook fires when a health record is added or profile is updated
2. **Data Collection:**
   - Fetches target user's profile and all health records
   - Fetches all family links
   - For each family member: fetches profile and recent records (limit 20 per relative)
3. **AI Analysis:** Sends comprehensive data packet to Claude 3.5 Sonnet
4. **Output:** Claude returns structured JSON array of suggestions
5. **Storage:** Deletes old non-dismissed suggestions and inserts new ones

## Testing

### Manual Test

You can manually trigger the function for testing:

```bash
curl -X POST https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions \
  -H "Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NEW_RECORD",
    "user_id": "[USER_ID]",
    "record_id": "[RECORD_ID]"
  }'
```

### Check Logs

View function logs in Supabase Dashboard → Edge Functions → generate_suggestions → Logs

## Output Schema

The function generates suggestions with the following structure:

```typescript
{
  title: string;
  reason: string;
  action_type: "schedule_exam" | "update_profile" | "lifestyle_change" | "medication_review" | "follow_up_test";
  urgency_level: "low" | "medium" | "high" | "critical";
  category: "screening" | "medication" | "lifestyle" | "follow_up";
  validity_end_date?: string; // YYYY-MM-DD format
}
```

## Notes

- The function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and read family members' data
- Old suggestions are automatically deleted before inserting new ones (prevents duplicates)
- Family records are limited to 20 per relative to prevent token explosion
- The function is "fire and forget" - it runs asynchronously after triggers

