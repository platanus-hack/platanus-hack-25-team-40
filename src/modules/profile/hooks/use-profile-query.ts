import { useAtomValue } from "jotai";
import { profileQueryAtom } from "../atoms/query-atoms";

/**
 * Hook for fetching the current user's profile
 */
export function useProfileQuery() {
	return useAtomValue(profileQueryAtom);
}
