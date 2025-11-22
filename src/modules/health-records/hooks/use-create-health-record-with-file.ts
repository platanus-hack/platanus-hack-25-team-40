import { useState, useCallback } from "react";
import { useCreateHealthRecord } from "./use-health-records-mutations";
import { useUploadHealthRecordFile } from "./use-upload-health-record-file";
import { useUser } from "@/shared/hooks/useAuth";
import { triggerSuggestionsGeneration } from "@/modules/suggestions/utils/trigger-suggestions";

interface CreateHealthRecordFormInput {
  title: string;
  date: string; // ISO yyyy-mm-dd
  type: "checkup" | "diagnosis" | "prescription" | "lab-result";
  notes: string; // maps to description
  specialty?: string; // maps directly to DB specialty
}

export function useCreateHealthRecordWithFile() {
  const user = useUser();
  const createMutation = useCreateHealthRecord();
  const { uploadFile } = useUploadHealthRecordFile();

  const [status, setStatus] = useState<"idle" | "uploading" | "creating" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: CreateHealthRecordFormInput, file?: File | null) => {
      if (!user) {
        setError("User not authenticated");
        setStatus("error");
        return null;
      }
      if (!input.title || !input.date) {
        setError("Title and Date are required");
        setStatus("error");
        return null;
      }

      setError(null);
      let fileUrl: string | null = null;
      try {
        if (file) {
          setStatus("uploading");
          fileUrl = await uploadFile(file);
          if (!fileUrl) throw new Error("File upload failed");
        }
        setStatus("creating");
        const record = await createMutation.mutateAsync({
          patientId: user.id,
          date: input.date,
          type: input.type,
          title: input.title,
          description: input.notes,
          specialty: input.specialty || "",
          fileUrl,
        });
        setStatus("success");
        
        // Fire and forget: Trigger suggestions generation after record is created
        // This runs in the background and doesn't block the UI
        triggerSuggestionsGeneration(user.id, "FILE_UPLOAD");
        
        return record;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to create record";
        setError(message);
        setStatus("error");
        return null;
      }
    },
    [user, createMutation, uploadFile]
  );

  return {
    create,
    status,
    error,
    isLoading: status === "uploading" || status === "creating",
    reset: () => {
      setStatus("idle");
      setError(null);
    },
    // expose raw mutation if needed for advanced usage
    mutation: createMutation,
  };
}
