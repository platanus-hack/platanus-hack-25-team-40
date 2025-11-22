export interface HealthRecord {
  id: string;
  patientId: string;
  date: string;
  type: "checkup" | "diagnosis" | "prescription" | "lab-result";
  title: string;
  description: string;
  provider: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthRecordInput {
  patientId: string;
  date: string;
  type: HealthRecord["type"];
  title: string;
  description: string;
  provider: string;
}

export interface UpdateHealthRecordInput {
  id: string;
  date?: string;
  type?: HealthRecord["type"];
  title?: string;
  description?: string;
  provider?: string;
  status?: HealthRecord["status"];
}
