import { atomWithQuery } from "jotai-tanstack-query";
import { healthRecordsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";

/**
 * Query atom for fetching all health records
 * Example usage of atomWithQuery with gateway pattern
 */
export const healthRecordsQueryAtom = atomWithQuery((get) => {
  const gateway = get(healthRecordsGatewayAtom);
  const session = get(sessionAtom);
  const userId = session?.user?.id;

  return {
    queryKey: ["health-records", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return gateway.list(userId);
    },
    enabled: !!userId,
  };
});

/**
 * Query atom for fetching a single health record by ID
 * Example of parameterized query atom
 */
export const healthRecordByIdQueryAtom = (id: string) =>
  atomWithQuery((get) => ({
    queryKey: ["health-record", id],
    queryFn: async () => {
      const gateway = get(healthRecordsGatewayAtom);
      return gateway.getById(id);
    },
    enabled: !!id,
  }));
