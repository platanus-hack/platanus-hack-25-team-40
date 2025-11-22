import { supabase } from "@/shared/utils/supabase";

/**
 * Triggers the generate_suggestions edge function in a fire-and-forget manner.
 * This is called after health records are created (single or batch) to generate
 * AI-powered suggestions based on the updated health data.
 * 
 * @param userId - The user ID to generate suggestions for
 * @param type - The type of trigger (MANUAL for frontend-triggered, BATCH_UPLOAD for batch operations)
 */
export async function triggerSuggestionsGeneration(
  userId: string,
  type: "MANUAL" | "BATCH_UPLOAD" = "MANUAL"
): Promise<void> {
  try {
    // Fire and forget - we don't await this to avoid blocking the UI
    supabase.functions.invoke("generate_suggestions", {
      body: {
        type,
        user_id: userId,
      },
    }).catch((error) => {
      // Silently log errors - we don't want to interrupt the user flow
      console.error("Failed to trigger suggestions generation:", error);
    });
  } catch (error) {
    // Silently log errors - we don't want to interrupt the user flow
    console.error("Error triggering suggestions generation:", error);
  }
}

