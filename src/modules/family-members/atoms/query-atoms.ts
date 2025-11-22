import { atomWithQuery } from "jotai-tanstack-query";
import { gatewayFamilyMembersAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";

/**
 * Atom for fetching family members list
 */
export const familyMembersAtom = atomWithQuery((get) => {
  const gateway = get(gatewayFamilyMembersAtom);
  const session = get(sessionAtom);
  const userId = session?.user?.id;

  return {
    queryKey: ["family-members", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return gateway.list(userId);
    },
    enabled: !!userId,
  };
});
