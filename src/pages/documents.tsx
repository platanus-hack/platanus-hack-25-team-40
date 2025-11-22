import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { healthRecordPublicUrlQueryAtom } from "@/modules/health-records/atoms/query-atoms";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { AppHeader } from "@/shared/components/app-header";
import type { HealthRecord } from "@/modules/health-records/types";
import { useHealthRecordsQuery } from "@/modules/health-records/hooks/use-health-records-query";

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
  useEffect(() => {
    if (!selectedId && documentRecords.length > 0) {
      setSelectedId(documentRecords[0].id);
    }
  }, [selectedId, documentRecords]);

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
      <div className="flex-1 w-full mx-auto max-w-7xl px-4 py-6 flex gap-6">
        {/* Left: List */}
        <Card className="w-80 flex flex-col overflow-hidden">
          <div className="p-4 border-b font-semibold">Your Documents</div>
          <div className="flex-1 overflow-y-auto divide-y">
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
        </Card>
        {/* Right: Details */}
        <Card className="flex-1 p-6 flex flex-col gap-4">
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
              <div className="space-y-2 text-sm">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.description || "No description available."}
                </p>
                {selectedRecord.aiInterpretation && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">AI Interpretation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedRecord.aiInterpretation.summary || "No summary."}
                    </p>
                    {selectedRecord.aiInterpretation.biomarkers.length > 0 && (
                      <div className="text-xs flex flex-col gap-1">
                        <h4 className="font-semibold">Biomarkers</h4>
                        {selectedRecord.aiInterpretation.biomarkers.map((b: any, i: number) => (
                          <div key={i} className="flex justify-between border rounded px-2 py-1">
                            <span>{b.name}</span>
                            <span className="text-muted-foreground">
                              {b.value} {b.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}