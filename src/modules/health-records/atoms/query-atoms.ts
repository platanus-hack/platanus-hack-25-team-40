import { atomWithQuery } from "jotai-tanstack-query";
import { healthRecordsGatewayAtom } from "@/shared/atoms/gateway-atoms";

/**
 * Query atom for fetching all health records
 * Example usage of atomWithQuery with gateway pattern
 */
export const healthRecordsQueryAtom = atomWithQuery((get) => ({
  queryKey: ["health-records"],
  queryFn: async () => {
    const gateway = get(healthRecordsGatewayAtom);
    return gateway.list();
  },
}));

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
