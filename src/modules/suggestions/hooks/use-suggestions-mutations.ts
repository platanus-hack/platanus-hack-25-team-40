import { useAtomValue } from "jotai";
import {
  acknowledgeSuggestionMutationAtom,
  dismissSuggestionMutationAtom,
} from "../atoms/mutation-atoms";
import { useQueryClient } from "@tanstack/react-query";
import type { DismissSuggestionInput, AcknowledgeSuggestionInput } from "../types";

/**
 * Hook for dismissing a suggestion
 */
export function useDismissSuggestion() {
  const queryClient = useQueryClient();
  const mutation = useAtomValue(dismissSuggestionMutationAtom);

  return {
    ...mutation,
    mutate: async (input: DismissSuggestionInput) => {
      const result = await mutation.mutateAsync(input);
      // Invalidate queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      return result;
    },
  };
}

/**
 * Hook for acknowledging a suggestion
 */
export function useAcknowledgeSuggestion() {
  const queryClient = useQueryClient();
  const mutation = useAtomValue(acknowledgeSuggestionMutationAtom);

  return {
    ...mutation,
    mutate: async (input: AcknowledgeSuggestionInput) => {
      const result = await mutation.mutateAsync(input);
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      return result;
    },
  };
}

