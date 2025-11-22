// Health Record Types

export interface HealthRecord {
  id: string;
  patientId: string;
  category: "Cardiology" | "Blood Work" | "Oncology" | "General" | "Other";
  title: string;
  date: Date;
  doctor?: string;
  hospital?: string;
  fileUrl?: string;
  summary?: string;
  aiTranslation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHealthRecordInput {
  patientId: string;
  category: HealthRecord["category"];
  title: string;
  date: Date;
  doctor?: string;
  hospital?: string;
  fileUrl?: string;
}

export interface UpdateHealthRecordInput {
  id: string;
  title?: string;
  category?: HealthRecord["category"];
  date?: Date;
  doctor?: string;
  hospital?: string;
  summary?: string;
  aiTranslation?: string;
}

export interface ListHealthRecordsParams {
  patientId?: string;
  category?: HealthRecord["category"];
  startDate?: Date;
  endDate?: Date;
}
