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
    // Validate file sizes (5MB limit for images)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    
    setItems(
      files.map((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
        const isTooBig = isImage && f.size > MAX_IMAGE_SIZE;
        
        return {
          file: f,
          uploadStatus: isTooBig ? "error" : "idle",
          analyzeStatus: isTooBig ? "error" : "idle",
          fullPath: null,
          analysisData: null,
          error: isTooBig ? `Image file too large (max 5MB). Current size: ${(f.size / 1024 / 1024).toFixed(1)}MB` : null,
        };
      })
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
        // Derive type for edge function based on file extension
        const ext = item.file.name.split(".").pop()?.toLowerCase();
        const typeMap: Record<string, string> = {
          pdf: "pdf",
          png: "image",
          jpg: "image",
          jpeg: "image",
          webp: "image",
          gif: "image",
        };
        const derivedType = typeMap[ext || ""] || "pdf";
        // Analyze
        setItems((prev) =>
          prev.map((p, i) => (i === index ? { ...p, analyzeStatus: "analyzing" } : p))
        );
        const response = await supabase.functions.invoke("analyze-record", {
          body: {
            type: derivedType,
            file_path: uploadedPath,
          },
        });
        
        // Better error handling with clear messages
        if (response.error) {
          // Log the full error for debugging
          console.error("Edge function error:", response.error);
          
          // Extract meaningful error message from edge function
          let errorMessage = "Failed to analyze document";
          
          // Check if error has a message property
          if (response.error.message) {
            errorMessage = response.error.message;
          }
          
          // Try to extract more details from context
          if (response.error.context) {
            const ctx = response.error.context;
            if (ctx.message) errorMessage = ctx.message;
            if (ctx.error) errorMessage = ctx.error;
          }
          
          // If the response.data contains error details, extract them
          if (response.data && typeof response.data === 'object') {
            if (response.data.error) errorMessage = response.data.error;
            if (response.data.message) errorMessage = response.data.message;
          }
          
          // Make common errors more user-friendly
          if (errorMessage.includes("Failed to download file")) {
            errorMessage = "Could not access the uploaded file. Please try again.";
          } else if (errorMessage.includes("No text response from Claude")) {
            errorMessage = "AI analysis failed. The document might be unreadable.";
          } else if (errorMessage.includes("Failed to parse")) {
            errorMessage = "AI returned invalid data. The document might be too complex.";
          } else if (errorMessage.includes("token limit")) {
            errorMessage = "Document is too large or complex to analyze.";
          } else if (errorMessage.includes("ANTHROPIC_API_KEY")) {
            errorMessage = "AI service is not configured. Contact support.";
          } else if (errorMessage.includes("non-2xx")) {
            // Generic Supabase error - try to be more helpful
            errorMessage = "Analysis service error. Please check your internet connection and try again.";
          }
          
          throw new Error(errorMessage);
        }
        
        const fnData = response.data;
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
