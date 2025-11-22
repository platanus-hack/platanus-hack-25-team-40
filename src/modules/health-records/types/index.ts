export type HealthRecordType = "checkup" | "diagnosis" | "prescription" | "lab-result";
export type HealthRecordStatus = "active" | "archived";

// Structured AI interpretation model derived from edge function response
export interface AIInterpretationBiomarker {
  name: string;
  value: number;
  unit: string;
  status: string; // e.g. Normal, High, Low
  referenceRange: string;
  riskLevel: string; // e.g. Green, Yellow, Red
}

export interface AIInterpretationSuggestedAction {
  title: string;
  reason: string;
  urgency: string; // low | medium | high (string to keep flexible)
  category: string; // follow_up | lifestyle | etc
  actionType: string; // schedule_appointment | lifestyle_modification | etc
}

export interface AIInterpretation {
  summary: string;
  detectedConditions: string[];
  biomarkers: AIInterpretationBiomarker[];
  medicationsFound: string[];
  suggestedActions: AIInterpretationSuggestedAction[];
}

export interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  type: HealthRecordType;
  title: string;
  description: string;
  specialty: string;
  fileUrl?: string | null;
  aiInterpretation?: AIInterpretation | null;
  status: HealthRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthRecordInput {
  patientId: string;
  date: string;
  type: HealthRecordType;
  title: string;
  description: string;
  specialty: string;
  fileUrl?: string | null;
  aiInterpretation?: AIInterpretation | null;
}

export interface UpdateHealthRecordInput {
  id: string;
  date?: string;
  type?: HealthRecordType;
  title?: string;
  description?: string;
  specialty?: string;
  fileUrl?: string | null;
  aiInterpretation?: AIInterpretation | null;
  status?: HealthRecordStatus
}
