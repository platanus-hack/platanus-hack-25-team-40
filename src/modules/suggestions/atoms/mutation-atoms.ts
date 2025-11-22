import { atomWithMutation } from "jotai-tanstack-query";
import { suggestionsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import type { DismissSuggestionInput } from "../types";

/**
 * Mutation atom for dismissing a suggestion
 */
export const dismissSuggestionMutationAtom = atomWithMutation((get) => ({
  mutationKey: ["dismiss-suggestion"],
  mutationFn: async (input: DismissSuggestionInput) => {
    const gateway = get(suggestionsGatewayAtom);
    return gateway.dismiss(input);
  },
}));

