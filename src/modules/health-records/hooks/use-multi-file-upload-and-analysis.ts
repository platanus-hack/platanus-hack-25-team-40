import { useCallback, useState } from "react";
import { useUploadHealthRecordFile } from "./use-upload-health-record-file";
import { supabase } from "@/shared/utils/supabase";

interface MultiFileItem {
  file: File;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  analyzeStatus: "idle" | "analyzing" | "success" | "error";
  fullPath: string | null;
  analysisData: any | null;
  error: string | null;
}

export function useMultiFileUploadAndAnalysis() {
  const { uploadFile } = useUploadHealthRecordFile();
  const [items, setItems] = useState<MultiFileItem[]>([]);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const setFiles = useCallback((files: File[]) => {
    setItems(
      files.map((f) => ({
        file: f,
        uploadStatus: "idle",
        analyzeStatus: "idle",
        fullPath: null,
        analysisData: null,
        error: null,
      }))
    );
    setBatchError(null);
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setIsAnalyzingAll(false);
    setBatchError(null);
  }, []);

  const analyzeAll = useCallback(async () => {
    if (!items.length) return;
    setBatchError(null);
    setIsAnalyzingAll(true);

    const runForItem = async (item: MultiFileItem, index: number) => {
      try {
        // Upload
        setItems((prev) =>
          prev.map((p, i) => (i === index ? { ...p, uploadStatus: "uploading", error: null } : p))
        );
        const uploadedPath = await uploadFile(item.file);
        if (!uploadedPath) throw new Error("File upload failed");
        setItems((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, uploadStatus: "success", fullPath: uploadedPath } : p
          )
        );
        // Derive simple type for edge function
        const ext = item.file.name.split(".").pop()?.toLowerCase();
        const typeMap: Record<string, string> = {
          pdf: "pdf",
          png: "image",
          jpg: "image",
          jpeg: "image",
        };
        const derivedType = typeMap[ext || ""] || "pdf";
        // Analyze
        setItems((prev) =>
          prev.map((p, i) => (i === index ? { ...p, analyzeStatus: "analyzing" } : p))
        );
        const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-record", {
          body: {
            type: derivedType,
            file_path: uploadedPath,
          },
        });
        if (fnError) throw fnError;
        setItems((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, analyzeStatus: "success", analysisData: fnData }
              : p
          )
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to process file";
        setItems((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  ...p,
                  uploadStatus: p.uploadStatus === "idle" ? "error" : p.uploadStatus,
                  analyzeStatus: p.analyzeStatus === "idle" ? "error" : p.analyzeStatus,
                  error: message,
                }
              : p
          )
        );
      }
    };

    await Promise.all(items.map((item, i) => runForItem(item, i)));
    setIsAnalyzingAll(false);
  }, [items, uploadFile]);

  const anyUploading = items.some((i) => i.uploadStatus === "uploading");
  const anyAnalyzing = items.some((i) => i.analyzeStatus === "analyzing");
  const anyBusy = anyUploading || anyAnalyzing || isAnalyzingAll;

  return {
    items,
    setFiles,
    analyzeAll,
    reset,
    isBusy: anyBusy,
    anyUploading,
    anyAnalyzing,
    batchError,
  };
}
