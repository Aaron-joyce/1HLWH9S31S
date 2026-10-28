import asyncio
from typing import Any

import httpx
import pandas as pd

URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


async def fetch_wind_data() -> dict[str, Any]:
    actuals_params = {
        "settlementDateFrom": "2026-01-01",
        "settlementDateTo": "2026-01-31",
        "fuelType": "WIND",
    }
    forecasts_params = {
        "publishDateTimeFrom": "2025-12-31T00:00:00Z",
        "publishDateTimeTo": "2026-01-31T23:59:59Z",
    }

    async with httpx.AsyncClient() as client:
        forecasts_req = client.get(f"{URL}/WINDFOR/stream", params=forecasts_params, timeout=30.0)
        actuals_req = client.get(f"{URL}/FUELHH/stream", params=actuals_params, timeout=30.0)

        actuals_res, forecasts_res = await asyncio.gather(actuals_req, forecasts_req)

        actuals_res.raise_for_status()
        forecasts_res.raise_for_status()

        actuals_data = actuals_res.json()
        forecasts_data = forecasts_res.json()

    return process_wind_data(actuals_data, forecasts_data)


def process_wind_data(actuals_data: list, forecasts_data: list) -> dict[str, Any]:
    df_actuals = pd.DataFrame(actuals_data)
    df_forecasts = pd.DataFrame(forecasts_data)

    jan_start = pd.to_datetime("2026-01-01T00:00:00Z", utc=True)
    jan_end = pd.to_datetime("2026-01-31T23:30:00Z", utc=True)

    if not df_actuals.empty:
        if "fuelType" in df_actuals.columns:
            df_actuals = df_actuals[df_actuals["fuelType"].str.upper() == "WIND"]
        df_actuals = df_actuals.rename(columns={
            "startTime": "start_time",
            "generation": "actual_generation",
        })
        df_actuals["start_time"] = pd.to_datetime(df_actuals["start_time"], utc=True)
        # Filter strictly to January 2026 delivery period
        df_actuals = df_actuals[(df_actuals["start_time"] >= jan_start) & (df_actuals["start_time"] <= jan_end)]
        df_actuals = df_actuals[["start_time", "actual_generation"]]

    if not df_forecasts.empty:
        df_forecasts["start_time"] = pd.to_datetime(df_forecasts["startTime"], utc=True)
        if "publishTime" in df_forecasts.columns:
            df_forecasts["publishTime"] = pd.to_datetime(df_forecasts["publishTime"], utc=True)
            # Filter out ex-post / retrospective updates (forecast must be published before target delivery start)
            df_forecasts = df_forecasts[df_forecasts["publishTime"] < df_forecasts["start_time"]]
            # Take the latest published forecast prior to delivery
            df_forecasts = (
                df_forecasts.sort_values(by="publishTime")
                .groupby("start_time", as_index=False)
                .last()
            )
        df_forecasts = df_forecasts.rename(columns={
            "generation": "forecast_generation",
            "publishTime": "forecast_publish_time",
        })
        # Filter strictly to January 2026 delivery period
        df_forecasts = df_forecasts[(df_forecasts["start_time"] >= jan_start) & (df_forecasts["start_time"] <= jan_end)]
        df_forecasts = df_forecasts[["start_time", "forecast_generation", "forecast_publish_time"]]

    if not df_actuals.empty and not df_forecasts.empty:
        df_merged = pd.merge(df_actuals, df_forecasts, on="start_time", how="outer")
    elif not df_actuals.empty:
        df_merged = df_actuals.copy()
        df_merged["forecast_generation"] = None
        df_merged["forecast_publish_time"] = None
    elif not df_forecasts.empty:
        df_merged = df_forecasts.copy()
        df_merged["actual_generation"] = None
    else:
        df_merged = pd.DataFrame(
            columns=["start_time", "actual_generation", "forecast_generation", "forecast_publish_time"]
        )

    df_merged = df_merged.sort_values(by="start_time")

    df_math = df_merged.dropna(subset=["actual_generation", "forecast_generation"])

    if df_math.empty:
        rmse_val = 0.0
    else:
        mse = ((df_math["forecast_generation"] - df_math["actual_generation"]) ** 2).mean()
        rmse_val = float(mse ** 0.5)

    df_merged = df_merged.astype(object).where(pd.notnull(df_merged), None)

    return {
        "data": df_merged.to_dict(orient="records"),
        "root_mean_square_error": rmse_val,
    }


if __name__ == "__main__":
    data = asyncio.run(fetch_wind_data())
    print(data)
