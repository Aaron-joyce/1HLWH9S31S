export type TimeframeFilter = "all" | "24h" | "7d" | "14d" | "jan2026" | "custom";

export interface DateRange {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

export type MetricTrend = "up" | "down" | "neutral";

export interface KPICardData {
  id: string;
  title: string;
  value: string;
  unit?: string;
  secondaryText?: string;
  delta?: {
    value: string;
    trend: MetricTrend;
    sentiment: "positive" | "negative" | "neutral";
  };
  tooltip?: string;
}

export interface ChartSeriesToggle {
  showActual: boolean;
  showForecast: boolean;
  showVariance: boolean;
}

export interface DistributionSegment {
  name: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

export interface HourlyBucket {
  timeLabel: string;
  actual: number;
  forecast: number;
  variance: number;
}
