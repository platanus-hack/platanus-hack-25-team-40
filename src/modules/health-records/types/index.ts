export interface HealthRecord {
  id: string;
  user_id: string;
  record_type: string;
  specialty: string | null;
  event_date: string;
  title: string | null;
  description_text: string | null;
  file_url: string | null;
  ai_interpretation: Record<string, any> | null;
  created_at: string;
}

export interface CreateHealthRecordInput {
  user_id: string;
  record_type: string;
  specialty?: string;
  event_date: string;
  title?: string;
  description_text?: string;
  file_url?: string;
  ai_interpretation?: Record<string, any>;
}

export interface UpdateHealthRecordInput {
  id: string;
  record_type?: string;
  specialty?: string;
  event_date?: string;
  title?: string;
  description_text?: string;
  file_url?: string;
  ai_interpretation?: Record<string, any>;
}
