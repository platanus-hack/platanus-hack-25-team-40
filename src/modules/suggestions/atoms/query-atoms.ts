import { atomWithQuery } from "jotai-tanstack-query";
import { suggestionsGatewayAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";

/**
 * Query atom for fetching all suggestions
 */
export const suggestionsQueryAtom = atomWithQuery((get) => {
  const gateway = get(suggestionsGatewayAtom);
  const session = get(sessionAtom);
  const userId = session?.user?.id;

  return {
    queryKey: ["suggestions", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return gateway.list(userId);
    },
    enabled: !!userId,
  };
});

/**
 * Query atom for fetching a single suggestion by ID
 */
export const suggestionByIdQueryAtom = (id: string) =>
  atomWithQuery((get) => ({
    queryKey: ["suggestion", id],
    queryFn: async () => {
      const gateway = get(suggestionsGatewayAtom);
      return gateway.getById(id);
    },
    enabled: !!id,
  }));

