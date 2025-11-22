/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";
import {
  MEDICAL_ANALYSIS_SYSTEM_PROMPT,
  MEDICAL_ANALYSIS_USER_PROMPT,
} from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzePdfRequest {
  file_path: string;
}

interface WorryingMetric {
  metric: string;
  value: string;
  status: string;
  risk_level: "Green" | "Yellow" | "Orange" | "Red";
}

interface AnalyzePdfResponse {
  record_type: string;
  specialty: string;
  event_date: string;
  title: string;
  description_text: string;
  ai_interpretation: {
    interpretation: string;
    worrying_metrics: WorryingMetric[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request
    const { file_path } = (await req.json()) as AnalyzePdfRequest;

    if (!file_path) {
      return new Response(
        JSON.stringify({ error: "file_path is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 2. Initialize Supabase client with user auth context
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      }
    );

    // 3. Download PDF from storage
    console.log(`Downloading PDF: ${file_path}`);
    const { data: pdfData, error: downloadError } = await supabaseClient
      .storage
      .from("health_records")
      .download(file_path);

    if (downloadError || !pdfData) {
      console.error("Storage download error:", downloadError);
      return new Response(
        JSON.stringify({
          error: "Failed to download PDF from storage",
          details: downloadError?.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // 4. Convert PDF to base64
    const arrayBuffer = await pdfData.arrayBuffer();
    const base64Pdf = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    // 5. Send to Claude for analysis using native PDF support
    console.log("Sending PDF to Claude for analysis...");
    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: MEDICAL_ANALYSIS_USER_PROMPT,
            },
          ],
        },
      ],
      system: MEDICAL_ANALYSIS_SYSTEM_PROMPT,
    });

    // 6. Parse Claude's response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Clean potential markdown formatting
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const analysis: AnalyzePdfResponse = JSON.parse(jsonText);

    // 7. Return structured response
    console.log("Analysis complete");
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in analyze-pdf function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze PDF",
        message: error.message,
        stack: error.stack,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

