import pytest

from app.services.elexon import process_wind_data


def test_process_wind_data():
    mock_actuals = [
        {"startTime": "2026-01-01T00:00:00Z", "generation": 100.0, "fuelType": "WIND"},
        {"startTime": "2026-01-01T01:00:00Z", "generation": 150.0, "fuelType": "WIND"},
        {"startTime": "2026-01-01T02:00:00Z", "generation": 120.0, "fuelType": "WIND"},
        {"startTime": "2026-01-01T03:00:00Z", "generation": 170.0, "fuelType": "WIND"},
    ]

    mock_forecasts = [
            {"startTime": "2026-01-01T00:00:00Z", "generation": 110.0, "publishTime": "2025-12-31T23:00:00Z"},
            {"startTime": "2026-01-01T00:30:00Z", "generation": 120.0, "publishTime": "2025-12-31T23:00:00Z"},
            {"startTime": "2026-01-01T01:00:00Z", "generation": 150.0, "publishTime": "2025-12-31T23:00:00Z"},
            {"startTime": "2026-01-01T01:30:00Z", "generation": 200.0, "publishTime": "2025-12-31T23:00:00Z"},
    ]

    result = process_wind_data(mock_actuals, mock_forecasts)

    assert len(result["data"]) == 6

    assert result["data"][0]["actual_generation"] == 100.0
    assert result["data"][0]["forecast_generation"] == 110.0

    # 3. Check missing actual at 00:30
    assert result["data"][1]["actual_generation"] is None
    assert result["data"][1]["forecast_generation"] == 120.0

    # 4. Check overlap at 01:00
    assert result["data"][2]["actual_generation"] == 150.0
    assert result["data"][2]["forecast_generation"] == 150.0

    # 5. Check missing forecast at 02:00
    assert result["data"][4]["actual_generation"] == 120.0
    assert result["data"][4]["forecast_generation"] is None

    assert result["root_mean_square_error"] == pytest.approx(50 ** 0.5)


def test_process_wind_data_empty_inputs():
    result = process_wind_data([], [])

    assert len(result["data"]) == 0
    assert result["root_mean_square_error"] == 0.0
