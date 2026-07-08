import { useEffect } from 'react'

/**
 * Déclenche l'apparition des éléments .reveal, .reveal-left, .reveal-right,
 * .reveal-scale quand ils entrent dans le viewport.
 * À appeler UNE FOIS dans chaque page via useReveal()
 *
 * Gère aussi les éléments ajoutés APRÈS le premier rendu (contenu chargé
 * via API) grâce à un MutationObserver.
 */
export function useReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale'

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    const observeAll = () => {
      document.querySelectorAll(selectors).forEach((el) => {
        if (!el.classList.contains('visible')) io.observe(el)
      })
    }

    observeAll()

    // Ré-observe quand du contenu est ajouté dynamiquement (fetch API)
    const mo = new MutationObserver(() => observeAll())
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
