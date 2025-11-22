import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { useCreateHealthRecordWithFile } from "../hooks/use-create-health-record-with-file";
import { Upload, FilePlus, CalendarDays } from "lucide-react";
import type { HealthRecordType } from "../types";

interface UploadHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadHealthRecordDialog({ open, onOpenChange }: UploadHealthRecordDialogProps) {
  const { create, status: flowStatus, error: flowError, isLoading, reset: resetFlow } = useCreateHealthRecordWithFile();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("checkup");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const SPECIALTIES = useMemo(
    () => [
      "Cardiology",
      "Gynecology",
      "Pediatrics",
      "Oncology",
      "Neurology",
      "Endocrinology",
      "Orthopedics",
      "Dermatology",
      "Psychiatry",
      "Urology",
      "Pulmonology",
      "Immunology",
      "Rheumatology",
      "Ophthalmology",
      "Otolaryngology",
      "Radiology",
      "General Medicine",
    ],
    []
  );

  // Simple dropdown only; no filtering UI

  const reset = () => {
    setTitle("");
    setDate("");
    setType("checkup");
    setNotes("");
    setFile(null);
    setSpecialty("");
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!title || !date || !specialty) {
      setFormError("Title, Date and Specialty are required.");
      return;
    }
    try {
      await create({
        title,
        date,
        type: type as HealthRecordType,
        notes,
        specialty,
      }, file);
      reset();
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create record.";
      setFormError(message);
    }
  };

  const disableSubmit = isLoading || !title || !date || !specialty;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); resetFlow(); } onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5" />
            Upload Health Record
          </DialogTitle>
          <DialogDescription>
            Add a health record. Upload a file (PDF, image) optionally; it will be stored securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-title">Name / Title *</label>
            <Input
              id="record-title"
              placeholder="e.g. Annual Physical Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-date">Date *</label>
            <div className="flex items-center gap-2">
              <Input
                id="record-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-type">Record Type *</label>
            <Select value={type} onValueChange={(val) => setType(val)}>
              <SelectTrigger id="record-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">Checkup</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab-result">Lab Result</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-specialty">Specialty *</label>
            <Select value={specialty} onValueChange={(val) => setSpecialty(val)}>
              <SelectTrigger id="record-specialty">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-notes">Notes (optional)</label>
            <Textarea
              id="record-notes"
              placeholder="Observations, context, anything helpful..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="record-file">File (optional)</label>
            <Input
              id="record-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {flowStatus === "uploading" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Upload className="h-3 w-3" /> Uploading...</p>
            )}
            {flowError && (
              <p className="text-xs text-red-600">{flowError}</p>
            )}
          </div>

          {(formError || flowError) && <p className="text-sm text-red-600">{formError || flowError}</p>}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={disableSubmit} className="gap-2">
            <FilePlus className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}