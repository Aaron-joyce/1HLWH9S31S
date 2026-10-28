import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleNotch } from "@phosphor-icons/react";

interface DashboardSkeletonProps {
  isRetrying?: boolean;
  retryAttempt?: number;
  maxRetries?: number;
}

export function DashboardSkeleton({
  isRetrying,
  retryAttempt,
  maxRetries = 3,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Retrying Banner if active */}
      {isRetrying && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <CircleNotch size={16} className="animate-spin text-amber-500" />
            <span>
              Attempting reconnection to Elexon BMRS ingestion gateway (Attempt{" "}
              {retryAttempt} of {maxRetries})...
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">Backoff in progress</span>
        </div>
      )}

      {/* 4 KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={`kpi-skel-${i}`} className="border border-border/60">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 w-full">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-8 w-36" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <div className="pt-2 border-t border-border/30 flex justify-between">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Chart Grid Skeleton (8-col + 4-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border border-border/60 h-[440px]">
          <CardHeader className="border-b border-border/30 pb-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-3 w-80" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[340px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border border-border/60 h-[440px]">
          <CardHeader className="border-b border-border/30 pb-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56 mt-1" />
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between h-[360px]">
            <div className="flex justify-center items-center h-[200px]">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Chart Grid Skeleton (7-col + 5-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 border border-border/60 h-[360px]">
          <CardHeader className="border-b border-border/30 pb-3">
            <Skeleton className="h-5 w-60" />
            <Skeleton className="h-3 w-72 mt-1" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 border border-border/60 h-[360px]">
          <CardHeader className="border-b border-border/30 pb-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64 mt-1" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
