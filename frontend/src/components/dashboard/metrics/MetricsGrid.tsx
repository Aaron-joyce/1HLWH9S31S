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
      {/* 1. Forecast Error / RMSE */}
      <MetricCard
        title="Forecast Error (RMSE)"
        valueLabel="Model Loss"
        value={formatNumber(analytics.rmse, 2)}
        unit="MW"
        description={`${horizon === "intraday" ? "Intraday Pre-Gate" : "Day-Ahead D-1"} root mean square error`}
        badgeText={`${analytics.accuracyRate.toFixed(1)}% WAPE Acc.`}
        badgeTitle="Weighted Absolute Percentage Error (WAPE) accuracy: 100% - (MAE / Avg Actual)"
        trend={analytics.accuracyRate >= 80 ? "up" : "down"}
        sentiment={analytics.accuracyRate >= 80 ? "positive" : "negative"}
        secondaryMetric={{
          label: "MAE",
          value: `${formatNumber(analytics.mae, 1)} MW (${analytics.wapeErrorRate.toFixed(1)}% err)`,
        }}
      />

      {/* 2. Mean Bias Error (MBE) */}
      <MetricCard
        title="Mean Bias Error (MBE)"
        valueLabel="Directional Bias"
        value={`${analytics.mbe > 0 ? "+" : ""}${formatNumber(analytics.mbe, 1)}`}
        unit="MW"
        description="Systematic drift per 30-min settlement period"
        badgeText={
          analytics.mbe > 150
            ? "+ Over-Forecast"
            : analytics.mbe < -150
            ? "- Under-Forecast"
            : "Balanced (±150 MW)"
        }
        badgeTitle="Mean difference (Forecast - Actual). Positive indicates model over-predicts generation yield."
        trend={Math.abs(analytics.mbe) <= 200 ? "neutral" : analytics.mbe > 0 ? "up" : "down"}
        sentiment={Math.abs(analytics.mbe) <= 200 ? "positive" : "negative"}
        secondaryMetric={{
          label: "NMBE",
          value: `${analytics.nmbe > 0 ? "+" : ""}${analytics.nmbe.toFixed(2)}%`,
        }}
      />

      {/* 3. Normalized RMSE (NRMSE) */}
      <MetricCard
        title="Normalized RMSE (NRMSE)"
        valueLabel="Capacity Scale"
        value={`${analytics.nrmse.toFixed(1)}%`}
        unit="of Cap."
        description="Loss scaled against 30 GW GB registered fleet capacity"
        badgeText={
          analytics.nrmse <= 8.5
            ? "< 8.5% Benchmark"
            : `${analytics.nrmse.toFixed(1)}% Loss`
        }
        badgeTitle="RMSE divided by nominal GB wind fleet capacity (30,000 MW). Under 8.5% is industry standard."
        trend={analytics.nrmse <= 8.5 ? "up" : "down"}
        sentiment={analytics.nrmse <= 8.5 ? "positive" : "negative"}
        secondaryMetric={{
          label: "Capacity",
          value: `${(analytics.installedCapacityMW / 1000).toFixed(1)} GW`,
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
