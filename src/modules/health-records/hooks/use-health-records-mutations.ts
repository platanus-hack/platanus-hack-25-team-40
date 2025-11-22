import { useAtomValue } from "jotai";
import {
  createHealthRecordMutationAtom,
  updateHealthRecordMutationAtom,
  deleteHealthRecordMutationAtom,
  uploadDocumentMutationAtom,
} from "../atoms/mutation-atoms";
import type {
  HealthRecord,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from "../types";

/**
 * Hook to create a new health record
 */
export function useCreateHealthRecord() {
  const mutation = useAtomValue(createHealthRecordMutationAtom);

  const createRecord = async (
    input: CreateHealthRecordInput
  ): Promise<HealthRecord> => {
    return mutation.mutateAsync(input);
  };

  return {
    createRecord,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook to update an existing health record
 */
export function useUpdateHealthRecord() {
  const mutation = useAtomValue(updateHealthRecordMutationAtom);

  const updateRecord = async (
    input: UpdateHealthRecordInput
  ): Promise<HealthRecord> => {
    return mutation.mutateAsync(input);
  };

  return {
    updateRecord,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Hook to delete a health record
 */
export function useDeleteHealthRecord() {
  const mutation = useAtomValue(deleteHealthRecordMutationAtom);

  const deleteRecord = async (id: string): Promise<void> => {
    return mutation.mutateAsync(id);
  };

  return {
    deleteRecord,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Hook to upload and process a document
 */
export function useUploadDocument() {
  const mutation = useAtomValue(uploadDocumentMutationAtom);

  const uploadDocument = async (
    file: File,
    patientId: string
  ): Promise<HealthRecord> => {
    return mutation.mutateAsync({ file, patientId });
  };

  return {
    uploadDocument,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}
