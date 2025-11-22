import type { Database } from "@/shared/types/database.types";

export type PatientProfile = Database["public"]["Tables"]["patient_profiles"]["Row"];
export type UpdatePatientProfileInput = Database["public"]["Tables"]["patient_profiles"]["Update"];
