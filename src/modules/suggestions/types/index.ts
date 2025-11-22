export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type SuggestionCategory = "screening" | "medication" | "lifestyle" | "follow_up";
export type ActionType = "schedule_exam" | "update_profile" | "lifestyle_change" | "medication_review" | "follow_up_test";

export interface SuggestionSourceRecord {
  recordId: string | null;
  label: string;
  relation?: string | null;
}

export interface Suggestion {
  id: string;
  userId: string;
  title: string;
  reason: string | null;
  actionType: ActionType | null;
  urgencyLevel: UrgencyLevel | null;
  category: SuggestionCategory | null;
  validityEndDate: string | null;
  sourceFamilyId: string | null;
  sourceRecords: SuggestionSourceRecord[];
  acknowledgedAt: string | null;
  snoozedUntil: string | null;
  scheduledFor: string | null;
  scheduledEventUrl: string | null;
  isDismissed: boolean;
  createdAt: string;
}

export interface DismissSuggestionInput {
  id: string;
  isDismissed: boolean;
}

export interface AcknowledgeSuggestionInput {
  id: string;
  acknowledgedAt: string | null;
}

