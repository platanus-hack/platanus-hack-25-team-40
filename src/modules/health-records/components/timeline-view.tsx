import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useHealthRecordsQuery } from "../hooks/use-health-records-query";
import { TimelineRecordModal } from "./timeline-record-modal";
import type { HealthRecord } from "../types";
import { FileText, Calendar } from "lucide-react";

interface GroupedRecords {
  [year: string]: {
    [month: string]: HealthRecord[];
  };
}

export function TimelineView() {
  const { data: records, isLoading } = useHealthRecordsQuery();
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group records by year and month
  const groupedRecords: GroupedRecords = (records || []).reduce((acc, record) => {
    const date = new Date(record.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString("default", { month: "long" });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(record);
    return acc;
  }, {} as GroupedRecords);

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      checkup: "bg-blue-100 text-blue-800 border-blue-200",
      diagnosis: "bg-red-100 text-red-800 border-red-200",
      prescription: "bg-green-100 text-green-800 border-green-200",
      "lab-result": "bg-purple-100 text-purple-800 border-purple-200",
      imaging: "bg-orange-100 text-orange-800 border-orange-200",
      vaccination: "bg-teal-100 text-teal-800 border-teal-200",
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="h-full overflow-y-auto">
        {isLoading ? (
          <LoadingSpinner message="Loading records..." />
        ) : !records || records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No health records yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start by uploading your first medical document. Our AI will
              automatically organize and explain it for you.
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {Object.keys(groupedRecords)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map((year) => (
                <div key={year} className="space-y-3 sm:space-y-4">
                  {/* Year Header */}
                  <div className="sticky top-0 bg-background z-10 pb-2 px-0.5 sm:px-0">
                    <h3 className="text-lg sm:text-xl font-bold text-primary">{year}</h3>
                    <div className="h-0.5 w-10 sm:w-12 bg-primary rounded-full mt-1"></div>
                  </div>

                  {/* Months */}
                  {Object.keys(groupedRecords[year])
                    .sort((a, b) => {
                      const monthOrder = [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ];
                      return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                    })
                    .map((month) => {
                      const monthRecords = groupedRecords[year][month];

                      return (
                        <div key={`${year}-${month}`} className="space-y-2 sm:space-y-3">
                          {/* Month Header */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-1 sm:px-2">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">
                              {month}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({monthRecords.length} record
                              {monthRecords.length !== 1 ? "s" : ""})
                            </span>
                          </div>

                          {/* Records for this month */}
                          <div className="space-y-2.5 sm:space-y-3">
                            {monthRecords
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime()
                              )
                              .map((record) => (
                                <Card
                                  key={record.id}
                                  className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] border border-border/60 rounded-2xl"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${getRecordTypeColor(
                                              record.type
                                            )}`}
                                          >
                                            {formatRecordType(record.type)}
                                          </Badge>
                                        </div>
                                        <h4 className="font-semibold text-sm leading-tight truncate">
                                          {record.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5 flex-wrap">
                                          <span className="flex items-center gap-1 shrink-0">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(record.date)}
                                          </span>
                                          {record.specialty &&
                                            record.specialty.trim() && (
                                              <>
                                                <span className="mx-0.5 shrink-0">•</span>
                                                <span className="truncate">
                                                  {record.specialty}
                                                </span>
                                              </>
                                            )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
          </div>
        )}
      </div>
      <TimelineRecordModal
        record={selectedRecord}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

