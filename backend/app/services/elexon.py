import asyncio
from typing import Any

import httpx
import pandas as pd

URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

async def fetch_wind_data()-> dict[str, Any]:
    params = {
        "publishTimeFrom":"2026-01-01T00:00:00Z",
        "publishTimeTo":"2026-01-31T23:59:59Z",
    }

    async with httpx.AsyncClient() as client:
        forecasts_req = client.get(f"{URL}/WINDFOR/stream", params=params, timeout = 10)
        actuals_req = client.get(f"{URL}/FUELHH/stream", params=params|{"fuelType":["wind"]}, timeout = 10)

        actuals_res, forecasts_res = await asyncio.gather(actuals_req, forecasts_req)

        actuals_res.raise_for_status()
        forecasts_res.raise_for_status()

        actuals_data = actuals_res.json()
        forecasts_data = forecasts_res.json()

    return process_wind_data(actuals_data, forecasts_data)

def process_wind_data(actuals_data:list, forecasts_data:list)->dict[str, Any]:
    df_actuals = pd.DataFrame(actuals_data)
    df_forecasts = pd.DataFrame(forecasts_data)

    if not df_actuals.empty:
        df_actuals = df_actuals.rename(columns={
            'startTime': 'start_time',
            'generation' : 'actual_generation'
        })
        df_actuals = df_actuals[['start_time', 'actual_generation']]

    if not df_forecasts.empty:
        df_forecasts = df_forecasts.rename(columns = {
            'startTime':'start_time',
            'generation':'forecast_generation',
            'publishTime':'forecast_publish_time'
        })

        df_forecasts = df_forecasts[['start_time', 'forecast_generation', 'forecast_publish_time']]

    if not df_actuals.empty and not df_forecasts.empty:
        df_merged = pd.merge(df_actuals, df_forecasts, on='start_time', how="outer")
    else:
        df_merged = pd.DataFrame(columns=['start_time', 'actual_generation', 'forecast_generation', 'forecast_publish_time'])

    df_merged['start_time'] = pd.to_datetime(df_merged['start_time'])
    df_merged = df_merged.sort_values(by='start_time')

    df_math = df_merged.dropna(subset=['actual_generation', 'forecast_generation'])
    mse = ((df_math['forecast_generation'] - df_math['actual_generation'])**2).mean()

    df_merged = df_merged.where(pd.notnull(df_merged), None)

    return{
     "data": df_merged.to_dict(orient='records'),
     "mean_square_error": float(mse) if pd.notna(mse) else 0.0
    }

if __name__ == "__main__":
    data = asyncio.run(fetch_wind_data())
    print(data)
