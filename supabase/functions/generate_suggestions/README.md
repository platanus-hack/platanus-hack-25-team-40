# Generate Suggestions Edge Function

This Edge Function analyzes user health records and family history to generate personalized health intelligence suggestions.

## Overview

The function is triggered in two ways:
1. **Manually from the frontend** - After health records are created (single or batch uploads)
2. **Automatically via database webhook** - When a patient profile is updated

This approach prevents the "thundering herd" problem during batch uploads (e.g., uploading 5 files would trigger 5 AI calls instead of 1).

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

### 3. Configure Database Webhook (Profile Updates Only)

**Important:** We do NOT use a webhook for `health_records` INSERT to avoid the "thundering herd" problem during batch uploads. Instead, the frontend triggers the function manually after uploads complete.

Only configure a webhook for profile updates:

#### Webhook: Profile Update

Go to Supabase Dashboard → Database → Webhooks and create:

- **Name:** `trigger_suggestions_on_profile_update`
- **Table:** `patient_profiles`
- **Events:** `UPDATE`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions`
- **HTTP Headers:**
  ```text
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

- **Name:** `trigger_suggestions_on_profile_update`
- **Table:** `patient_profiles`
- **Events:** `UPDATE`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions`
- **HTTP Headers:**
  ```text
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

1. **Trigger:** 
   - **Frontend-triggered:** After health records are created (single or batch), the frontend calls the function with `type: "MANUAL"` or `type: "BATCH_UPLOAD"`
   - **Webhook-triggered:** When a patient profile is updated, the webhook calls with `type: "PROFILE_UPDATE"`
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
    "type": "MANUAL",
    "user_id": "[USER_ID]"
  }'
```

Or test a batch upload scenario:

```bash
curl -X POST https://myfznlnsgeimdouvffbe.supabase.co/functions/v1/generate_suggestions \
  -H "Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BATCH_UPLOAD",
    "user_id": "[USER_ID]"
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

## Frontend Integration

The frontend automatically triggers suggestions generation after health records are created. This is handled in `use-create-health-record-with-file.ts` using the `triggerSuggestionsGeneration` utility function.

The function is called in a "fire and forget" manner - it doesn't block the UI, and suggestions appear via Supabase Realtime subscriptions when they're ready.

## Notes

- The function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and read family members' data
- Old suggestions are automatically deleted before inserting new ones (prevents duplicates)
- Family records are limited to 20 per relative to prevent token explosion
- The function is "fire and forget" - it runs asynchronously and doesn't block the UI
- **No webhook on `health_records` INSERT** - This prevents the "thundering herd" problem during batch uploads
- Frontend uses Supabase Realtime to show suggestions as they arrive (10-20 seconds after upload)

