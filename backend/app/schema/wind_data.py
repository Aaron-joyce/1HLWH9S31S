from datetime import datetime

from pydantic import BaseModel


class WindDataPoint(BaseModel):
    start_time:datetime
    actual_generation: float | None
    forecast_generation: float | None


class WindDataResposne(BaseModel):
    data:list[WindDataPoint]
    mean_sqaure_error: float
