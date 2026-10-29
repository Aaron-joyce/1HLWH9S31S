import { MetricCard } from "./MetricCard";
import type { ComputedWindAnalytics, ForecastHorizon } from "@/types/wind";
import { formatNumber } from "@/lib/utils";

interface MetricsGridProps {
  analytics: ComputedWindAnalytics;
  horizon?: ForecastHorizon;
}

export function MetricsGrid({ analytics, horizon = "day-ahead" }: MetricsGridProps) {
  const varianceGWh = analytics.overallVarianceMWh / 1000;
  const isNetSurplus = varianceGWh >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Forecast Accuracy / RMSE */}
      <MetricCard
        title="Forecast Accuracy (RMSE)"
        valueLabel="Model Loss"
        value={formatNumber(analytics.rmse, 2)}
        unit="MW"
        description={`${horizon === "intraday" ? "Intraday Pre-Gate" : "Day-Ahead D-1"} model loss`}
        badgeText={`${analytics.accuracyRate.toFixed(1)}% Accuracy`}
        trend={analytics.accuracyRate >= 80 ? "up" : "down"}
        sentiment={analytics.accuracyRate >= 80 ? "positive" : "negative"}
        secondaryMetric={{
          label: "MAE",
          value: `${formatNumber(analytics.mae, 1)} MW`,
        }}
      />

      {/* 2. Latest Actual Generation */}
      <MetricCard
        title="Actual Generation"
        valueLabel="Latest Interval"
        value={
          analytics.latestActual !== null
            ? formatNumber(analytics.latestActual, 1)
            : "—"
        }
        unit="MW"
        description="Real-time metered outturn"
        badgeText={`Peak: ${formatNumber(analytics.peakActual, 0)} MW`}
        trend="neutral"
        sentiment="neutral"
        secondaryMetric={{
          label: "Avg",
          value: `${formatNumber(analytics.avgActual, 0)} MW`,
        }}
      />

      {/* 3. Forecast Generation */}
      <MetricCard
        title={horizon === "intraday" ? "Intraday Forecast" : "Day-Ahead Forecast"}
        valueLabel="Latest Interval"
        value={
          analytics.latestForecast !== null
            ? formatNumber(analytics.latestForecast, 1)
            : "—"
        }
        unit="MW"
        description={
          horizon === "intraday"
            ? "BMRS WINDFOR pre-gate updates"
            : "BMRS WINDFOR day-ahead schedule"
        }
        badgeText={`Peak: ${formatNumber(analytics.peakForecast, 0)} MW`}
        trend="neutral"
        sentiment="neutral"
        secondaryMetric={{
          label: "Avg",
          value: `${formatNumber(analytics.avgForecast, 0)} MW`,
        }}
      />

      {/* 4. Net Energy Balance & Variance */}
      <MetricCard
        title="Net Energy Variance"
        valueLabel="Cumulative"
        value={formatNumber(Math.abs(varianceGWh), 1)}
        unit="GWh"
        description="Cumulative dispatch vs scheduled"
        badgeText={isNetSurplus ? "+ Over-Gen" : "- Under-Gen"}
        trend={isNetSurplus ? "up" : "down"}
        sentiment={isNetSurplus ? "positive" : "negative"}
        secondaryMetric={{
          label: "Total Gen",
          value: `${formatNumber(analytics.totalActualMWh / 1000, 1)} GWh`,
        }}
      />
    </div>
  );
}
