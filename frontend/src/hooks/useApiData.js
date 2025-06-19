import { useState, useEffect, useCallback } from "react";

function useApiData(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      console.log(url);
      console.log(token);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": true,
        },
      });

      // Log the response status
      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        console.log("response", response);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err); // Log the error for debugging
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [url, token]); // Add url and token as dependencies

  useEffect(() => {
    refetch(); // Initial fetch on mount
  }, [refetch]); // Depend on the refetch function

  return { data, loading, error, refetch };
}

export default useApiData;
