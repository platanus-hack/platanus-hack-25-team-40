import { useAtomValue } from "jotai";
import { dismissSuggestionMutationAtom } from "../atoms/mutation-atoms";
import { useQueryClient } from "@tanstack/react-query";
import type { DismissSuggestionInput } from "../types";

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

