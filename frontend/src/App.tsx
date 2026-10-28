import { useMemo } from "react";
import { useWindData, computeAnalytics } from "./hooks/useWindData";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { DashboardLayout } from "./components/dashboard/layout/DashboardLayout";
import { DateRangeSelector } from "./components/dashboard/filters/DateRangeSelector";
import { MetricsGrid } from "./components/dashboard/metrics/MetricsGrid";
import { WindForecastChart } from "./components/dashboard/charts/WindForecastChart";
import { GenerationVolumeChart } from "./components/dashboard/charts/GenerationVolumeChart";
import { GenerationMixChart } from "./components/dashboard/charts/GenerationMixChart";
import { CapacityBarChart } from "./components/dashboard/charts/CapacityBarChart";
import { DashboardSkeleton } from "./components/dashboard/states/DashboardSkeleton";
import { ErrorState } from "./components/dashboard/states/ErrorState";
import { EmptyState } from "./components/dashboard/states/EmptyState";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  DownloadSimple,
  ShareNetwork,
  Cpu,
} from "@phosphor-icons/react";

export default function App() {
  const {
    data,
    analytics,
    loading,
    error,
    isRetrying,
    retryAttempt,
    maxRetries,
    lastFetchedAt,
    refetch,
  } = useWindData();

  const {
    dateRange,
    setDateRange,
    seriesToggle,
    toggleSeries,
    filteredPoints,
  } = useDashboardFilters(data?.data || []);

  const activeAnalytics = useMemo(() => {
    if (!filteredPoints || filteredPoints.length === 0) return analytics;
    if (data && filteredPoints.length === data.data.length) return analytics;
    return computeAnalytics(filteredPoints, analytics?.rmse);
  }, [filteredPoints, analytics, data]);

  const handleExportCSV = () => {
    if (!filteredPoints || filteredPoints.length === 0) return;
    const headers = "start_time,actual_generation,forecast_generation\n";
    const rows = filteredPoints
      .map(
        (p) =>
          `"${p.start_time}",${p.actual_generation ?? ""},${
            p.forecast_generation ?? ""
          }`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wind-telemetry-${dateRange.startDate}_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      onRefresh={refetch}
      isRefreshing={loading || isRetrying}
      lastSync={lastFetchedAt}
      error={error}
    >
      {/* 1. Loading & Retrying State */}
      {loading && (
        <DashboardSkeleton
          isRetrying={isRetrying}
          retryAttempt={retryAttempt}
          maxRetries={maxRetries}
        />
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <ErrorState
          error={error}
          onRetry={refetch}
          isRetrying={isRetrying}
        />
      )}

      {/* 3. Empty State */}
      {!loading && !error && (!data || data.data.length === 0) && (
        <EmptyState onRefresh={refetch} />
      )}

      {/* 4. Active Dashboard View */}
      {!loading && !error && data && activeAnalytics && (
        <div className="space-y-6">
          {/* Dashboard Header Bar: Title on left, Date Selector in center, Export/Share on right */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
            {/* Left: Wind Power Generation Analytics */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading">
                  Wind Power Generation Analytics
                </h1>
                <Badge
                  variant="outline"
                  className="h-5 px-2 font-mono text-[11px] border-primary/30 text-primary inline-flex items-center justify-center leading-none"
                >
                  <span className="leading-none pt-px">UK BMRS Elexon</span>
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Actual transmission outturn (FUELHH) versus Day-Ahead generation schedule (WINDFOR)
              </p>
            </div>

            {/* Right: Quick Action Tools (Export CSV & Share) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-start md:justify-center">
                <DateRangeSelector
                  dateRange={dateRange}
                  onChangeDateRange={setDateRange}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <DownloadSimple size={14} />
                <span>Export CSV</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({
                      title: "Wind Generation Analytics",
                      url: window.location.href,
                    });
                  }
                }}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ShareNetwork size={14} />
                <span>Share</span>
              </Button>
            </div>
          </div>

          {/* Section 1: KPI Metrics Grid */}
          <MetricsGrid analytics={activeAnalytics} />

          {/* Section 2: Primary Charts (Multi-line Trend & Donut Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <WindForecastChart
                data={filteredPoints}
                rmse={activeAnalytics.rmse}
                benchmarkRmse={analytics?.rmse}
                seriesToggle={seriesToggle}
                onToggleSeries={toggleSeries}
              />
            </div>
            <div className="lg:col-span-4">
              <GenerationMixChart
                distribution={activeAnalytics.varianceDistribution}
                accuracyRate={activeAnalytics.accuracyRate}
              />
            </div>
          </div>

          {/* Section 3: Secondary Visualizations (Area Volume & Diurnal Profile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <GenerationVolumeChart data={filteredPoints} />
            </div>
            <div className="lg:col-span-5">
              <CapacityBarChart data={activeAnalytics.hourlyProfile} />
            </div>
          </div>

          {/* Telemetry Architecture Metadata Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-primary" />
              <span>
                Pipeline: FastAPI + Pandas Elexon Stream Service · Target Port 8080
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Sample: 30-min settlement intervals</span>
              <span>Loaded: {data.data.length} records</span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
