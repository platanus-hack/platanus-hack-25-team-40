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

// We switch to a file-first workflow: upload file then invoke edge function.
// For now we use direct file upload hook and invoke analyze-record after success.
import { useFileUploadAndAnalysis } from "../hooks/use-file-upload-and-analysis";
import { useCreateHealthRecord } from "../hooks/use-health-records-mutations";
import { useUser } from "@/shared/hooks/useAuth";
import type { HealthRecordType, AIInterpretation } from "../types";
import { FilePlus, CalendarDays, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface UploadHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadHealthRecordDialog({ open, onOpenChange }: UploadHealthRecordDialogProps) {
  const fileFlow = useFileUploadAndAnalysis();
  const user = useUser();
  const createMutation = useCreateHealthRecord();

  // Mode: 'file' (file-first simplified) | 'no-file' (legacy/full metadata without file)
  const [mode, setMode] = useState<'file' | 'no-file'>('file');

  // Shared metadata states (used in no-file mode, could be prefilled from analysis in future)
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("checkup");
  const [notes, setNotes] = useState("");
  const [specialty, setSpecialty] = useState("");

  // File flow derived state from hook
  const { file, setFile, status: fileStatus, error: fileError, analysisData, isUploading, isAnalyzing, isBusy, analyze, reset: resetFileFlow } = fileFlow;

  // alias left for clarity; directly use isUploading in render

  // Sub-screens inside file mode
  const [fileScreen, setFileScreen] = useState<"form" | "status" | "validate">("form");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Track whether the analyzed record has been persisted. Used to decide reset on close.
  const [isSaved, setIsSaved] = useState(false);

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

  const resetAll = () => {
    setTitle("");
    setDate("");
    setType("checkup");
    setNotes("");
    setFile(null);
    setSpecialty("");
    setMode('file');
    setFileScreen('form');
    resetFileFlow();
    setSaveError(null);
    setIsSaving(false);
    setIsSaved(false);
  };

  const handleFileFlow = async () => {
    if (!file) return;
    setFileScreen('status');
    await analyze();
  };

  const handleNoFileSubmit = async () => {
    // Placeholder: In a future iteration we'd create a record without file.
    // For now just close dialog after basic validation.
    if (!title || !date || !specialty) return;
    onOpenChange(false);
    resetAll();
  };

  const disableFileUploadButton = !file || isBusy;
  const disableNoFileSubmit = !title || !date || !specialty;

  const normalizeType = (raw: string | undefined | null): HealthRecordType => {
    if (!raw) return "lab-result";
    const norm = raw.toLowerCase().replace(/_/g, "-");
    if (norm.includes("lab")) return "lab-result";
    if (norm.includes("check")) return "checkup";
    if (norm.includes("diag")) return "diagnosis";
    if (norm.includes("prescrip")) return "prescription";
    return "lab-result";
  };

  const buildAiInterpretation = (raw: any): AIInterpretation => {
    return {
      summary: raw?.summary || "",
      detectedConditions: raw?.detected_conditions || [],
      biomarkers: (raw?.biomarkers || []).map((b: any) => ({
        name: b.name || "",
        value: typeof b.value === 'number' ? b.value : Number(b.value) || 0,
        unit: b.unit || "",
        status: b.status || "",
        referenceRange: b.reference_range || "",
        riskLevel: b.risk_level || "",
      })),
      medicationsFound: raw?.medications_found || [],
      suggestedActions: (raw?.suggested_actions || []).map((a: any) => ({
        title: a.title || "",
        reason: a.reason || "",
        urgency: a.urgency || "",
        category: a.category || "",
        actionType: a.action_type || "",
      })),
    };
  };

  const handleSaveAnalyzed = async () => {
    if (!analysisData || !user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const aiInterpretation = analysisData.ai_interpretation ? buildAiInterpretation(analysisData.ai_interpretation) : null;
      const payload = {
        patientId: user.id,
        date: analysisData.event_date || new Date().toISOString().slice(0, 10),
        type: normalizeType(analysisData.record_type),
        title: analysisData.title || (file?.name ?? "Untitled Record"),
        description: analysisData.description_text || "",
        specialty: analysisData.specialty || "General Medicine",
        fileUrl: fileFlow.fullPath || null,
        aiInterpretation,
      } as const;
      await createMutation.mutate(payload as any);
      // Mark saved before closing so close handler can reset state.
      setIsSaved(true);
      onOpenChange(false);
      // Explicit reset after close to clear memory.
      resetAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save record';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          // Persist state across close while processing or awaiting save.
          const processing = mode === 'file' && fileScreen === 'status' && (isUploading || isAnalyzing || fileStatus !== 'success');
          const awaitingSave = mode === 'file' && fileScreen === 'status' && fileStatus === 'success' && !isSaved;
          const inValidate = mode === 'file' && fileScreen === 'validate' && !isSaved;
          const noFileUnsaved = mode === 'no-file' && !isSaved && (title || date || specialty);
          const shouldPersist = processing || awaitingSave || inValidate || noFileUnsaved;
          if (!shouldPersist) {
            resetAll();
          }
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'file' ? <FilePlus className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            {mode === 'file' ? 'Upload & Analyze Record' : 'Add Record (No File)'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'file' ? 'Upload a medical document. We will analyze it automatically.' : 'Provide record details without a file.'}
          </DialogDescription>
        </DialogHeader>
        {/* BODY */}
        {mode === 'file' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {fileScreen === 'form' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="record-file">Medical File *</label>
                  <Input
                    id="record-file"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="record-observations">Doctor Observations (Coming Soon)</label>
                  <Textarea id="record-observations" placeholder="Will be enabled later" disabled />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Button variant="link" type="button" onClick={() => setMode('no-file')} className="px-0">I do not have a file</Button>
                </div>
              </>
            )}

            {fileScreen === 'status' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Processing file</p>
                <div className="rounded-md border divide-y">
                  {/* Upload Row */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : (fileStatus === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file?.name || 'Selected file'}</p>
                        <p className="text-xs text-muted-foreground">{isUploading ? 'Uploading...' : (fileStatus === 'error' ? 'Upload failed' : 'Uploaded')}</p>
                      </div>
                    </div>
                  </div>
                  {/* Analyze Row */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : (fileStatus === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : (fileStatus === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />))}
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Analysis</p>
                        <p className="text-xs text-muted-foreground">{isAnalyzing ? 'Analyzing...' : (fileStatus === 'success' ? 'Completed' : (fileStatus === 'error' ? 'Failed' : 'Pending'))}</p>
                      </div>
                    </div>
                    {fileStatus === 'success' && (
                      <Button variant="link" className="px-0" onClick={() => setFileScreen('validate')}>Validate</Button>
                    )}
                  </div>
                </div>
                {fileError && <p className="text-xs text-red-600">{fileError}</p>}
              </div>
            )}

            {fileScreen === 'validate' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                  <p className="text-sm font-medium">Review extracted details</p>
                  <Button variant="link" className="px-0" onClick={() => setFileScreen('status')}>Back</Button>
                </div>
                <div className="rounded-md border divide-y max-h-[55vh] overflow-y-auto">
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">Record Type</p>
                    <p className="text-sm font-medium">{analysisData?.record_type || '-'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">Specialty</p>
                    <p className="text-sm font-medium">{analysisData?.specialty || '-'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">Event Date</p>
                    <p className="text-sm font-medium">{analysisData?.event_date || '-'}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm font-medium">{analysisData?.title || (file?.name ?? '-')}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{analysisData?.description_text || '-'}</p>
                  </div>
                  {analysisData?.ai_interpretation?.summary && (
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground">AI Summary</p>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{analysisData.ai_interpretation.summary}</p>
                    </div>
                  )}
                </div>
                {saveError && <p className="text-xs text-red-600">{saveError}</p>}
              </div>
            )}
          </div>
        )}

        {mode === 'no-file' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="nf-title">Name / Title *</label>
              <Input
                id="nf-title"
                placeholder="e.g. Annual Physical Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="nf-date">Date *</label>
              <div className="flex items-center gap-2">
                <Input
                  id="nf-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="nf-type">Record Type *</label>
              <Select value={type} onValueChange={(val) => setType(val)}>
                <SelectTrigger id="nf-type">
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
              <label className="text-sm font-medium" htmlFor="nf-specialty">Specialty *</label>
              <Select value={specialty} onValueChange={(val) => setSpecialty(val)}>
                <SelectTrigger id="nf-specialty">
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
              <label className="text-sm font-medium" htmlFor="nf-notes">Notes (optional)</label>
              <Textarea
                id="nf-notes"
                placeholder="Observations, context, anything helpful..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="link" type="button" onClick={() => setMode('file')} className="px-0">Upload file instead</Button>
            </div>
          </div>
        )}

        {/* Footer hidden in validate screen */}
        {!(mode === 'file' && fileScreen === 'validate') && (
          <DialogFooter className="mt-4">
            {/* Cancel/Hide logic */}
            {!(mode === 'file' && fileScreen === 'status' && fileStatus !== 'success') && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy && fileScreen === 'form'}
              >
                {mode === 'file' && fileScreen === 'status' && fileStatus === 'success' ? 'Hide' : 'Cancel'}
              </Button>
            )}
            {mode === 'file' && fileScreen === 'form' && (
              <Button onClick={handleFileFlow} disabled={disableFileUploadButton} className="gap-2">
                <FilePlus className="h-4 w-4" />
                {isBusy ? (isAnalyzing ? 'Analyzing...' : 'Uploading...') : 'Upload & Analyze'}
              </Button>
            )}
            {mode === 'file' && fileScreen === 'status' && fileStatus === 'success' && (
              <Button onClick={handleSaveAnalyzed} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
            {mode === 'no-file' && (
              <Button onClick={handleNoFileSubmit} disabled={disableNoFileSubmit} className="gap-2">
                <FilePlus className="h-4 w-4" />
                Save Record
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}