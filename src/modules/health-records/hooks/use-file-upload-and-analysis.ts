import { useState, useCallback } from "react";
import { useUploadHealthRecordFile } from "./use-upload-health-record-file";
import { supabase } from "@/shared/utils/supabase";

// Hook encapsulating file selection, upload and analysis invocation.
// Returns state + operations to be consumed by UI (e.g. dialog component).
export function useFileUploadAndAnalysis() {
  const { uploadFile, status: uploadStatus, error: uploadError } = useUploadHealthRecordFile();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [fullPath, setFullPath] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setError(null);
    setData(null);
    setFullPath(null);
  }, []);

  const analyze = useCallback(async () => {
    if (!file) return null;
    setError(null);
    setStatus("uploading");
    try {
      const uploadedPath = await uploadFile(file);
      if (!uploadedPath) throw new Error("File upload failed");
      setFullPath(uploadedPath);
      // Determine simplistic file type for edge function
      const ext = file.name.split('.').pop()?.toLowerCase();
      const typeMap: Record<string, string> = {
        pdf: 'pdf',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
      };
      const derivedType = typeMap[ext || ''] || 'pdf';
      setStatus("analyzing");
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-record', {
        body: {
          type: derivedType,
          file_path: uploadedPath,
        },
      });
      if (fnError) throw fnError;
      setData(fnData);
      setStatus("success");
      return fnData;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to analyze record';
      setError(message);
      setStatus("error");
      return null;
    }
  }, [file, uploadFile]);

  return {
    file,
    setFile,
    status,
    error: error || uploadError,
    analysisData: data,
    fullPath,
    isUploading: status === 'uploading' || uploadStatus === 'loading',
    isAnalyzing: status === 'analyzing',
    isBusy: status === 'uploading' || status === 'analyzing',
    reset,
    analyze,
  };
}
