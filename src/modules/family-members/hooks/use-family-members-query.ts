import { useAtomValue } from "jotai";
import { familyMembersAtom } from "../atoms/query-atoms";

/**
 * Hook to fetch the list of family members
 */
export function useFamilyMembers() {
  return useAtomValue(familyMembersAtom);
}
