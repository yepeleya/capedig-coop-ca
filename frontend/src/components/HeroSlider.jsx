import { useEffect, useRef, useState } from 'react'

// ─── Slides du hero ────────────────────────────────────────────
// Photos locales (frontend/public/hero/), vérifiées visuellement une par
// une avant intégration : toutes montrent de vraies cabosses de cacao.
// Chaque slide porte son propre texte d'accroche (badge, titre, sous-titre),
// affiché en synchro par le composant parent (voir prop onIndexChange).
export const SLIDES = [
  {
    url: '/hero/hero-1-cabosses-arbre.jpg',
    alt: 'Cabosses de cacao vertes et orangées sur l\'arbre, en forêt',
    badge: 'DEPUIS 2015',
    titleLines: [
      { words: ['Une', 'coopérative'], gradient: false },
      { words: ['engagée', 'pour', 'un', 'cacao'], gradient: false },
      { words: ['durable', 'et', 'responsable'], gradient: true },
    ],
    subtitle: "Soutenir nos producteurs pour une excellence agricole ivoirienne, du champ au consommateur final.",
  },
  {
    url: '/hero/hero-2-cabosse-lumiere.jpg',
    alt: 'Cabosse de cacao orange éclairée par la lumière naturelle',
    badge: 'EXCELLENCE CACAO',
    titleLines: [
      { words: ['La', 'richesse'], gradient: false },
      { words: ['d\'un', 'terroir'], gradient: false },
      { words: ['d\'exception'], gradient: true },
    ],
    subtitle: "Chaque cabosse récoltée porte l'exigence et le savoir-faire de nos 2 500 producteurs.",
  },
  {
    url: '/hero/hero-3-panier-recolte.jpg',
    alt: 'Panier de cabosses de cacao fraîchement récoltées',
    badge: '2 500+ PRODUCTEURS',
    titleLines: [
      { words: ['Une', 'récolte'], gradient: false },
      { words: ['portée', 'par', 'toute'], gradient: false },
      { words: ['une', 'communauté'], gradient: true },
    ],
    subtitle: "14 sections réunies autour d'une même ambition : un cacao ivoirien reconnu à l'international.",
  },
  {
    url: '/hero/hero-4-cabosse-dramatique.jpg',
    alt: 'Cabosse de cacao pourpre suspendue dans la plantation',
    badge: 'CERTIFIÉ FAIRTRADE',
    titleLines: [
      { words: ['Un', 'cacao'], gradient: false },
      { words: ['certifié,', 'une'], gradient: false },
      { words: ['filière', 'd\'avenir'], gradient: true },
    ],
    subtitle: "Rainforest Alliance, Fairtrade, Bio — l'excellence durable au cœur de notre engagement.",
  },
]

const DUREE_SLIDE = 6000 // ms

export default function HeroSlider({ onIndexChange }) {
  const [index, setIndex]   = useState(0)
  const [reduced, setReduced] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduced) return // pas de rotation automatique si mouvement réduit demandé
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length)
    }, DUREE_SLIDE)
    return () => clearInterval(timerRef.current)
  }, [reduced])

  // Informe le parent (Accueil) du slide actif pour synchroniser le texte
  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.url}
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: '1400ms',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${slide.url}')`,
              filter: 'brightness(0.52) saturate(1.05)',
              // Effet Ken Burns : léger zoom lent, uniquement sur le slide actif,
              // et seulement si l'utilisateur n'a pas demandé de réduire les animations.
              animation: (!reduced && i === index)
                ? `heroKenBurns ${DUREE_SLIDE + 1400}ms ease-out both`
                : 'none',
            }}
            role="img"
            aria-label={slide.alt}
          />
        </div>
      ))}

      {/* Indicateurs de slides — discrets, en bas à droite du hero */}
      <div className="absolute bottom-8 right-6 lg:right-10 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? '28px' : '10px',
              background: i === index ? '#D4641A' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
