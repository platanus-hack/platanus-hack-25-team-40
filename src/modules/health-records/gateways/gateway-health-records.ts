import type {
	HealthRecord,
	CreateHealthRecordInput,
	UpdateHealthRecordInput,
} from "../types";
import { supabase } from "@/shared/utils/supabase";

/**
 * Gateway for health records data access
 */
export class HealthRecordsGateway {
	async list(userId: string): Promise<HealthRecord[]> {
		try {
			const { data, error } = await supabase
				.from('health_records')
				.select('*')
				.eq('user_id', userId)
				.order('event_date', { ascending: false });

			if (error) {
				console.error('Error fetching health records:', error);
				return [];
			}

			return data || [];
		} catch (error) {
			console.error('Error in list:', error);
			return [];
		}
	}

	async getById(id: string): Promise<HealthRecord | null> {
		try {
			const { data, error } = await supabase
				.from('health_records')
				.select('*')
				.eq('id', id)
				.single();

			if (error) {
				console.error('Error fetching health record:', error);
				return null;
			}

			return data;
		} catch (error) {
			console.error('Error in getById:', error);
			return null;
		}
	}

	async create(input: CreateHealthRecordInput): Promise<HealthRecord> {
		try {
			const { data, error } = await supabase
				.from('health_records')
				.insert(input)
				.select()
				.single();

			if (error) {
				console.error('Error creating health record:', error);
				throw error;
			}

			return data;
		} catch (error) {
			console.error('Error in create:', error);
			throw error;
		}
	}

	async update(input: UpdateHealthRecordInput): Promise<HealthRecord> {
		try {
			const { id, ...updateData } = input;
			const { data, error } = await supabase
				.from('health_records')
				.update(updateData)
				.eq('id', id)
				.select()
				.single();

			if (error) {
				console.error('Error updating health record:', error);
				throw error;
			}

			return data;
		} catch (error) {
			console.error('Error in update:', error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			const { error } = await supabase
				.from('health_records')
				.delete()
				.eq('id', id);

			if (error) {
				console.error('Error deleting health record:', error);
				throw error;
			}
		} catch (error) {
			console.error('Error in delete:', error);
			throw error;
		}
	}
}
