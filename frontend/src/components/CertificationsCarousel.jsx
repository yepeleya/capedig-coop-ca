import { useState } from 'react'

// ─── Certifications ──────────────────────────────────────────────
// Les logos officiels n'ont pas encore été reçus de l'entreprise.
// En attendant, chaque certification s'affiche comme un badge texte
// (emoji + couleur). Dès qu'un logo réel est disponible : dépose le
// fichier dans frontend/public/logo_certification/ puis renseigne
// son chemin dans le champ `logo` ci-dessous — le badge sera alors
// automatiquement remplacé par l'image.
const CERTIFICATIONS = [
    { nom: 'Fairtrade International', logo: '/certificat/logo-fairtrade.png' },
  { nom: 'Bio',                logo: '/certificat/Agriculture-biologique.svg' },
  { nom: 'Rainforest Alliance',     logo: '/certificat/logo_forest.jpg' },
]

function CertificationItem({ cert }) {
  const [errored, setErrored] = useState(false)

  if (cert.logo && !errored) {
    return (
      <div
        className="flex items-center justify-center mx-8 flex-shrink-0
                   h-20 w-40 px-4 grayscale opacity-70 transition-all
                   duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105"
      >
        <img
          src={cert.logo}
          alt={cert.nom}
          title={cert.nom}
          onError={() => setErrored(true)}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 mx-5 flex-shrink-0
                 px-6 py-4 rounded-xl border-2 cursor-pointer
                 transition-all duration-300 hover:scale-105 hover:shadow-md"
      style={{ borderColor: cert.couleur, background: cert.bg, minWidth: '200px' }}
    >
      <span className="text-2xl">{cert.emoji}</span>
      <span className="font-bold text-[13.5px] whitespace-nowrap" style={{ color: cert.couleur }}>
        {cert.nom}
      </span>
    </div>
  )
}

export default function CertificationsCarousel() {
  const items = [...CERTIFICATIONS, ...CERTIFICATIONS]

  return (
    <div className="carousel-mask overflow-hidden">
      <div className="carousel-track">
        {items.map((cert, i) => <CertificationItem key={i} cert={cert} />)}
      </div>
    </div>
  )
}
