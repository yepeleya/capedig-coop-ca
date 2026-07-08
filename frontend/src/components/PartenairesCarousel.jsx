// ─── Logos partenaires ───────────────────────────────────────────
// Pour ajouter un partenaire : dépose son logo dans
// frontend/public/logo_partenaire/ puis ajoute une ligne ci-dessous.
// (Vite ne permet pas de scanner un dossier public au runtime, donc
// cette liste doit être mise à jour manuellement à chaque ajout.)
const PARTENAIRES = [
  { nom: 'ECOOKIM', logo: '/logo_partenaire/ECOOKIM_LOGO.jpg' },
  { nom: 'Valrhona',                logo: '/logo_partenaire/Logo-valrhona.jpg' },
  { nom: 'Ferrero',     logo: '/logo_partenaire/Ferrero_logo.svg.webp' },
]

export default function PartenairesCarousel() {
  const items = [...PARTENAIRES, ...PARTENAIRES]

  return (
    <div className="carousel-mask overflow-hidden">
      <div className="carousel-track" style={{ animationDuration: '22s' }}>
        {items.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-center mx-8 flex-shrink-0
                       h-20 w-40 px-4 grayscale opacity-70 transition-all
                       duration-300 hover:grayscale-0 hover:opacity-100
                       hover:scale-105"
          >
            <img
              src={p.logo}
              alt={p.nom}
              title={p.nom}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
