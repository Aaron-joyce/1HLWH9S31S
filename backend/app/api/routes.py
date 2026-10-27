from fastapi import APIRouter, HTTPException
from services.elexon import fetch_wind_data
from schema.wind_data import WindDataResposne

router = APIRouter()

@router.get("/wind-data", response_model=WindDataResposne)
async def get_wind_data():
    try:
        data = await fetch_wind_data()
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
