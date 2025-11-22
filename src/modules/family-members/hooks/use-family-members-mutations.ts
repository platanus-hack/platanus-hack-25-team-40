import { useAtomValue } from "jotai";
import {
  createFamilyLinkAtom,
  updateFamilyLinkAtom,
  deleteFamilyLinkAtom,
  searchUserByEmailAtom,
} from "../atoms/mutation-atoms";

/**
 * Hook for creating a new family link
 */
export function useCreateFamilyLink() {
  return useAtomValue(createFamilyLinkAtom);
}

/**
 * Hook for updating a family link
 */
export function useUpdateFamilyLink() {
  return useAtomValue(updateFamilyLinkAtom);
}

/**
 * Hook for deleting a family link
 */
export function useDeleteFamilyLink() {
  return useAtomValue(deleteFamilyLinkAtom);
}

/**
 * Hook for searching a user by email
 */
export function useSearchUserByEmail() {
  return useAtomValue(searchUserByEmailAtom);
}
