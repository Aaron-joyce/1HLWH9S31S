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


WindDataResposne = WindDataResponse
