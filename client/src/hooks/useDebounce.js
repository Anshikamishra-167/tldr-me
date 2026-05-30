import { useState, useEffect } from 'react'

/**
 * useDebounce — delays updating a value until the user stops changing it.
 *
 * How it works:
 * 1. Every time `value` changes, we set a timer for `delay` ms.
 * 2. If `value` changes again before the timer fires, we cancel the old timer and start a new one.
 * 3. Only when the user *stops* changing `value` for `delay` ms does `debouncedValue` update.
 *
 * This prevents us firing one API call per slider tick — we only fire once
 * when the user settles on a position.
 *
 * @param {any} value - the value to debounce (slider position + input text)
 * @param {number} delay - milliseconds to wait (we use 900ms)
 * @returns {any} debouncedValue - the stable value after debounce
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Start a timer. If `value` changes before it fires, the cleanup below cancels it.
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancel the timer if value changes before delay expires
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
