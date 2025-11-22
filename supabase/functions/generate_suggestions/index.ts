/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";
import {
  HEALTH_INTELLIGENCE_SYSTEM_PROMPT,
  HEALTH_INTELLIGENCE_USER_PROMPT,
} from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TriggerPayload {
  type: "NEW_RECORD" | "PROFILE_UPDATE";
  user_id: string;
  record_id?: string;
}

interface Suggestion {
  title: string;
  reason: string;
  action_type: string;
  urgency_level: "low" | "medium" | "high" | "critical";
  category: "screening" | "medication" | "lifestyle" | "follow_up";
  validity_end_date?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Setup Supabase Client with Service Role Key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Parse Trigger Payload
    const payload: TriggerPayload = await req.json();
    const { user_id, type } = payload;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`🧠 Intelligence triggered for User ${user_id} via ${type}`);

    // 3. Fetch TARGET USER Context (Profile + All Records)
    const { data: userProfile, error: profileError } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found" - we'll continue anyway
      console.error("Error fetching user profile:", profileError);
    }

    // Fetch all user health records (optimized: only necessary columns)
    const { data: userRecords, error: recordsError } = await supabase
      .from("health_records")
      .select("event_date, specialty, record_type, title, ai_interpretation")
      .eq("user_id", user_id)
      .order("event_date", { ascending: false });

    if (recordsError) {
      console.error("Error fetching user records:", recordsError);
    }

    // 4. Fetch FAMILY Context (Links + Profiles + ALL their Records)
    const { data: familyLinks, error: linksError } = await supabase
      .from("family_links")
      .select("relative_user_id, role")
      .eq("user_id", user_id);

    if (linksError) {
      console.error("Error fetching family links:", linksError);
    }

    const familyContext: any[] = [];

    if (familyLinks && familyLinks.length > 0) {
      for (const link of familyLinks) {
        // Fetch Relative's Profile
        const { data: relativeProfile } = await supabase
          .from("patient_profiles")
          .select(
            "biological_sex, birth_date, chronic_diseases, structured_conditions"
          )
          .eq("user_id", link.relative_user_id)
          .single();

        // Fetch Relative's Health Records (The "Deep Dive" - limit 20 per relative)
        const { data: relativeRecords } = await supabase
          .from("health_records")
          .select("event_date, record_type, ai_interpretation")
          .eq("user_id", link.relative_user_id)
          .order("event_date", { ascending: false })
          .limit(20); // Safety cap to prevent token explosion

        familyContext.push({
          role: link.role,
          profile: relativeProfile,
          records: relativeRecords || [],
        });
      }
    }

    // 5. Construct the data packet for Claude
    const dataPacket = {
      my_profile: userProfile || null,
      my_records: userRecords || [],
      my_family: familyContext,
    };

    const userContextStr = JSON.stringify(dataPacket, null, 2);
    const userPrompt = HEALTH_INTELLIGENCE_USER_PROMPT.replace(
      "{{DATA_PACKET}}",
      userContextStr
    );

    // 6. Call Anthropic (Claude 3.5 Sonnet)
    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
    });

    console.log("Calling Claude for health intelligence analysis...");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: HEALTH_INTELLIGENCE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from potentially chatty response
    let contentText = textContent.text.trim();
    
    // Remove markdown code blocks if present
    if (contentText.startsWith("```json")) {
      contentText = contentText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (contentText.startsWith("```")) {
      contentText = contentText.replace(/```\n?/g, "");
    }

    // Find JSON array boundaries
    const jsonStart = contentText.indexOf("[");
    const jsonEnd = contentText.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No JSON array found in Claude response");
    }

    const cleanJson = JSON.parse(contentText.slice(jsonStart, jsonEnd)) as Suggestion[];

    console.log(`Generated ${cleanJson.length} suggestions`);

    // 7. Save to Database
    if (cleanJson.length > 0) {
      // Delete all non-dismissed suggestions before inserting new ones (prevent duplicates)
      await supabase
        .from("suggestions")
        .delete()
        .eq("user_id", user_id)
        .eq("is_dismissed", false);

      // Map to DB schema
      const dbRows = cleanJson.map((s: Suggestion) => ({
        user_id: user_id,
        title: s.title,
        reason: s.reason,
        action_type: s.action_type,
        urgency_level: s.urgency_level,
        category: s.category,
        validity_end_date: s.validity_end_date || null,
        source_family_id: null, // Could be enhanced to track which family member triggered this
      }));

      // Insert new suggestions
      const { error: insertError } = await supabase
        .from("suggestions")
        .insert(dbRows);

      if (insertError) {
        console.error("Error inserting suggestions:", insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${dbRows.length} suggestions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions_count: cleanJson.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate_suggestions function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate suggestions",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

