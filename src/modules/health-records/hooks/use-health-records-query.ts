import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  healthRecordsListQueryAtom,
  healthRecordQueryAtom,
  healthRecordIdAtom,
  listParamsAtom,
} from "../atoms/query-atoms";
import type { ListHealthRecordsParams } from "../types";

/**
 * Hook to list all health records with optional filters
 */
export function useHealthRecordsList(params?: ListHealthRecordsParams) {
  const setParams = useSetAtom(listParamsAtom);
  const query = useAtomValue(healthRecordsListQueryAtom);

  useEffect(() => {
    setParams(params ?? null);
  }, [params, setParams]);

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to get a single health record by ID
 */
export function useHealthRecord(id: string) {
  const setId = useSetAtom(healthRecordIdAtom);
  const query = useAtomValue(healthRecordQueryAtom);

  useEffect(() => {
    setId(id);
  }, [id, setId]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
