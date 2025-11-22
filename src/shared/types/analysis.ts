export interface WorryingMetric {
  metric: string;
  value: string;
  status: string;
  risk_level: "Green" | "Yellow" | "Orange" | "Red";
}

export interface AnalyzeRecordResponse {
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

export interface AnalyzeRecordRequest {
  type: 'pdf' | 'audio' | 'text';
  file_path?: string; // For PDF or Audio
  text_content?: string; // For direct text notes
}

