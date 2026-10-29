export type ForecastHorizon = "day-ahead" | "intraday";

export interface WindDataPoint {
  start_time: string;
  actual_generation: number | null;
  forecast_generation: number | null;
  forecast_publish_time?: string | null;
  forecast_day_ahead_generation?: number | null;
  forecast_day_ahead_publish_time?: string | null;
  forecast_intraday_generation?: number | null;
  forecast_intraday_publish_time?: string | null;
}

export interface WindDataResponse {
  data: WindDataPoint[];
  root_mean_square_error: number;
  day_ahead_rmse?: number;
  intraday_rmse?: number;
  mean_absolute_error?: number;
  day_ahead_mae?: number;
  intraday_mae?: number;
  mean_bias_error?: number;
  day_ahead_mbe?: number;
  intraday_mbe?: number;
  normalized_root_mean_square_error?: number;
  day_ahead_nrmse?: number;
  intraday_nrmse?: number;
  installed_capacity_mw?: number;
  // Optional alias for backwards compatibility
  root_mean_squared_error?: number;
}

export interface ComputedWindAnalytics {
  totalRecords: number;
  validPairs: number;
  rmse: number;
  mae: number;
  mbe: number;
  nmbe: number;
  nrmse: number;
  wapeErrorRate: number;
  installedCapacityMW: number;
  latestActual: number | null;
  latestForecast: number | null;
  peakActual: number;
  peakForecast: number;
  avgActual: number;
  avgForecast: number;
  totalActualMWh: number;
  totalForecastMWh: number;
  overallVarianceMWh: number;
  accuracyRate: number;
  varianceDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  hourlyProfile: Array<{
    hour: string;
    avgActual: number;
    avgForecast: number;
    avgDelta: number;
  }>;
}
