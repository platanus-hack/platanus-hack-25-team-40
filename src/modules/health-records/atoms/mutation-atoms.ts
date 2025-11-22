import { atomWithMutation } from "jotai-tanstack-query";
import { healthRecordsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import { queryClient } from "@/shared/providers/app-provider";
import type {
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from "../types";

/**
 * Create a new health record
 */
export const createHealthRecordMutationAtom = atomWithMutation(
  (get) => {
    const gateway = get(healthRecordsGatewayAtom);

    return {
      mutationFn: async (input: CreateHealthRecordInput) => {
        if (!gateway) throw new Error("Gateway not available");
        return gateway.create(input);
      },
      onSuccess: () => {
        // Invalidate all list queries to refetch
        queryClient.invalidateQueries({ queryKey: ["health-records", "list"] });
      },
      onError: (error) => {
        console.error("Create health record failed:", error);
      },
    };
  },
  () => queryClient
);

/**
 * Update an existing health record
 */
export const updateHealthRecordMutationAtom = atomWithMutation(
  (get) => {
    const gateway = get(healthRecordsGatewayAtom);

    return {
      mutationFn: async (input: UpdateHealthRecordInput) => {
        if (!gateway) throw new Error("Gateway not available");
        return gateway.update(input);
      },
      onSuccess: (data, variables) => {
        // Invalidate specific record
        queryClient.invalidateQueries({
          queryKey: ["health-records", "detail", variables.id],
        });
        // Invalidate list
        queryClient.invalidateQueries({ queryKey: ["health-records", "list"] });
      },
      onError: (error) => {
        console.error("Update health record failed:", error);
      },
    };
  },
  () => queryClient
);

/**
 * Delete a health record
 */
export const deleteHealthRecordMutationAtom = atomWithMutation(
  (get) => {
    const gateway = get(healthRecordsGatewayAtom);

    return {
      mutationFn: async (id: string) => {
        if (!gateway) throw new Error("Gateway not available");
        return gateway.delete(id);
      },
      onSuccess: () => {
        // Invalidate all health records queries
        queryClient.invalidateQueries({ queryKey: ["health-records"] });
      },
      onError: (error) => {
        console.error("Delete health record failed:", error);
      },
    };
  },
  () => queryClient
);

/**
 * Upload and process a document
 */
export const uploadDocumentMutationAtom = atomWithMutation(
  (get) => {
    const gateway = get(healthRecordsGatewayAtom);

    return {
      mutationFn: async ({
        file,
        patientId,
      }: {
        file: File;
        patientId: string;
      }) => {
        if (!gateway) throw new Error("Gateway not available");
        return gateway.uploadDocument(file, patientId);
      },
      onSuccess: () => {
        // Invalidate list after successful upload
        queryClient.invalidateQueries({ queryKey: ["health-records", "list"] });
      },
      onError: (error) => {
        console.error("Document upload failed:", error);
      },
    };
  },
  () => queryClient
);
