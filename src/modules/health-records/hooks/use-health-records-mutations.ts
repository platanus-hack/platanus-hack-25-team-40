import { useAtomValue } from "jotai";
import {
  createHealthRecordMutationAtom,
  updateHealthRecordMutationAtom,
  deleteHealthRecordMutationAtom,
} from "../atoms/mutation-atoms";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for creating a health record
 * Example of using mutation atoms with query invalidation
 */
export function useCreateHealthRecord() {
  const queryClient = useQueryClient();
  const mutation = useAtomValue(createHealthRecordMutationAtom);

  return {
    ...mutation,
    mutate: async (...args: Parameters<typeof mutation.mutate>) => {
      const result = await mutation.mutateAsync(...args);
      // Invalidate queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      return result;
    },
  };
}

/**
 * Hook for updating a health record
 */
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();
  const mutation = useAtomValue(updateHealthRecordMutationAtom);

  return {
    ...mutation,
    mutate: async (...args: Parameters<typeof mutation.mutate>) => {
      const result = await mutation.mutateAsync(...args);
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      queryClient.invalidateQueries({ queryKey: ["health-record"] });
      return result;
    },
  };
}

/**
 * Hook for deleting a health record
 */
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();
  const mutation = useAtomValue(deleteHealthRecordMutationAtom);

  return {
    ...mutation,
    mutate: async (...args: Parameters<typeof mutation.mutate>) => {
      const result = await mutation.mutateAsync(...args);
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      return result;
    },
  };
}
