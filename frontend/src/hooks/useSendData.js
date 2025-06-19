import { useState } from 'react'

// Custom Hook: useSendData
const useSendData = (url, token, method = 'POST') => {
  // State to handle loading, response, and error
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  // Function to send the data
  const sendData = async (data = {}, dataType = '') => {
    setLoading(true)
    setError(null) // Reset the error on each new request
    try {
      const res = await fetch(url, {
        method, // Method (POST, PUT, etc.)
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          // Auth token if needed
        },
        body:
          method !== 'GET'
            ? dataType === 'formData'
              ? data
              : JSON.stringify(data)
            : undefined, // Only add body for non-GET requests
      })

      const result = await res.json()

      setResponse(result) // Save the response
    } catch (err) {
      setError(err.message || 'An error occurred') // Handle error
    } finally {
      setLoading(false) // Done loading
    }
  }

  return { loading, response, error, sendData }
}

export default useSendData
