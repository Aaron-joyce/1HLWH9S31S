import { useState, useEffect } from "react";
import type { WindDataResponse } from "@/types/wind";

export function useWindData() {
  const [data, setData] = useState<WindDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/wind-data")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: WindDataResponse = await response.json();
        setData(result);
      }
      catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching data');
      }
      finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return{data, loading, error}
}
