// import { useState, useEffect, useCallback } from "react";

// function useApiData(url, token) {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const refetch = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           "ngrok-skip-browser-warning": true,
//         },
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const result = await response.json();
//       setData(result);
//     } catch (err) {
//       console.log("Fetch error:", err);
//       setError(err.message || "An error occurred while fetching data.");
//     } finally {
//       setLoading(false);
//     }
//   }, [url, token]);

//   useEffect(() => {
//     refetch();
//   }, [refetch]);

//   return { data, loading, error, refetch };
// }

// export default useApiData;

import { useState, useEffect, useCallback, useRef } from "react";

function useApiData(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsRef = useRef({ url, token });

  useEffect(() => {
    paramsRef.current = { url, token };
  }, [url, token]);

  useEffect(() => {
    if (!url || !token) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!signal.aborted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!signal.aborted) {
          console.log("Fetch error:", err);
          setError(err.message || "An error occurred while fetching data.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url, token]);

  const refetch = useCallback(async () => {
    const { url: currentUrl, token: currentToken } = paramsRef.current;

    setLoading(true);
    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.log("Manual Refetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
}

export default useApiData;
