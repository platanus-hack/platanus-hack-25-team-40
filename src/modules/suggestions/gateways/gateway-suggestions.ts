import type {
  Suggestion,
  DismissSuggestionInput,
  AcknowledgeSuggestionInput,
  ActionType,
  SuggestionCategory,
  UrgencyLevel,
} from "../types";
import { supabase } from "@/shared/utils/supabase";

/**
 * Gateway for suggestions data access
 */
export class SuggestionsGateway {
  async list(userId?: string): Promise<Suggestion[]> {
    try {
      let query = supabase
        .from("suggestions")
        .select("*")
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching suggestions", error);
        return [];
      }
      return (data || []).map((row) => this.mapRowToDomain(row));
    } catch (e) {
      console.error("Unexpected error in list", e);
      return [];
    }
  }

  async getById(id: string): Promise<Suggestion | null> {
    const { data, error } = await supabase
      .from("suggestions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching suggestion", error);
      return null;
    }
    return this.mapRowToDomain(data);
  }

  async dismiss(input: DismissSuggestionInput): Promise<Suggestion> {
    const { data, error } = await supabase
      .from("suggestions")
      .update({ is_dismissed: input.isDismissed })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Error updating suggestion", error);
      throw error || new Error("Update failed");
    }
    return this.mapRowToDomain(data);
  }

  async acknowledge(input: AcknowledgeSuggestionInput): Promise<Suggestion> {
    const { data, error } = await supabase
      .from("suggestions")
      .update({ acknowledged_at: input.acknowledgedAt })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Error acknowledging suggestion", error);
      throw error || new Error("Acknowledge failed");
    }
    return this.mapRowToDomain(data);
  }

  private mapRowToDomain(row: {
    id: string;
    user_id: string;
    title: string;
    reason: string | null;
    action_type: string | null;
    urgency_level: string | null;
    category: string | null;
    validity_end_date: string | null;
    source_family_id: string | null;
    source_records?: Array<{
      record_id: string | null;
      label: string;
      relation?: string | null;
    }>;
    acknowledged_at: string | null;
    snoozed_until: string | null;
    scheduled_for: string | null;
    scheduled_event_url: string | null;
    is_dismissed: boolean;
    created_at: string | null;
  }): Suggestion {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      reason: row.reason,
      actionType: (row.action_type as ActionType | null) ?? null,
      urgencyLevel: (row.urgency_level as UrgencyLevel | null) ?? null,
      category: (row.category as SuggestionCategory | null) ?? null,
      validityEndDate: row.validity_end_date,
      sourceFamilyId: row.source_family_id,
      sourceRecords:
        row.source_records?.map((source) => ({
          recordId: source.record_id,
          label: source.label,
          relation: source.relation,
        })) ?? [],
      acknowledgedAt: row.acknowledged_at,
      snoozedUntil: row.snoozed_until,
      scheduledFor: row.scheduled_for,
      scheduledEventUrl: row.scheduled_event_url,
      isDismissed: row.is_dismissed,
      createdAt: row.created_at || new Date().toISOString(),
    };
  }
}

