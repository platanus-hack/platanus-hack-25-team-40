import { atomWithMutation } from "jotai-tanstack-query";
import { gatewayFamilyMembersAtom } from "@/shared/atoms/gateway-atoms";
import { sessionAtom } from "@/shared/atoms/auth-atoms";
import type {
  CreateFamilyLinkInput,
  UpdateFamilyLinkInput,
} from "../types";

/**
 * Atom for creating a new family link
 */
export const createFamilyLinkAtom = atomWithMutation((get) => {
  const gateway = get(gatewayFamilyMembersAtom);
  const session = get(sessionAtom);
  
  return {
    mutationKey: ["create-family-link"],
    mutationFn: async (input: CreateFamilyLinkInput) => {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return gateway.create(userId, input);
    },
  };
});

/**
 * Atom for updating a family link
 */
export const updateFamilyLinkAtom = atomWithMutation((get) => {
  const gateway = get(gatewayFamilyMembersAtom);
  return {
    mutationKey: ["update-family-link"],
    mutationFn: async (input: UpdateFamilyLinkInput) => {
      return gateway.update(input);
    },
  };
});

/**
 * Atom for deleting a family link
 */
export const deleteFamilyLinkAtom = atomWithMutation((get) => {
  const gateway = get(gatewayFamilyMembersAtom);
  return {
    mutationKey: ["delete-family-link"],
    mutationFn: async (id: string) => {
      return gateway.delete(id);
    },
  };
});

/**
 * Atom for searching users by email
 */
export const searchUserByEmailAtom = atomWithMutation((get) => {
  const gateway = get(gatewayFamilyMembersAtom);
  return {
    mutationKey: ["search-user-by-email"],
    mutationFn: async (email: string) => {
      return gateway.searchByEmail(email);
    },
  };
});
