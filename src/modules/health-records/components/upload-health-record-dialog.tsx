import { useState } from "react";
import { useTranslation } from "react-i18next";
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

import { useMultiFileUploadAndAnalysis } from "../hooks/use-multi-file-upload-and-analysis";
import { useCreateHealthRecord } from "../hooks/use-health-records-mutations";
import { useUser } from "@/shared/hooks/useAuth";
import type { HealthRecordType, AIInterpretation } from "../types";
import { FilePlus, FileText, Upload, Loader2, CheckCircle2, XCircle, Sparkles, Cross } from "lucide-react";
import { triggerSuggestionsGeneration } from "@/modules/suggestions/utils/trigger-suggestions";
import { supabase } from "@/shared/utils/supabase";

interface UploadHealthRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadHealthRecordDialog({ open, onOpenChange }: UploadHealthRecordDialogProps) {
  const { t } = useTranslation(["healthRecords", "common"]);
  const multiFlow = useMultiFileUploadAndAnalysis();
  const user = useUser();
  const createMutation = useCreateHealthRecord();

  // Mode: 'file' (file upload) | 'manual' (manual text entry)
  const [mode, setMode] = useState<'file' | 'manual'>('file');

  // Manual entry state
  const [manualText, setManualText] = useState("");
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);
  const [manualAnalysisData, setManualAnalysisData] = useState<any>(null);
  const [manualAnalysisError, setManualAnalysisError] = useState<string | null>(null);

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
  const [isDragging, setIsDragging] = useState(false);

  const resetAll = () => {
    setManualText("");
    setIsAnalyzingManual(false);
    setManualAnalysisData(null);
    setManualAnalysisError(null);
    resetMultiFlow();
    setSelectedIndex(null);
    setMode('file');
    setFileScreen('form');
    setSaveError(null);
    setIsSaving(false);
    setIsSaved(false);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFiles(files);
    }
  };

  const handleFileFlow = async () => {
    if (!items.length) return;
    setFileScreen('status');
    await analyzeAll();
  };

  const handleManualAnalyze = async () => {
    if (!manualText.trim()) return;
    setIsAnalyzingManual(true);
    setManualAnalysisError(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-record", {
        body: {
          type: 'text',
          text_content: manualText,
        },
      });
      if (error) throw error;
      setManualAnalysisData(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to analyze text';
      setManualAnalysisError(message);
    } finally {
      setIsAnalyzingManual(false);
    }
  };

  const handleSaveManual = async () => {
    if (!user || !manualAnalysisData) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const data = manualAnalysisData;
      const aiInterpretation = data.ai_interpretation ? buildAiInterpretation(data.ai_interpretation) : null;
      const payload = {
        patientId: user.id,
        date: data.event_date || new Date().toISOString().slice(0, 10),
        type: normalizeType(data.record_type),
        title: data.title || "Manual Entry",
        description: data.description_text || "",
        specialty: data.specialty || "General Medicine",
        fileUrl: null,
        aiInterpretation,
      } as const;
      await createMutation.mutate(payload as any);
      void triggerSuggestionsGeneration(user.id, "FILE_UPLOAD");
      setIsSaved(true);
      onOpenChange(false);
      resetAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save record';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const disableFileUploadButton = !items.length || isBusyMulti;
  const disableManualAnalyze = !manualText.trim() || isAnalyzingManual;
  const disableManualSave = !manualAnalysisData || isSaving;

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
      void triggerSuggestionsGeneration(user.id, "FILE_UPLOAD");
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
					const hasProcessing =
						mode === "file" &&
						items.some(
							(i) =>
								i.uploadStatus === "uploading" ||
								i.analyzeStatus === "analyzing"
						);
					const hasUnsavedSuccess =
						mode === "file" &&
						items.some((i) => i.analyzeStatus === "success") &&
						!isSaved;
					const inValidate =
						mode === "file" && fileScreen === "validate" && !isSaved;
					const manualUnsaved =
						mode === "manual" &&
						(isAnalyzingManual || (manualAnalysisData && !isSaved));
					const shouldPersist =
						hasProcessing || hasUnsavedSuccess || inValidate || manualUnsaved;
					if (!shouldPersist) {
						resetAll();
					}
				}
				onOpenChange(o);
			}}
		>
			<DialogContent
				className="max-w-2xl max-h-[90vh] flex flex-col"
				style={
					{
						"--tw-enter-translate-x": "0",
						"--tw-enter-translate-y": "0",
						"--tw-exit-translate-x": "0",
						"--tw-exit-translate-y": "0",
					} as React.CSSProperties
				}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Cross className="h-5 w-5 text-primary" />
						{t("uploadDialog.addTitle")}
					</DialogTitle>
					<DialogDescription>{t("uploadDialog.description")}</DialogDescription>
				</DialogHeader>

				{/* Mode Toggle */}
				<div className="flex gap-2 p-1 bg-muted rounded-lg">
					<button
						type="button"
						onClick={() => setMode("file")}
						className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
							mode === "file"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Upload className="h-4 w-4" />
						{t("uploadDialog.uploadFiles")}
					</button>
					<button
						type="button"
						onClick={() => setMode("manual")}
						className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
							mode === "manual"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<FileText className="h-4 w-4" />
						{t("uploadDialog.manualEntry")}
					</button>
				</div>
				{/* BODY */}
				{mode === "file" && (
					<div className="space-y-4 flex-1 overflow-y-auto pr-1">
						{fileScreen === "form" && (
							<>
								<div className="space-y-3">
									<div
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										onClick={() =>
											document.getElementById("record-files")?.click()
										}
										className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
											isDragging
												? "border-primary bg-primary/5"
												: "border-muted-foreground/25 hover:border-muted-foreground/50"
										}`}
									>
										<Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
										<span className="text-sm font-medium text-foreground block">
											{t("uploadDialog.clickOrDrag")}
										</span>
										<p className="text-xs text-muted-foreground mt-1">
											{t("uploadDialog.fileTypes")}
										</p>
										<Input
											id="record-files"
											type="file"
											multiple
											accept="application/pdf,image/*"
											onChange={handleFileInputChange}
											className="hidden"
											onClick={(e) => e.stopPropagation()}
										/>
									</div>
									{items.length > 0 && (
										<div className="space-y-2">
											<p className="text-sm font-medium">
												{t("uploadDialog.filesSelected", {
													count: items.length,
												})}
												:
											</p>
											<div className="space-y-1">
												{items.map((item, idx) => (
													<div
														key={idx}
														className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md"
													>
														<FilePlus className="h-3 w-3" />
														<span className="truncate flex-1">
															{item.file.name}
														</span>
														<span className="text-xs">
															{(item.file.size / 1024).toFixed(1)} KB
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</>
						)}

						{fileScreen === "status" && (
							<div className="space-y-3">
								<p className="text-sm text-muted-foreground">
									{t("uploadDialog.processingFiles")}
								</p>
								<div className="rounded-md border divide-y">
									{items.map((item, idx) => {
										const uploadIcon =
											item.uploadStatus === "uploading" ? (
												<Loader2 className="h-4 w-4 animate-spin text-primary" />
											) : item.uploadStatus === "error" ? (
												<XCircle className="h-4 w-4 text-red-600" />
											) : item.uploadStatus === "success" ? (
												<CheckCircle2 className="h-4 w-4 text-green-600" />
											) : (
												<Loader2 className="h-4 w-4 text-muted-foreground" />
											);
										const analyzeIcon =
											item.analyzeStatus === "analyzing" ? (
												<Loader2 className="h-4 w-4 animate-spin text-primary" />
											) : item.analyzeStatus === "error" ? (
												<XCircle className="h-4 w-4 text-red-600" />
											) : item.analyzeStatus === "success" ? (
												<CheckCircle2 className="h-4 w-4 text-green-600" />
											) : (
												<Loader2 className="h-4 w-4 text-muted-foreground" />
											);
										return (
											<div
												key={idx}
												className="flex items-start justify-between p-3 gap-3"
											>
												<div className="flex-1 space-y-1">
													<p
														className="text-sm font-medium truncate"
														title={item.file.name}
													>
														{item.file.name}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground">
														<div className="flex items-center gap-1">
															{uploadIcon}
															<span>
																{item.uploadStatus === "uploading"
																	? "Uploading"
																	: item.uploadStatus === "success"
																	? "Uploaded"
																	: item.uploadStatus === "error"
																	? "Upload Error"
																	: t("uploadDialog.pendingUpload")}
															</span>
														</div>
														<div className="flex items-center gap-1">
															{analyzeIcon}
															<span>
																{item.analyzeStatus === "analyzing"
																	? "Analyzing"
																	: item.analyzeStatus === "success"
																	? "Analyzed"
																	: item.analyzeStatus === "error"
																	? "Analysis Error"
																	: t("uploadDialog.pending")}
															</span>
														</div>
													</div>
													{item.error && (
														<p className="text-xs text-red-600">{item.error}</p>
													)}
												</div>
												{item.analyzeStatus === "success" && (
													<Button
														variant="link"
														className="px-0"
														onClick={() => {
															setSelectedIndex(idx);
															setFileScreen("validate");
														}}
													>
														{t("uploadDialog.validate")}
													</Button>
												)}
											</div>
										);
									})}
								</div>
								{saveError && (
									<p className="text-xs text-red-600">{saveError}</p>
								)}
							</div>
						)}

						{fileScreen === "validate" && selectedIndex !== null && (
							<div className="space-y-3">
								<div className="flex items-center justify-between sticky top-0 bg-background py-1">
									<p className="text-sm font-medium">
										{t("uploadDialog.reviewDetails")}
									</p>
									<Button
										variant="link"
										className="px-0"
										onClick={() => setFileScreen("status")}
									>
										{t("common:actions.back")}
									</Button>
								</div>
								{(() => {
									const current = items[selectedIndex];
									const data = current?.analysisData;
									return (
										<div className="rounded-md border divide-y max-h-[55vh] overflow-y-auto">
											<div className="p-3">
												<p className="text-xs text-muted-foreground">
													{t("uploadDialog.recordType")}
												</p>
												<p className="text-sm font-medium">
													{data?.record_type || "-"}
												</p>
											</div>
											<div className="p-3">
												<p className="text-xs text-muted-foreground">
													{t("uploadDialog.specialty")}
												</p>
												<p className="text-sm font-medium">
													{data?.specialty || "-"}
												</p>
											</div>
											<div className="p-3">
												<p className="text-xs text-muted-foreground">
													{t("uploadDialog.eventDate")}
												</p>
												<p className="text-sm font-medium">
													{data?.event_date || "-"}
												</p>
											</div>
											<div className="p-3">
												<p className="text-xs text-muted-foreground">
													{t("uploadDialog.title")}
												</p>
												<p className="text-sm font-medium">
													{data?.title || current?.file.name || "-"}
												</p>
											</div>
											<div className="p-3">
												<p className="text-xs text-muted-foreground">
													{t("uploadDialog.description")}
												</p>
												<p className="text-xs whitespace-pre-wrap leading-relaxed">
													{data?.description_text || "-"}
												</p>
											</div>
											{data?.ai_interpretation?.summary && (
												<div className="p-3">
													<p className="text-xs text-muted-foreground">
														{t("uploadDialog.aiSummary")}
													</p>
													<p className="text-xs whitespace-pre-wrap leading-relaxed">
														{data.ai_interpretation.summary}
													</p>
												</div>
											)}
										</div>
									);
								})()}
								{saveError && (
									<p className="text-xs text-red-600">{saveError}</p>
								)}
							</div>
						)}
					</div>
				)}

				{mode === "manual" && (
					<div className="space-y-4 flex-1 overflow-y-auto pr-1">
						{!manualAnalysisData ? (
							<>
								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="manual-text">
										Medical Consultation Details *
									</label>
									<Textarea
										id="manual-text"
										placeholder={t("uploadDialog.consultationPlaceholder")}
										value={manualText}
										onChange={(e) => setManualText(e.target.value)}
										rows={12}
										className="resize-none"
									/>
									<p className="text-xs text-muted-foreground">
										{t("uploadDialog.characters", { count: manualText.length })}
									</p>
								</div>
								{manualAnalysisError && (
									<div className="bg-red-50 border border-red-200 rounded-md p-3">
										<p className="text-sm text-red-800">
											{manualAnalysisError}
										</p>
									</div>
								)}
							</>
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">
										{t("uploadDialog.reviewDetails")}
									</p>
									<Button
										variant="link"
										className="px-0 h-auto"
										onClick={() => {
											setManualAnalysisData(null);
											setManualAnalysisError(null);
										}}
									>
										Edit Text
									</Button>
								</div>
								<div className="rounded-md border divide-y max-h-[55vh] overflow-y-auto">
									<div className="p-3 bg-muted/30">
										<p className="text-xs text-muted-foreground">
											{t("uploadDialog.recordType")}
										</p>
										<p className="text-sm font-medium">
											{manualAnalysisData?.record_type || "-"}
										</p>
									</div>
									<div className="p-3">
										<p className="text-xs text-muted-foreground">
											{t("uploadDialog.specialty")}
										</p>
										<p className="text-sm font-medium">
											{manualAnalysisData?.specialty || "-"}
										</p>
									</div>
									<div className="p-3 bg-muted/30">
										<p className="text-xs text-muted-foreground">
											{t("uploadDialog.eventDate")}
										</p>
										<p className="text-sm font-medium">
											{manualAnalysisData?.event_date || "-"}
										</p>
									</div>
									<div className="p-3">
										<p className="text-xs text-muted-foreground">
											{t("uploadDialog.title")}
										</p>
										<p className="text-sm font-medium">
											{manualAnalysisData?.title || "-"}
										</p>
									</div>
									<div className="p-3 bg-muted/30">
										<p className="text-xs text-muted-foreground">
											{t("uploadDialog.description")}
										</p>
										<p className="text-xs whitespace-pre-wrap leading-relaxed">
											{manualAnalysisData?.description_text || "-"}
										</p>
									</div>
									{manualAnalysisData?.ai_interpretation?.summary && (
										<div className="p-3">
											<p className="text-xs text-muted-foreground mb-2">
												{t("uploadDialog.aiSummary")}
											</p>
											<p className="text-xs whitespace-pre-wrap leading-relaxed">
												{manualAnalysisData.ai_interpretation.summary}
											</p>
										</div>
									)}
									{manualAnalysisData?.ai_interpretation?.biomarkers?.length >
										0 && (
										<div className="p-3 bg-muted/30">
											<p className="text-xs text-muted-foreground mb-2">
												{t("uploadDialog.biomarkersDetected")}
											</p>
											<div className="space-y-2">
												{manualAnalysisData.ai_interpretation.biomarkers.map(
													(b: any, idx: number) => (
														<div key={idx} className="text-xs">
															<span className="font-medium">{b.name}:</span>{" "}
															{b.value} {b.unit}
															<span className="ml-2 text-muted-foreground">
																({b.status})
															</span>
														</div>
													)
												)}
											</div>
										</div>
									)}
								</div>
								{saveError && (
									<div className="bg-red-50 border border-red-200 rounded-md p-3">
										<p className="text-sm text-red-800">{saveError}</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Footer */}
				{!(mode === "file" && fileScreen === "validate") && (
					<DialogFooter className="mt-4">
						{/* Cancel/Hide logic */}
						{!(
							mode === "file" &&
							fileScreen === "status" &&
							items.some(
								(i) =>
									i.uploadStatus !== "success" || i.analyzeStatus !== "success"
							)
						) && (
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={
									(isBusyMulti && fileScreen === "form") || isAnalyzingManual
								}
							>
								{mode === "file" &&
								fileScreen === "status" &&
								items.every((i) => i.analyzeStatus === "success")
									? t("common:actions.hide")
									: t("common:actions.cancel")}
							</Button>
						)}
						{mode === "file" && fileScreen === "form" && (
							<Button
								onClick={handleFileFlow}
								disabled={disableFileUploadButton}
								className="gap-2"
							>
								<Sparkles className="h-4 w-4" />
								{isBusyMulti
									? anyAnalyzing
										? t("uploadDialog.analyzing")
										: t("uploadDialog.uploading")
									: t("uploadDialog.uploadAnalyze")}
							</Button>
						)}
						{mode === "file" &&
							fileScreen === "status" &&
							items.some((i) => i.analyzeStatus === "success") && (
								<Button
									onClick={handleSaveAll}
									disabled={isSaving}
									className="gap-2"
								>
									{isSaving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CheckCircle2 className="h-4 w-4" />
									)}
									{isSaving
										? t("uploadDialog.saving")
										: t("uploadDialog.saveAll")}
								</Button>
							)}
						{mode === "manual" && !manualAnalysisData && (
							<Button
								onClick={handleManualAnalyze}
								disabled={disableManualAnalyze}
								className="gap-2"
							>
								{isAnalyzingManual ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Analyzing...
									</>
								) : (
									<>
										<Sparkles className="h-4 w-4" />
										Analyze with AI
									</>
								)}
							</Button>
						)}
						{mode === "manual" && manualAnalysisData && (
							<Button
								onClick={handleSaveManual}
								disabled={disableManualSave}
								className="gap-2"
							>
								{isSaving ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<CheckCircle2 className="h-4 w-4" />
										Save Record
									</>
								)}
							</Button>
						)}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}