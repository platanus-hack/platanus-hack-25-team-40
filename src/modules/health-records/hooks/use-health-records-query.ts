import { useAtomValue } from "jotai";
import {
  healthRecordsQueryAtom,
  healthRecordByIdQueryAtom,
} from "../atoms/query-atoms";

/**
 * Hook for accessing all health records query
 * Example of using query atoms in components
 */
export function useHealthRecordsQuery() {
  return useAtomValue(healthRecordsQueryAtom);
}

/**
 * Hook for accessing a single health record by ID
 */
export function useHealthRecordByIdQuery(id: string) {
  return useAtomValue(healthRecordByIdQueryAtom(id));
}
