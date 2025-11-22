import { atomWithQuery } from "jotai-tanstack-query";
import { profileGatewayAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";

/**
 * Query atom for fetching the current user's profile
 */
export const profileQueryAtom = atomWithQuery((get) => {
	const gateway = get(profileGatewayAtom);
	const session = get(sessionAtom);
	const userId = session?.user?.id;

	return {
		queryKey: ["profile", userId],
		queryFn: async () => {
			if (!userId) {
				return null;
			}
			return gateway.get(userId);
		},
		enabled: !!userId,
	};
});
