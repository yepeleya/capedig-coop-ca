import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Monte Lenis (smooth scroll) globalement pour toute l'application.
 * Désactivé automatiquement si l'utilisateur préfère un mouvement réduit.
 * À appeler UNE FOIS, au plus haut niveau (App.jsx).
 */
export function useLenis() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])
}
