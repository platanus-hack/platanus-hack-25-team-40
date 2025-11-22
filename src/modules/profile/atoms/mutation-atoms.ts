import { atom } from "jotai";
import { atomWithMutation } from "jotai-tanstack-query";
import { profileGatewayAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";
import type { UpdatePatientProfileInput } from "../types";

/**
 * Mutation atom for updating profile
 */
export const updateProfileMutationAtom = atomWithMutation((get) => {
	const gateway = get(profileGatewayAtom);
	const session = get(sessionAtom);
	const userId = session?.user?.id;

	return {
		mutationKey: ["update-profile"],
		mutationFn: async (input: UpdatePatientProfileInput) => {
			if (!userId) {
				throw new Error("User not authenticated");
			}
			return gateway.update(userId, input);
		},
	};
});

/**
 * Mutation atom for upserting profile (create or update)
 */
export const upsertProfileMutationAtom = atomWithMutation((get) => {
	const gateway = get(profileGatewayAtom);
	const session = get(sessionAtom);
	const userId = session?.user?.id;

	return {
		mutationKey: ["upsert-profile"],
		mutationFn: async (input: UpdatePatientProfileInput) => {
			if (!userId) {
				throw new Error("User not authenticated");
			}
			return gateway.upsert(userId, input);
		},
	};
});
