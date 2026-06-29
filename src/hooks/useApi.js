import { useState, useEffect } from 'react'

export default function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = () => {
    setLoading(true)
    setError(null)
    fetcher()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, deps)

  return { data, loading, error, reload }
}
