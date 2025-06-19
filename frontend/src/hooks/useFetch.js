import { useEffect, useState } from 'react'

const useFetch = (url, settings) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState({
    status: false,
    message: '',
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      try {
        const res = await fetch(url, settings)

        if (!res.ok) {
          throw new Error("Couldn't access the data")
        }
        const data = await res.json()

        setData(data)

        setLoading(false)
      } catch (error) {
        setError({ status: true, message: error.message })

        setLoading(false)
      }
    })()
  }, [url])

  return { data, loading, error }
}

export default useFetch
