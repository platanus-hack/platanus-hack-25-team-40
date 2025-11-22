import { useAtom } from "jotai";
import { updateProfileMutationAtom, upsertProfileMutationAtom } from "../atoms/mutation-atoms";

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
	const [mutation] = useAtom(updateProfileMutationAtom);
	return mutation;
}

/**
 * Hook for upserting profile (create or update)
 */
export function useUpsertProfile() {
	const [mutation] = useAtom(upsertProfileMutationAtom);
	return mutation;
}
