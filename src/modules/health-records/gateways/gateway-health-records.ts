import type {
	HealthRecord,
	CreateHealthRecordInput,
	UpdateHealthRecordInput,
} from "../types";

/**
 * Gateway for health records data access
 * This is a mock implementation - replace with Supabase calls
 */
export class HealthRecordsGateway {
	async list(): Promise<HealthRecord[]> {
		// TODO: Replace with Supabase query
		// const { data, error } = await supabase
		//   .from('health_records')
		//   .select('*')
		//   .order('date', { ascending: false });

		// Mock data for example
		await new Promise((resolve) => setTimeout(resolve, 500));
		return [
			{
				id: "1",
				patientId: "patient-1",
				date: "2024-01-15",
				type: "checkup",
				title: "Annual Physical Exam",
				description: "Routine checkup with blood work",
				provider: "Dr. Smith",
				status: "active",
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
			},
		];
	}

	async getById(id: string): Promise<HealthRecord | null> {
		// TODO: Replace with Supabase query
		// const { data, error } = await supabase
		//   .from('health_records')
		//   .select('*')
		//   .eq('id', id)
		//   .single();

		await new Promise((resolve) => setTimeout(resolve, 300));
		const records = await this.list();
		return records.find((r) => r.id === id) || null;
	}

	async create(input: CreateHealthRecordInput): Promise<HealthRecord> {
		// TODO: Replace with Supabase insert
		// const { data, error } = await supabase
		//   .from('health_records')
		//   .insert(input)
		//   .select()
		//   .single();

		await new Promise((resolve) => setTimeout(resolve, 500));
		const now = new Date().toISOString();
		return {
			id: Math.random().toString(36).substr(2, 9),
			...input,
			status: "active",
			createdAt: now,
			updatedAt: now,
		};
	}

	async update(input: UpdateHealthRecordInput): Promise<HealthRecord> {
		// TODO: Replace with Supabase update
		// const { data, error } = await supabase
		//   .from('health_records')
		//   .update(input)
		//   .eq('id', input.id)
		//   .select()
		//   .single();

		await new Promise((resolve) => setTimeout(resolve, 500));
		const existing = await this.getById(input.id);
		if (!existing) {
			throw new Error(`Health record ${input.id} not found`);
		}
		return {
			...existing,
			...input,
			updatedAt: new Date().toISOString(),
		};
	}

	async delete(id: string): Promise<void> {
		// TODO: Replace with Supabase delete
		// const { error } = await supabase
		//   .from('health_records')
		//   .delete()
		//   .eq('id', id);

		await new Promise((resolve) => setTimeout(resolve, 500));
		console.log(`Deleted health record ${id}`);
	}
}
