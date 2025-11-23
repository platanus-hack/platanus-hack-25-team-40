import type {
	HealthRecord,
	CreateHealthRecordInput,
	UpdateHealthRecordInput,
	HealthRecordType,
	AIInterpretation,
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
		const insertPayload: Record<string, unknown> = {
			user_id: input.patientId,
			event_date: input.date,
			record_type: input.type,
			title: input.title,
			description_text: input.description,
			specialty: input.specialty,
			file_url: input.fileUrl || null,
		};
		if (input.aiInterpretation) {
			insertPayload.ai_interpretation = this.toDbAiInterpretation(input.aiInterpretation);
		}

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
		if (input.aiInterpretation !== undefined) {
			updatePayload.ai_interpretation = input.aiInterpretation
				? this.toDbAiInterpretation(input.aiInterpretation)
				: null;
		}

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

	/**
	 * Generate a signed URL for a stored health record file.
	 * Accepts a fileUrl fragment that may optionally include the bucket prefix.
	 */
	async getSignedUrl(fileUrlFragment: string, expiresInSeconds = 3600): Promise<string | null> {
		if (!fileUrlFragment) return null;
		// Normalize path: remove leading bucket prefix if present.
		const normalized = fileUrlFragment.startsWith("health_records/")
			? fileUrlFragment.replace(/^health_records\//, "")
			: fileUrlFragment.replace(/^\//, "");
		try {
			const { data, error } = await supabase.storage
				.from("health_records")
				.createSignedUrl(normalized, expiresInSeconds);
			if (error || !data?.signedUrl) {
				console.error("Failed to create signed URL", error);
				return null;
			}
			return data.signedUrl;
		} catch (e) {
			console.error("Unexpected error generating signed URL", e);
			return null;
		}
	}

	/**
	 * Get a public URL for a file in the health_records bucket (bucket must be public).
	 */
	getPublicUrl(fileUrlFragment: string | null | undefined): string | null {
		if (!fileUrlFragment) return null;
		const normalized = fileUrlFragment.startsWith("health_records/")
			? fileUrlFragment.replace(/^health_records\//, "")
			: fileUrlFragment.replace(/^\//, "");
		try {
			const { data } = supabase.storage.from("health_records").getPublicUrl(normalized);
			return data?.publicUrl || null;
		} catch (e) {
			console.error("Error building public URL", e);
			return null;
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
		ai_interpretation?: any | null;
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
			aiInterpretation: row.ai_interpretation ? this.fromDbAiInterpretation(row.ai_interpretation) : null,
      status: "active", // Derived, table does not have status
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.created_at || new Date().toISOString(),
    };
  }

	private fromDbAiInterpretation(raw: any): AIInterpretation {
		return {
			summary: raw.summary || "",
			detectedConditions: raw.detected_conditions || [],
			biomarkers: (raw.biomarkers || []).map((b: any) => ({
				name: b.name || "",
				value: typeof b.value === 'number' ? b.value : Number(b.value) || 0,
				unit: b.unit || "",
				status: b.status || "",
				referenceRange: b.reference_range || "",
				riskLevel: b.risk_level || "",
			})),
			medicationsFound: raw.medications_found || [],
			suggestedActions: (raw.suggested_actions || []).map((a: any) => ({
				title: a.title || "",
				reason: a.reason || "",
				urgency: a.urgency || "",
				category: a.category || "",
				actionType: a.action_type || "",
			})),
		};
	}

	private toDbAiInterpretation(ai: AIInterpretation) {
		return {
			summary: ai.summary,
			detected_conditions: ai.detectedConditions,
			biomarkers: ai.biomarkers.map(b => ({
				name: b.name,
				value: b.value,
				unit: b.unit,
				status: b.status,
				reference_range: b.referenceRange,
				risk_level: b.riskLevel,
			})),
			medications_found: ai.medicationsFound,
			suggested_actions: ai.suggestedActions.map(a => ({
				title: a.title,
				reason: a.reason,
				urgency: a.urgency,
				category: a.category,
				action_type: a.actionType,
			})),
		};
	}
}
