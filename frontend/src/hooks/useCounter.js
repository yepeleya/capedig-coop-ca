import { useState, useEffect } from 'react'

/**
 * Anime un compteur de 0 jusqu'à `target` sur `duration` ms.
 * Se déclenche quand `trigger` devient true.
 * Usage : const count = useCounter(3000, 1800, isVisible)
 */
export function useCounter(target, duration = 1800, trigger = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return

    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Easing ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [trigger, target, duration])

  return count
}
