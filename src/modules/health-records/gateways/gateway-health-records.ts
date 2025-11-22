import type {
  HealthRecord,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
	HealthRecordType,
} from "../types";
import { supabase } from "@/shared/utils/supabase";

/**
 * Gateway for health records data access
 */
export class HealthRecordsGateway {
	async list(userId?: string): Promise<HealthRecord[]> {
		try {
			let query = supabase.from("health_records").select("*").order("event_date", { ascending: false });
			if (userId) {
				query = query.eq("user_id", userId);
			}
			const { data, error } = await query;
			if (error) {
				console.error("Error fetching health_records", error);
				return [];
			}
			return (data || []).map((row) => this.mapRowToDomain(row));
		} catch (e) {
			console.error("Unexpected error in list", e);
			return [];
		}
	}

	async getById(id: string): Promise<HealthRecord | null> {
		const { data, error } = await supabase
			.from("health_records")
			.select("*")
			.eq("id", id)
			.single();
		if (error || !data) {
			console.error("Error fetching health_record", error);
			return null;
		}
		return this.mapRowToDomain(data);
	}

  async create(input: CreateHealthRecordInput): Promise<HealthRecord> {
    const insertPayload = {
      user_id: input.patientId,
      event_date: input.date,
      record_type: input.type,
      title: input.title,
      description_text: input.description,
      specialty: input.specialty,
      file_url: input.fileUrl || null,
    };

		const { data, error } = await supabase
			.from("health_records")
			.insert(insertPayload)
			.select("*")
			.single();

		if (error || !data) {
			console.error("Error inserting health_record", error);
			throw error || new Error("Insert failed");
		}
		return this.mapRowToDomain(data);
	}

  async update(input: UpdateHealthRecordInput): Promise<HealthRecord> {
    const updatePayload: Record<string, unknown> = {};
    if (input.date) updatePayload.event_date = input.date;
    if (input.type) updatePayload.record_type = input.type;
    if (input.title) updatePayload.title = input.title;
    if (input.description) updatePayload.description_text = input.description;
    if (input.specialty) updatePayload.specialty = input.specialty;
    if (input.fileUrl !== undefined) updatePayload.file_url = input.fileUrl;

		const { data, error } = await supabase
			.from("health_records")
			.update(updatePayload)
			.eq("id", input.id)
			.select("*")
			.single();

		if (error || !data) {
			console.error("Error updating health_record", error);
			throw error || new Error("Update failed");
		}
		return this.mapRowToDomain(data);
	}

	async delete(id: string): Promise<void> {
		const { error } = await supabase
			.from("health_records")
			.delete()
			.eq("id", id);
		if (error) {
			console.error("Error deleting health_record", error);
			throw error;
		}
	}

  private mapRowToDomain(row: {
		id: string;
		user_id: string;
		event_date: string;
		record_type: HealthRecordType;
		title?: string | null;
		description_text?: string | null;
		specialty?: string | null;
		file_url?: string | null;
		created_at?: string | null;
	}): HealthRecord {
    return {
      id: row.id,
      patientId: row.user_id,
      date: row.event_date,
      type: row.record_type,
      title: row.title || "Untitled Record",
      description: row.description_text || "",
      specialty: row.specialty || "",
      fileUrl: row.file_url || null,
      status: "active", // Derived, table does not have status
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.created_at || new Date().toISOString(),
    };
  }
}
