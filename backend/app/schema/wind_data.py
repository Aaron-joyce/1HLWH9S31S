from datetime import datetime

from pydantic import BaseModel


class WindDataPoint(BaseModel):
    start_time: datetime
    actual_generation: float | None = None
    forecast_generation: float | None = None
    forecast_publish_time: datetime | None = None


class WindDataResponse(BaseModel):
    data: list[WindDataPoint]
    root_mean_square_error: float


WindDataResposne = WindDataResponse
