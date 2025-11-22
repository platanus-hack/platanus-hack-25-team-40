import { atomWithMutation } from "jotai-tanstack-query";
import { healthRecordsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import type {
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from "../types";

/**
 * Mutation atom for creating a health record
 * Example usage of atomWithMutation with gateway pattern
 */
export const createHealthRecordMutationAtom = atomWithMutation((get) => ({
  mutationKey: ["create-health-record"],
  mutationFn: async (input: CreateHealthRecordInput) => {
    const gateway = get(healthRecordsGatewayAtom);
    return gateway.create(input);
  },
}));

/**
 * Mutation atom for updating a health record
 */
export const updateHealthRecordMutationAtom = atomWithMutation((get) => ({
  mutationKey: ["update-health-record"],
  mutationFn: async (input: UpdateHealthRecordInput) => {
    const gateway = get(healthRecordsGatewayAtom);
    return gateway.update(input);
  },
}));

/**
 * Mutation atom for deleting a health record
 */
export const deleteHealthRecordMutationAtom = atomWithMutation((get) => ({
  mutationKey: ["delete-health-record"],
  mutationFn: async (id: string) => {
    const gateway = get(healthRecordsGatewayAtom);
    return gateway.delete(id);
  },
}));
