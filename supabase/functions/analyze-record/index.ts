/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";
import {
  MEDICAL_ANALYSIS_SYSTEM_PROMPT,
  MEDICAL_ANALYSIS_USER_PROMPT,
  AUDIO_TRANSCRIPTION_PROMPT,
} from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRecordRequest {
  type: 'pdf' | 'audio' | 'text';
  file_path?: string; // For PDF or Audio
  text_content?: string; // For direct text notes
}

interface WorryingMetric {
  metric: string;
  value: string;
  status: string;
  risk_level: "Green" | "Yellow" | "Orange" | "Red";
}

interface AnalyzeRecordResponse {
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

/**
 * Transcribe audio using Groq's Whisper API
 */
async function transcribeAudio(audioData: ArrayBuffer, fileName: string = "audio.webm"): Promise<string> {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  // Create FormData for multipart/form-data upload
  const formData = new FormData();
  const audioBlob = new Blob([audioData], { type: "audio/webm" });
  formData.append("file", audioBlob, fileName);
  formData.append("model", "whisper-large-v3");
  formData.append("language", "es"); // Spanish for Chilean context
  formData.append("prompt", AUDIO_TRANSCRIPTION_PROMPT);

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq transcription failed: ${error}`);
  }

  const result = await response.json();
  return result.text || "";
}

/**
 * Download file from Supabase Storage
 */
async function downloadFile(
  supabaseClient: ReturnType<typeof createClient>,
  filePath: string
): Promise<ArrayBuffer> {
  const { data, error } = await supabaseClient
    .storage
    .from("health_records")
    .download(filePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message || "Unknown error"}`);
  }

  return await data.arrayBuffer();
}

/**
 * Analyze text content using Claude
 */
async function analyzeText(text: string): Promise<AnalyzeRecordResponse> {
  const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8192, // Increased for large documents with many biomarkers
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${MEDICAL_ANALYSIS_USER_PROMPT}\n\nContenido del documento:\n${text}`,
          },
        ],
      },
    ],
    system: MEDICAL_ANALYSIS_SYSTEM_PROMPT,
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Clean potential markdown formatting and extract JSON
  let jsonText = textContent.text.trim();
  
  // Remove markdown code blocks
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```\n?/g, "");
  }
  
  // Try to extract JSON object if there's extra text around it
  const jsonStart = jsonText.indexOf("{");
  const jsonEnd = jsonText.lastIndexOf("}") + 1;
  
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    jsonText = jsonText.slice(jsonStart, jsonEnd);
  }
  
  // Log the JSON text for debugging (first 500 chars)
  console.log("Attempting to parse JSON (first 500 chars):", jsonText.substring(0, 500));
  
  try {
    return JSON.parse(jsonText) as AnalyzeRecordResponse;
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("JSON text length:", jsonText.length);
    console.error("JSON text around error position:", jsonText.substring(Math.max(0, 11100), Math.min(jsonText.length, 11200)));
    throw new Error(`Failed to parse Claude's JSON response: ${parseError.message}. Response length: ${jsonText.length} chars. This might indicate the response was truncated due to token limits.`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request
    const { type, file_path, text_content } = (await req.json()) as AnalyzeRecordRequest;

    if (!type) {
      return new Response(
        JSON.stringify({ error: "type is required (pdf, audio, or text)" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate request based on type
    if ((type === 'pdf' || type === 'audio') && !file_path) {
      return new Response(
        JSON.stringify({ error: "file_path is required for pdf and audio types" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (type === 'text' && !text_content) {
      return new Response(
        JSON.stringify({ error: "text_content is required for text type" }),
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

    let textToAnalyze: string;

    // 3. Process input based on type
    if (type === 'text') {
      // Direct text input
      textToAnalyze = text_content!;
      console.log("Processing text input...");
    } else if (type === 'audio') {
      // Download and transcribe audio
      console.log(`Downloading audio: ${file_path}`);
      const audioData = await downloadFile(supabaseClient, file_path!);
      console.log("Transcribing audio with Groq...");
      const fileName = file_path!.split('/').pop() || "audio.webm";
      textToAnalyze = await transcribeAudio(audioData, fileName);
      console.log("Transcription complete");
    } else {
      // PDF: Download and convert to base64 for Claude's native PDF support
      console.log(`Downloading PDF: ${file_path}`);
      const pdfData = await downloadFile(supabaseClient, file_path!);
      
      // Convert ArrayBuffer to base64 in chunks to avoid call stack overflow
      const uint8Array = new Uint8Array(pdfData);
      let binaryString = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      const base64Pdf = btoa(binaryString);

      // Send PDF directly to Claude (it supports PDF natively)
      console.log("Sending PDF to Claude for analysis...");
      const anthropic = new Anthropic({
        apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192, // Increased for large documents with many biomarkers
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

      const textContent = message.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text response from Claude");
      }

      // Clean potential markdown formatting and extract JSON
      let jsonText = textContent.text.trim();
      
      // Remove markdown code blocks
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }
      
      // Try to extract JSON object if there's extra text around it
      const jsonStart = jsonText.indexOf("{");
      const jsonEnd = jsonText.lastIndexOf("}") + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.slice(jsonStart, jsonEnd);
      }
      
      // Log the JSON text for debugging (first 500 chars)
      console.log("Attempting to parse JSON (first 500 chars):", jsonText.substring(0, 500));
      
      let analysis: AnalyzeRecordResponse;
      try {
        analysis = JSON.parse(jsonText) as AnalyzeRecordResponse;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("JSON text length:", jsonText.length);
        console.error("JSON text around error position:", jsonText.substring(Math.max(0, 11100), Math.min(jsonText.length, 11200)));
        throw new Error(`Failed to parse Claude's JSON response: ${parseError.message}. Response length: ${jsonText.length} chars. This might indicate the response was truncated due to token limits.`);
      }
      console.log("Analysis complete");
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 4. Analyze text (for audio transcription or direct text input)
    console.log("Analyzing text with Claude...");
    const analysis = await analyzeText(textToAnalyze);

    // 5. Return structured response
    console.log("Analysis complete");
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in analyze-record function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze record",
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

