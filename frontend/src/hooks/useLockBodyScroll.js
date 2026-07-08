import { useEffect } from 'react'

/**
 * Verrouille le scroll du body pendant qu'un modal est ouvert.
 * Sans ça, la molette de souris fait défiler la page en arrière-plan
 * au lieu du contenu du modal dès que celui-ci n'a pas encore de
 * overflow à consommer (ou une fois le haut/bas de son propre scroll atteint).
 */
export function useLockBodyScroll() {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
}
