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
// Switched to multi-file workflow supporting parallel upload & analysis.
import { useMultiFileUploadAndAnalysis } from "../hooks/use-multi-file-upload-and-analysis";
import { useCreateHealthRecord } from "../hooks/use-health-records-mutations";
import { useUser } from "@/shared/hooks/useAuth";
import type { HealthRecordType, AIInterpretation } from "../types";
import { FilePlus, CalendarDays, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface UploadHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadHealthRecordDialog({ open, onOpenChange }: UploadHealthRecordDialogProps) {
  const multiFlow = useMultiFileUploadAndAnalysis();
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

  // Multi-file items derived from hook
  const { items, setFiles, analyzeAll, reset: resetMultiFlow, isBusy: isBusyMulti, anyAnalyzing } = multiFlow;

  // Selected item index for validation view
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    resetMultiFlow();
    setSelectedIndex(null);
    setSpecialty("");
    setMode('file');
    setFileScreen('form');
    resetMultiFlow();
    setSaveError(null);
    setIsSaving(false);
    setIsSaved(false);
  };

  const handleFileFlow = async () => {
    if (!items.length) return;
    setFileScreen('status');
    await analyzeAll();
  };

  const handleNoFileSubmit = async () => {
    // Placeholder: In a future iteration we'd create a record without file.
    // For now just close dialog after basic validation.
    if (!title || !date || !specialty) return;
    onOpenChange(false);
    resetAll();
  };

  const disableFileUploadButton = !items.length || isBusyMulti;
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

  const handleSaveAll = async () => {
    if (!user) return;
    const successful = items.filter(i => i.analyzeStatus === 'success' && i.analysisData);
    if (!successful.length) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await Promise.all(successful.map(async (item) => {
        const data = item.analysisData;
        const aiInterpretation = data.ai_interpretation ? buildAiInterpretation(data.ai_interpretation) : null;
        const payload = {
          patientId: user.id,
          date: data.event_date || new Date().toISOString().slice(0, 10),
          type: normalizeType(data.record_type),
          title: data.title || item.file.name,
          description: data.description_text || "",
          specialty: data.specialty || "General Medicine",
          fileUrl: item.fullPath || null,
          aiInterpretation,
        } as const;
        await createMutation.mutate(payload as any);
      }));
      setIsSaved(true);
      onOpenChange(false);
      resetAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save records';
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
          const hasProcessing = mode === 'file' && items.some(i => i.uploadStatus === 'uploading' || i.analyzeStatus === 'analyzing');
          const hasUnsavedSuccess = mode === 'file' && items.some(i => i.analyzeStatus === 'success') && !isSaved;
          const inValidate = mode === 'file' && fileScreen === 'validate' && !isSaved;
          const noFileUnsaved = mode === 'no-file' && !isSaved && (title || date || specialty);
          const shouldPersist = hasProcessing || hasUnsavedSuccess || inValidate || noFileUnsaved;
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
                  <label className="text-sm font-medium" htmlFor="record-files">Medical Files *</label>
                  <Input
                    id="record-files"
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                  {items.length > 0 && (
                    <p className="text-xs text-muted-foreground">{items.length} file(s) selected.</p>
                  )}
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
                <p className="text-sm text-muted-foreground">Processing files</p>
                <div className="rounded-md border divide-y">
                  {items.map((item, idx) => {
                    const uploadIcon = item.uploadStatus === 'uploading'
                      ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      : item.uploadStatus === 'error'
                        ? <XCircle className="h-4 w-4 text-red-600" />
                        : item.uploadStatus === 'success'
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <Loader2 className="h-4 w-4 text-muted-foreground" />;
                    const analyzeIcon = item.analyzeStatus === 'analyzing'
                      ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      : item.analyzeStatus === 'error'
                        ? <XCircle className="h-4 w-4 text-red-600" />
                        : item.analyzeStatus === 'success'
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <Loader2 className="h-4 w-4 text-muted-foreground" />;
                    return (
                      <div key={idx} className="flex items-start justify-between p-3 gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium truncate" title={item.file.name}>{item.file.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">{uploadIcon}<span>{item.uploadStatus === 'uploading' ? 'Uploading' : item.uploadStatus === 'success' ? 'Uploaded' : item.uploadStatus === 'error' ? 'Upload Error' : 'Pending Upload'}</span></div>
                            <div className="flex items-center gap-1">{analyzeIcon}<span>{item.analyzeStatus === 'analyzing' ? 'Analyzing' : item.analyzeStatus === 'success' ? 'Analyzed' : item.analyzeStatus === 'error' ? 'Analysis Error' : 'Pending'}</span></div>
                          </div>
                          {item.error && <p className="text-xs text-red-600">{item.error}</p>}
                        </div>
                        {item.analyzeStatus === 'success' && (
                          <Button variant="link" className="px-0" onClick={() => { setSelectedIndex(idx); setFileScreen('validate'); }}>Validate</Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {saveError && <p className="text-xs text-red-600">{saveError}</p>}
              </div>
            )}

            {fileScreen === 'validate' && selectedIndex !== null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                  <p className="text-sm font-medium">Review extracted details</p>
                  <Button variant="link" className="px-0" onClick={() => setFileScreen('status')}>Back</Button>
                </div>
                {(() => {
                  const current = items[selectedIndex];
                  const data = current?.analysisData;
                  return (
                    <div className="rounded-md border divide-y max-h-[55vh] overflow-y-auto">
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Record Type</p>
                        <p className="text-sm font-medium">{data?.record_type || '-'}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Specialty</p>
                        <p className="text-sm font-medium">{data?.specialty || '-'}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Event Date</p>
                        <p className="text-sm font-medium">{data?.event_date || '-'}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-sm font-medium">{data?.title || current?.file.name || '-'}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{data?.description_text || '-'}</p>
                      </div>
                      {data?.ai_interpretation?.summary && (
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground">AI Summary</p>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">{data.ai_interpretation.summary}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
            {!(mode === 'file' && fileScreen === 'status' && items.some(i => i.uploadStatus !== 'success' || i.analyzeStatus !== 'success')) && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusyMulti && fileScreen === 'form'}
              >
                {mode === 'file' && fileScreen === 'status' && items.every(i => i.analyzeStatus === 'success') ? 'Hide' : 'Cancel'}
              </Button>
            )}
            {mode === 'file' && fileScreen === 'form' && (
              <Button onClick={handleFileFlow} disabled={disableFileUploadButton} className="gap-2">
                <FilePlus className="h-4 w-4" />
                {isBusyMulti ? (anyAnalyzing ? 'Analyzing...' : 'Uploading...') : 'Upload & Analyze'}
              </Button>
            )}
            {mode === 'file' && fileScreen === 'status' && items.some(i => i.analyzeStatus === 'success') && (
              <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save All'}
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