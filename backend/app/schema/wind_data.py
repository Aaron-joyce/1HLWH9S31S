from datetime import datetime

from pydantic import BaseModel


class WindDataPoint(BaseModel):
    start_time: datetime
    actual_generation: float | None = None
    forecast_generation: float | None = None
    forecast_publish_time: datetime | None = None
    forecast_day_ahead_generation: float | None = None
    forecast_day_ahead_publish_time: datetime | None = None
    forecast_intraday_generation: float | None = None
    forecast_intraday_publish_time: datetime | None = None


class WindDataResponse(BaseModel):
    data: list[WindDataPoint]
    root_mean_square_error: float
    day_ahead_rmse: float | None = None
    intraday_rmse: float | None = None
    mean_absolute_error: float | None = None
    day_ahead_mae: float | None = None
    intraday_mae: float | None = None
    mean_bias_error: float | None = None
    day_ahead_mbe: float | None = None
    intraday_mbe: float | None = None
    normalized_root_mean_square_error: float | None = None
    day_ahead_nrmse: float | None = None
    intraday_nrmse: float | None = None
    installed_capacity_mw: float = 30000.0
