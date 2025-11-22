import type { PatientProfile, UpdatePatientProfileInput } from "../types";
import { supabase } from "@/shared/utils/supabase";

/**
 * Gateway for patient profile data access
 */
export class ProfileGateway {
	async get(userId: string): Promise<PatientProfile | null> {
		try {
			const { data, error } = await supabase
				.from("patient_profiles")
				.select("*")
				.eq("user_id", userId)
				.single();

			if (error) {
				console.error("Error fetching profile:", error);
				return null;
			}

			return data;
		} catch (error) {
			console.error("Error in get:", error);
			return null;
		}
	}

	async update(userId: string, input: UpdatePatientProfileInput): Promise<PatientProfile> {
		try {
			const { data, error } = await supabase
				.from("patient_profiles")
				.update(input)
				.eq("user_id", userId)
				.select()
				.single();

			if (error) {
				console.error("Error updating profile:", error);
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Error in update:", error);
			throw error;
		}
	}

	async upsert(userId: string, input: UpdatePatientProfileInput): Promise<PatientProfile> {
		try {
			const { data, error } = await supabase
				.from("patient_profiles")
				.upsert(
					{
						user_id: userId,
						...input,
					},
					{
						onConflict: "user_id",
					}
				)
				.select()
				.single();

			if (error) {
				console.error("Error upserting profile:", error);
				throw error;
			}

			return data;
		} catch (error) {
			console.error("Error in upsert:", error);
			throw error;
		}
	}
}
