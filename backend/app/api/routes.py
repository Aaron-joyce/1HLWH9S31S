from fastapi import APIRouter, HTTPException

try:
    from app.schema.wind_data import WindDataResponse
    from app.services.elexon import fetch_wind_data
except ModuleNotFoundError:
    from schema.wind_data import WindDataResponse
    from services.elexon import fetch_wind_data

router = APIRouter()

@router.get("/wind-data", response_model=WindDataResponse)
async def get_wind_data():
    try:
        data = await fetch_wind_data()
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
