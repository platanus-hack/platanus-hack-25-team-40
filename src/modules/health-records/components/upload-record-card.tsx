// src/modules/health-records/components/upload-health-record-card.tsx
import { useRef } from "react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useUploadHealthRecordFile } from "../hooks/use-upload-health-record-file";

export function UploadHealthRecordCard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, status, error } = useUploadHealthRecordFile();

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => uploadFile(e.target.files?.[0] || null)}
      />
      <Card
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-dashed hover:border-primary transition p-6 flex flex-col items-center justify-center gap-2 text-center"
      >
        {status === "loading" ? (
          <span className="text-sm">Uploading...</span>
        ) : (
          <>
            <span className="text-sm font-medium">Upload Health Document</span>
            <span className="text-xs text-muted-foreground">
              Click to pick a file
            </span>
            {error && (
              <span className="text-xs text-red-600">{error}</span>
            )}
          </>
        )}
      </Card>
    </>
  );
}