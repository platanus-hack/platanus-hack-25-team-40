import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { HealthRecord } from "../types";

interface TimelineRecordModalProps {
  record: HealthRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRecordTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    "lab-result": "bg-purple-100 text-purple-800 border-purple-200",
    imaging: "bg-orange-100 text-orange-800 border-orange-200",
    consultation: "bg-blue-100 text-blue-800 border-blue-200",
    prescription: "bg-green-100 text-green-800 border-green-200",
    "emergency-report": "bg-red-100 text-red-800 border-red-200",
    hospitalization: "bg-pink-100 text-pink-800 border-pink-200",
    "surgery-report": "bg-indigo-100 text-indigo-800 border-indigo-200",
    vaccination: "bg-teal-100 text-teal-800 border-teal-200",
    "medical-certificate": "bg-yellow-100 text-yellow-800 border-yellow-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
    // Legacy types
    checkup: "bg-blue-100 text-blue-800 border-blue-200",
    diagnosis: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatRecordType = (type: string) => {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function TimelineRecordModal({
  record,
  open,
  onOpenChange,
}: TimelineRecordModalProps) {
  if (!record) return null;
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className={`text-xs sm:text-sm ${getRecordTypeColor(record.type)}`}
            >
              {formatRecordType(record.type)}
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl leading-tight pr-8">
            {record.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm sm:text-base mt-2 flex-wrap">
            <Calendar className="h-4 w-4" />
            {formatDate(record.date)}
            {record.specialty && record.specialty.trim() && (
              <>
                <span className="mx-1">•</span>
                {record.specialty}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 mt-4 sm:mt-6">
          {/* Description */}
          {record.description && record.description.trim() && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {record.description}
              </p>
            </div>
          )}

          {/* AI Interpretation */}
          {record.aiInterpretation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                    AI Summary
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {record.aiInterpretation.summary ||
                      "Analysis available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Link */}
          {record.fileUrl && (
            <div className="flex items-center justify-end pt-4 border-t gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                onClick={() =>
                  navigate({ to: "/documents", search: { recordId: record.id } })
                }
              >
                Go To Document
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

