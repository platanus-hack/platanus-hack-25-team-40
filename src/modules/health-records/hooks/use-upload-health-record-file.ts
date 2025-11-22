import { useUser } from "@/shared/hooks/useAuth";
import type { Status } from "@/shared/types/status";
import { supabase } from "@/shared/utils/supabase";
import { useState } from "react";

export function useUploadHealthRecordFile() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = useUser();

  const uploadFile = async (file: File | null): Promise<string | null> => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    if (!file) {
      setError("No file selected");
      return null;
    }

    setStatus("loading");
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from("health_records")
        .upload(`${user?.id}/${Date.now()}_${file.name}`, file);
      
      if (error) throw error;

      setStatus("success");
      return data.path;
    } catch (error) {
      setError((error as Error).message);
      setStatus("error");
      return null;
    }
  }

  return {
    uploadFile,
    status,
    error,
  }
}