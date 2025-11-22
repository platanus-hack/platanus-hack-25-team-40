import { useAtomValue } from "jotai";
import {
  suggestionsQueryAtom,
  suggestionByIdQueryAtom,
} from "../atoms/query-atoms";

/**
 * Hook for accessing all suggestions query
 */
export function useSuggestionsQuery() {
  return useAtomValue(suggestionsQueryAtom);
}

/**
 * Hook for accessing a single suggestion by ID
 */
export function useSuggestionByIdQuery(id: string) {
  return useAtomValue(suggestionByIdQueryAtom(id));
}

