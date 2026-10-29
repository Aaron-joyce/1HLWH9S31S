import { useMemo } from "react";
import { useWindData, computeAnalytics } from "./hooks/useWindData";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { DashboardLayout } from "./components/dashboard/layout/DashboardLayout";
import { DateRangeSelector } from "./components/dashboard/filters/DateRangeSelector";
import { ForecastHorizonToggle } from "./components/dashboard/filters/ForecastHorizonToggle";
import { MetricsGrid } from "./components/dashboard/metrics/MetricsGrid";
import { WindForecastChart } from "./components/dashboard/charts/WindForecastChart";
import { CumulativeEnergyChart } from "./components/dashboard/charts/CumulativeEnergyChart";
import { GenerationMixChart } from "./components/dashboard/charts/GenerationMixChart";
import { CapacityBarChart } from "./components/dashboard/charts/CapacityBarChart";
import { DashboardSkeleton } from "./components/dashboard/states/DashboardSkeleton";
import { ErrorState } from "./components/dashboard/states/ErrorState";
import { EmptyState } from "./components/dashboard/states/EmptyState";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  DownloadSimple,
  FilePdf,
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
    forecastHorizon,
    setForecastHorizon,
    dateRange,
    setDateRange,
    seriesToggle,
    toggleSeries,
    filteredPoints,
  } = useDashboardFilters(data?.data || []);

  const activeAnalytics = useMemo(() => {
    if (!filteredPoints || filteredPoints.length === 0) return analytics;
    return computeAnalytics(filteredPoints);
  }, [filteredPoints, analytics]);

  const handleExportCSV = () => {
    if (!filteredPoints || filteredPoints.length === 0) return;
    const headers = "start_time,actual_generation,forecast_generation,horizon\n";
    const rows = filteredPoints
      .map(
        (p) =>
          `"${p.start_time}",${p.actual_generation ?? ""},${
            p.forecast_generation ?? ""
          },"${forecastHorizon}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wind-telemetry-${forecastHorizon}-${dateRange.startDate}_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePDF = () => {
    const originalTitle = document.title;
    document.title = `Wind-Power-Generation-Analytics-${forecastHorizon.toUpperCase()}-${dateRange.startDate}_${dateRange.endDate}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
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
          {/* Dashboard Header Bar: Title on left, Date Selector & Horizon Toggle in center, Export/Share on right */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/40 pb-5">
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
                Actual transmission outturn (FUELHH) versus {forecastHorizon === "day-ahead" ? "Day-Ahead (D-1 Wholesale)" : "Intraday (Pre-Gate)"} generation schedule (WINDFOR)
              </p>
            </div>

            {/* Center: Controls (Date Selector + Horizon Toggle) */}
            <div className="flex flex-wrap items-center justify-start lg:justify-center gap-2">
              <DateRangeSelector
                dateRange={dateRange}
                onChangeDateRange={setDateRange}
              />
              <ForecastHorizonToggle
                horizon={forecastHorizon}
                onChangeHorizon={setForecastHorizon}
                dayAheadRmse={data?.day_ahead_rmse ?? undefined}
                intradayRmse={data?.intraday_rmse ?? undefined}
              />
            </div>

            {/* Right: Quick Action Tools (Export CSV & Save as PDF) */}
            <div className="flex items-center gap-2 print:hidden">
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
                onClick={handleSavePDF}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <FilePdf size={14} />
                <span>Save as PDF</span>
              </Button>
            </div>
          </div>

          {/* Section 1: KPI Metrics Grid */}
          <MetricsGrid analytics={activeAnalytics} horizon={forecastHorizon} />

          {/* Section 2: Primary Charts (Multi-line Trend & Donut Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <WindForecastChart
                data={filteredPoints}
                rmse={activeAnalytics.rmse}
                benchmarkRmse={
                  forecastHorizon === "day-ahead"
                    ? data.day_ahead_rmse
                    : data.intraday_rmse
                }
                seriesToggle={seriesToggle}
                onToggleSeries={toggleSeries}
                horizon={forecastHorizon}
              />
            </div>
            <div className="lg:col-span-4">
              <GenerationMixChart
                distribution={activeAnalytics.varianceDistribution}
                accuracyRate={activeAnalytics.accuracyRate}
              />
            </div>
          </div>

          {/* Section 3: Secondary Visualizations (Cumulative Energy & Diurnal Profile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <CumulativeEnergyChart data={filteredPoints} horizon={forecastHorizon} />
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
