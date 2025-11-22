import { atomWithMutation } from "jotai-tanstack-query";
import { suggestionsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import type { DismissSuggestionInput, AcknowledgeSuggestionInput } from "../types";

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

export const acknowledgeSuggestionMutationAtom = atomWithMutation((get) => ({
  mutationKey: ["acknowledge-suggestion"],
  mutationFn: async (input: AcknowledgeSuggestionInput) => {
    const gateway = get(suggestionsGatewayAtom);
    return gateway.acknowledge(input);
  },
}));

