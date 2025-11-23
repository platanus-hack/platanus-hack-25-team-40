import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { healthRecordPublicUrlQueryAtom } from "@/modules/health-records/atoms/query-atoms";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { AppHeader } from "@/shared/components/app-header";
import type { HealthRecord } from "@/modules/health-records/types";
import { useHealthRecordsQuery } from "@/modules/health-records/hooks/use-health-records-query";
import { ScrollArea } from "@/shared/ui/scroll-area";

const typeLabels: Record<string, string> = {
  lab_result: "Lab Result",
  radiology_report: "Radiology Report",
  prescription: "Prescription",
  visit_note: "Visit Note",
  referral: "Referral",
  other: "Other",
};

export default function Documents() {
  const { data: records = [] } = useHealthRecordsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const documentRecords = useMemo(
    () => (records as HealthRecord[]).filter((r) => !!r.fileUrl),
    [records]
  );

  // Auto-select first record having a file
  // Depend only on documentRecords.length to avoid effect re-running on array identity changes
  useEffect(() => {
    if (!selectedId && documentRecords.length > 0) {
      setSelectedId(documentRecords[0].id);
    }
  }, [documentRecords.length, selectedId]);

  const selectedRecord = useMemo(
    () => documentRecords.find((r: HealthRecord) => r.id === selectedId) || null,
    [documentRecords, selectedId]
  );

  const publicUrlAtom = useMemo(
    () => healthRecordPublicUrlQueryAtom(selectedRecord?.fileUrl || null),
    [selectedRecord?.fileUrl]
  );
  const publicUrlResult = useAtomValue(publicUrlAtom);
  const publicUrl: string | null | undefined = publicUrlResult?.data;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      {/* 
        Main content area: height = viewport - header height.
        Adjust `64px` if your AppHeader height differs.
      */}
      <div className="h-[calc(100vh-64px)] w-full mx-auto max-w-7xl px-4 py-6 flex gap-6 overflow-hidden">
        {/* Left: List */}
        <Card className="w-80 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b font-semibold">Your Documents</div>

          {/* ScrollArea used to make the list scroll within the available height */}
          <ScrollArea className="flex-1">
            <div className="p-0">
              <div className="divide-y">
                {documentRecords.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No documents uploaded yet.</div>
                )}
                {documentRecords.map((rec: HealthRecord) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedId(rec.id)}
                    className={`w-full text-left p-3 hover:bg-muted transition flex flex-col gap-1 ${rec.id === selectedId ? "bg-muted" : ""
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium line-clamp-1">{rec.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[rec.type] || rec.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{rec.description || "No description"}</span>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Right: Details */}
        <Card className="flex-1 p-6 flex flex-col overflow-hidden h-full">
          {!selectedRecord && (
            <div className="text-sm text-muted-foreground">Select a document to view its details.</div>
          )}
          {selectedRecord && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{selectedRecord.title}</h2>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge>{typeLabels[selectedRecord.type] || selectedRecord.type}</Badge>
                    {selectedRecord.specialty && (
                      <Badge variant="outline">{selectedRecord.specialty}</Badge>
                    )}
                    <Badge variant="outline">{new Date(selectedRecord.date).toLocaleDateString()}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!publicUrl}
                    onClick={() => {
                      if (publicUrl) window.open(publicUrl, "_blank");
                    }}
                  >
                    Open Document
                  </Button>
                </div>
              </div>

              {/* Make the body area scrollable independently */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 text-sm pt-4">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedRecord.description || "No description available."}
                  </p>
                  {selectedRecord.aiInterpretation && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-3">AI Interpretation</h3>
                      <div className="space-y-6">
                        {/* Summary */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                          <p className="text-sm leading-relaxed">
                            {selectedRecord.aiInterpretation.summary || "No summary available."}
                          </p>
                        </div>

                        {/* Detected Conditions */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Detected Conditions</h4>
                          {selectedRecord.aiInterpretation.detectedConditions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedRecord.aiInterpretation.detectedConditions.map((cond: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {cond}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">None detected.</p>
                          )}
                        </div>

                        {/* Biomarkers */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Biomarkers</h4>
                          {selectedRecord.aiInterpretation.biomarkers.length > 0 ? (
                            <div className="overflow-x-auto border rounded-md">
                              <table className="w-full text-xs">
                                <thead className="bg-muted">
                                  <tr className="text-left">
                                    <th className="p-2 font-medium">Name</th>
                                    <th className="p-2 font-medium">Value</th>
                                    <th className="p-2 font-medium">Status</th>
                                    <th className="p-2 font-medium">Reference Range</th>
                                    <th className="p-2 font-medium">Risk</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedRecord.aiInterpretation.biomarkers.map((b: any, i: number) => {
                                    const statusColor: Record<string, string> = {
                                      Normal: "bg-green-100 text-green-700",
                                      High: "bg-red-100 text-red-700",
                                      Low: "bg-yellow-100 text-yellow-800",
                                    };
                                    const riskColor: Record<string, string> = {
                                      Green: "bg-green-100 text-green-700",
                                      Yellow: "bg-yellow-100 text-yellow-800",
                                      Red: "bg-red-100 text-red-700",
                                    };
                                    return (
                                      <tr key={i} className="border-t">
                                        <td className="p-2 font-medium">{b.name}</td>
                                        <td className="p-2 whitespace-nowrap">
                                          {b.value} {b.unit}
                                        </td>
                                        <td className="p-2">
                                          <span className={`px-2 py-0.5 rounded ${statusColor[b.status] || "bg-gray-100 text-gray-600"}`}>
                                            {b.status || "N/A"}
                                          </span>
                                        </td>
                                        <td className="p-2">{b.referenceRange || "-"}</td>
                                        <td className="p-2">
                                          <span className={`px-2 py-0.5 rounded ${riskColor[b.riskLevel] || "bg-gray-100 text-gray-600"}`}>
                                            {b.riskLevel || "N/A"}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No biomarkers found.</p>
                          )}
                        </div>

                        {/* Medications Found */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications Found</h4>
                          {selectedRecord.aiInterpretation.medicationsFound.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {selectedRecord.aiInterpretation.medicationsFound.map((m: string, i: number) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">No medications mentioned.</p>
                          )}
                        </div>

                        {/* Suggested Actions */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggested Actions</h4>
                          {selectedRecord.aiInterpretation.suggestedActions.length > 0 ? (
                            <div className="space-y-2">
                              {selectedRecord.aiInterpretation.suggestedActions.map((a: any, i: number) => {
                                const urgencyColor: Record<string, string> = {
                                  low: "bg-green-100 text-green-700",
                                  medium: "bg-yellow-100 text-yellow-800",
                                  high: "bg-red-100 text-red-700",
                                };
                                return (
                                  <div key={i} className="border rounded-md p-3 text-xs flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm">{a.title}</span>
                                      <span className={`px-2 py-0.5 rounded ${urgencyColor[a.urgency] || "bg-gray-100 text-gray-600"}`}>
                                        {a.urgency || "n/a"}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                      {a.reason || "No reason provided."}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="outline" className="text-[10px]">
                                        Category: {a.category || "n/a"}
                                      </Badge>
                                      <Badge variant="outline" className="text-[10px]">
                                        Type: {a.actionType || "n/a"}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No suggested actions.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}