import { useAtom } from "jotai";
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
  const [mutation] = useAtom(createFamilyLinkAtom);
  return mutation;
}

/**
 * Hook for updating a family link
 */
export function useUpdateFamilyLink() {
  const [mutation] = useAtom(updateFamilyLinkAtom);
  return mutation;
}

/**
 * Hook for deleting a family link
 */
export function useDeleteFamilyLink() {
  const [mutation] = useAtom(deleteFamilyLinkAtom);
  return mutation;
}

/**
 * Hook for searching a user by email
 */
export function useSearchUserByEmail() {
  const [mutation] = useAtom(searchUserByEmailAtom);
  return mutation;
}
