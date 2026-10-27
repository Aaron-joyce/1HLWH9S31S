export interface WindDataPoint{
  start_time: string;
  actual_generation: number | null;
  forecast_generation: number | null;
  forecast_publish_time?: string | null;
}

export interface WindDataResponse{
  data: WindDataPoint[];
  root_mean_squared_error: number;
}
