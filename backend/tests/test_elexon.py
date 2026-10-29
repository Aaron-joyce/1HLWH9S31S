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


def test_process_wind_data_filters_ex_post_and_out_of_bounds():
    mock_actuals = [
        # Out of bounds (Dec 2025)
        {"startTime": "2025-12-31T23:30:00Z", "generation": 80.0, "fuelType": "WIND"},
        # Valid January
        {"startTime": "2026-01-01T00:00:00Z", "generation": 100.0, "fuelType": "WIND"},
        # Out of bounds (Feb 2026)
        {"startTime": "2026-02-01T00:00:00Z", "generation": 110.0, "fuelType": "WIND"},
    ]

    mock_forecasts = [
        # Valid pre-delivery forecast for 00:00
        {"startTime": "2026-01-01T00:00:00Z", "generation": 95.0, "publishTime": "2025-12-31T12:00:00Z"},
        # Ex-post / retrospective forecast published after delivery start (must be ignored)
        {"startTime": "2026-01-01T00:00:00Z", "generation": 99.0, "publishTime": "2026-01-01T01:00:00Z"},
        # Out of bounds forecast for Feb 2026
        {"startTime": "2026-02-01T00:00:00Z", "generation": 120.0, "publishTime": "2026-01-31T12:00:00Z"},
    ]

    result = process_wind_data(mock_actuals, mock_forecasts)

    # Only January 1 00:00 should remain
    assert len(result["data"]) == 1
    point = result["data"][0]
    assert point["actual_generation"] == 100.0
    # Must pick the pre-delivery forecast (95.0), not the ex-post (99.0)
    assert point["forecast_generation"] == 95.0
    assert result["root_mean_square_error"] == pytest.approx(5.0)


def test_day_ahead_vs_intraday_horizons():
    # Delivery on 2026-01-05 12:00:00Z
    mock_actuals = [
        {"startTime": "2026-01-05T12:00:00Z", "generation": 220.0, "fuelType": "WIND"},
    ]

    mock_forecasts = [
        # D-1 forecast (published on Jan 4 before Jan 5 00:00 UTC)
        {"startTime": "2026-01-05T12:00:00Z", "generation": 200.0, "publishTime": "2026-01-04T18:00:00Z"},
        # Intraday update (published on Jan 5 at 09:00 UTC before 12:00 delivery)
        {"startTime": "2026-01-05T12:00:00Z", "generation": 230.0, "publishTime": "2026-01-05T09:00:00Z"},
    ]

    result = process_wind_data(mock_actuals, mock_forecasts)

    assert len(result["data"]) == 1
    point = result["data"][0]

    # Verify separate horizons
    assert point["actual_generation"] == 220.0
    assert point["forecast_day_ahead_generation"] == 200.0
    assert point["forecast_intraday_generation"] == 230.0

    # Default forecast_generation should align with Day-Ahead wholesale procurement
    assert point["forecast_generation"] == 200.0

    # Day-Ahead error: 200 vs 220 -> RMSE = 20.0
    assert result["day_ahead_rmse"] == pytest.approx(20.0)
    # Intraday error: 230 vs 220 -> RMSE = 10.0
    assert result["intraday_rmse"] == pytest.approx(10.0)
    # Default root_mean_square_error matches Day-Ahead
    assert result["root_mean_square_error"] == pytest.approx(20.0)

