import React, { useEffect } from "react";
import { BarChart3, HardDrive, AlertTriangle } from "lucide-react";
import { useUserStore } from "../../stores/userStore";
import { Card, CardHeader, CardTitle, CardContent } from "../primitives/Card";
import { cn } from "../../lib/utils";

export const UsageStats: React.FC = () => {
  const { usageStats, fetchUsageStats } = useUserStore();

  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  if (!usageStats) return null;

  // Calculate percentages (clamped to 0-100)
  const analysisPercent = Math.min(
    100,
    Math.max(
      0,
      (usageStats.dailyAnalysisUsage / usageStats.analysisLimit) * 100,
    ),
  );

  const storagePercent = Math.min(
    100,
    Math.max(0, (usageStats.storageUsed / usageStats.storageLimit) * 100),
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Analysis Usage Card */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Analysis Usage
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageStats.dailyAnalysisUsage} / {usageStats.analysisLimit}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Analyses performed today
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                analysisPercent > 90 ? "bg-red-500" : "bg-primary",
              )}
              style={{ width: `${analysisPercent}%` }}
            />
          </div>
          {analysisPercent > 90 && (
            <div className="mt-2 flex items-center text-xs text-red-500">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Approaching daily limit
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Usage Card */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatBytes(usageStats.storageUsed)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            of {formatBytes(usageStats.storageLimit)} limit
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                storagePercent > 90 ? "bg-red-500" : "bg-blue-500",
              )}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          {storagePercent > 90 && (
            <div className="mt-2 flex items-center text-xs text-red-500">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Storage almost full
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
