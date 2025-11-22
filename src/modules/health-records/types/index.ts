export type HealthRecordType = "checkup" | "diagnosis" | "prescription" | "lab-result";
export type HealthRecordStatus = "active" | "archived";

export interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  type: HealthRecordType;
  title: string;
  description: string;
  specialty: string;
  fileUrl?: string | null;
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
}

export interface UpdateHealthRecordInput {
  id: string;
  date?: string;
  type?: HealthRecordType;
  title?: string;
  description?: string;
  specialty?: string;
  fileUrl?: string | null;
  status?: HealthRecordStatus
}
