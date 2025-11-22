import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { healthRecordsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import type { HealthRecord, ListHealthRecordsParams } from "../types";

/**
 * Query parameter atoms
 */
export const healthRecordIdAtom = atom<string | null>(null);
export const listParamsAtom = atom<ListHealthRecordsParams | null>(null);

/**
 * List all health records
 */
export const healthRecordsListQueryAtom = atomWithQuery((get) => {
  const gateway = get(healthRecordsGatewayAtom);
  const params = get(listParamsAtom);

  return {
    queryKey: ["health-records", "list", params],
    queryFn: async (): Promise<HealthRecord[]> => {
      if (!gateway) throw new Error("Gateway not available");
      return gateway.list(params ?? undefined);
    },
    enabled: !!gateway,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  };
});

/**
 * Get a single health record by ID
 */
export const healthRecordQueryAtom = atomWithQuery((get) => {
  const gateway = get(healthRecordsGatewayAtom);
  const id = get(healthRecordIdAtom);

  return {
    queryKey: ["health-records", "detail", id],
    queryFn: async (): Promise<HealthRecord> => {
      if (!gateway) throw new Error("Gateway not available");
      if (!id) throw new Error("Record ID not available");
      return gateway.get(id);
    },
    enabled: !!gateway && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  };
});
