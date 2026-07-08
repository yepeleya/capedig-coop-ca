import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useReveal } from '../../hooks/useReveal'
import { isVideoFile, stripHtml } from '../../utils/richContent'

const TABS = [
  { id: 'tous',       label: 'Toutes les actualités'    },
  { id: 'annonces',   label: 'Annonces aux producteurs' },
]

const CAT_COLORS = {
  INFRASTRUCTURE: { bg: '#2D6A4F', text: '#fff' },
  FORMATION:      { bg: '#D4641A', text: '#fff' },
  SUCCÈS:         { bg: '#0068B4', text: '#fff' },
  RÉCOLTE:        { bg: '#D4641A', text: '#fff' },
  COMMUNAUTÉ:     { bg: '#0068B4', text: '#fff' },
  CERTIFICATION:  { bg: '#2D6A4F', text: '#fff' },
  ÉVÉNEMENT:      { bg: '#7B3F00', text: '#fff' },
}

const ACTUS_FALLBACK = [
  { id: 1, categorie: 'INFRASTRUCTURE', titre: 'Inauguration de nouveaux entrepôts à Soubré',
    contenu: "Amélioration significative de la capacité de stockage pour garantir la qualité de vos fèves avant l'exportation.",
    date: '13 Octobre 2023',
    image: '/hero/hero-1-cabosses-arbre.jpg',
    restreint: false, type: 'tous' },
  { id: 2, categorie: 'FORMATION', titre: 'Formation aux techniques de culture durable',
    contenu: 'Une session pratique destinée aux membres pour l\'optimisation des rendements tout en respectant l\'environnement.',
    date: '08 Octobre 2023',
    image: '/hero/hero-4-cabosse-dramatique.jpg',
    restreint: false, type: 'evenements' },
  { id: 3, categorie: 'CERTIFICATION', titre: 'Guide Interne de Certification Bio 2024',
    contenu: 'Accédez au guide complet des normes pour la certification de votre production...',
    date: '02 Octobre 2023',
    image: '/hero/hero-2-cabosse-lumiere.jpg',
    restreint: true, type: 'annonces' },
  { id: 4, categorie: 'SUCCÈS', titre: 'Récolte record dans la région du Nawa',
    contenu: 'La coopérative dépasse ses objectifs annuels grâce à l\'engagement exceptionnel de nos producteurs locaux.',
    date: '28 Septembre 2023',
    image: '/hero/hero-4-cabosse-dramatique.jpg',
    restreint: false, type: 'communiques' },
]

function ActuCard({ actu, index, type = 'actualite' }) {
  const col     = CAT_COLORS[actu.categorie?.toUpperCase()] || CAT_COLORS.FORMATION
  const rawImg  = actu.image || actu.img_url
  const img     = rawImg && !rawImg.startsWith('http') ? `/uploads/${rawImg}` : rawImg
  const video   = isVideoFile(actu.image)
  const titre   = actu.titre
  const contenu = stripHtml(actu.contenu, 160)
  const date    = actu.date || (actu.created_at
    ? new Date(actu.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
    : '')
  const restreint = actu.restreint || actu.acces === 'membres'

  return (
    <article
      className={`card-hover bg-white rounded-2xl overflow-hidden
                  border border-capedig-beige-dark reveal delay-${(index % 3) + 1}`}
    >
      <div className="img-container h-48 relative bg-gray-900">
        {video ? (
          <div className="w-full h-full flex items-center justify-center">
            <video src={img} className="w-full h-full object-cover opacity-70" muted />
            <div className="absolute w-12 h-12 rounded-full bg-white/90 flex items-center
                            justify-center">
              <svg className="w-5 h-5 text-capedig-orange" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ) : img ? (
          <div
            className="img-bg w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${img}')` }}
          />
        ) : (
          <div className="w-full h-full bg-capedig-beige-dark" />
        )}
        <span
          className="absolute top-3 left-3 text-[10.5px] font-bold
                     tracking-[1.4px] px-3 py-1 rounded"
          style={{ background: col.bg, color: col.text }}
        >
          {actu.categorie}
        </span>
        {/* Overlay contenu réservé */}
        {restreint && (
          <div className="absolute inset-0 bg-capedig-brun-deep/85 flex flex-col items-center
                          justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-capedig-orange/20 flex items-center
                            justify-center">
              <svg className="w-6 h-6 text-capedig-orange" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white/85 text-[12.5px] font-medium">
              Contenu réservé aux membres
            </p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor"
               viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-400 text-[12px]">{date}</span>
        </div>
        <h3 className={`font-display text-[16px] font-bold leading-snug mb-2
                         ${restreint ? 'text-gray-500' : 'text-gray-900'}`}>
          {titre}
        </h3>
        <p className="text-gray-500 text-[13.5px] leading-relaxed mb-4 line-clamp-3">
          {contenu}
        </p>
        {restreint ? (
          <Link
            to="/login-producteur"
            className="w-full block text-center bg-capedig-orange text-white
                       py-2.5 rounded-lg text-[13.5px] font-semibold
                       transition-all duration-250 hover:bg-capedig-orange-light"
          >
            Connectez-vous pour voir
          </Link>
        ) : (
          <Link
            to={type === 'annonce' ? `/annonces/${actu.id}` : `/actualites/${actu.id}`}
            className="flex items-center gap-1.5 text-capedig-orange text-[13.5px]
                       font-semibold hover:gap-2.5 transition-all duration-200"
          >
            Lire la suite
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  )
}

export default function Actualites() {
  useReveal()

  const [actus,    setActus]    = useState([])
  const [annonces, setAnnonces] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [onglet,   setOnglet]   = useState('tous')
  const [page,     setPage]     = useState(1)
  const PER_PAGE = 6

  useEffect(() => {
    // Charger actualités
    fetch('/api/actualites/index.php')
      .then(r => r.ok ? r.json() : [])
      .then(data => setActus(Array.isArray(data) && data.length ? data : ACTUS_FALLBACK))
      .catch(() => setActus(ACTUS_FALLBACK))

    // Charger annonces publiées séparément
    fetch('/api/annonces/index.php?statut=publiee')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAnnonces(Array.isArray(data) ? data : []))
      .catch(() => setAnnonces([]))
      .finally(() => setLoading(false))
  }, [])

  // 'annonces' → liste des annonces, sinon filtrer les actualités par catégorie
  const items = onglet === 'annonces' ? annonces : actus
  const filtered   = items
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => setPage(1), [onglet])

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center"
        style={{ minHeight: '55vh', paddingTop: '68px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero/hero-2-cabosse-lumiere.jpg')",
            filter: 'brightness(0.35)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,8,2,0.4) 0%, rgba(20,8,2,0.75) 100%)' }}
        />
        <div className="relative z-10 text-center px-6">
          <h1
            className="font-display text-white font-bold leading-tight mb-5"
            style={{
              fontSize: 'clamp(36px, 5vw, 60px)',
              animation: 'fadeUp 0.85s ease 0.2s both',
              opacity: 0,
            }}
          >
            Actualités &amp; Annonces
          </h1>
          <p
            className="text-white/80 text-[16px] max-w-xl mx-auto leading-relaxed mb-6"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            Restez informés sur la vie de votre coopérative et les actualités
            majeures de la filière cacao.
          </p>
          <a
            href="#content"
            className="flex items-center gap-2 justify-center text-capedig-orange
                       text-[14px] font-semibold"
            style={{ animation: 'fadeIn 1s ease 0.7s both', opacity: 0 }}
          >
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
            Défiler pour découvrir
          </a>
        </div>
      </section>

      {/* ── BANDEAU ANNONCE PRIORITAIRE ── */}
      <section id="content" className="bg-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5
                          flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="bg-red-500 text-white text-[10.5px] font-bold tracking-[1px]
                               px-2.5 py-1 rounded flex-shrink-0">
                IMPORTANT
              </span>
              <div>
                <p className="font-bold text-gray-900 text-[15px] mb-1">
                  ANNONCE PRIORITAIRE : Campagne 2024/2025
                </p>
                <p className="text-gray-600 text-[13.5px]">
                  Nouvelles directives de collecte et mise à jour du prix bord champ
                  fixé pour la saison en cours.
                </p>
              </div>
            </div>
            <Link
              to="/login-producteur"
              className="btn-shine flex-shrink-0 bg-capedig-orange text-white
                         px-5 py-3 rounded-xl text-[13.5px] font-semibold
                         flex items-center gap-2 whitespace-nowrap
                         transition-all duration-250 hover:bg-capedig-orange-light"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Consulter l'annonce
            </Link>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="bg-capedig-beige pt-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-1 border-b border-capedig-beige-dark pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setOnglet(tab.id)}
                className={`px-5 py-3 text-[14px] font-semibold border-b-2 -mb-px
                            transition-all duration-200
                            ${onglet === tab.id
                              ? 'border-capedig-orange text-capedig-orange'
                              : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRILLE ARTICLES ── */}
      <section className="bg-capedig-beige pt-8 pb-14 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-capedig-beige-dark">
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 skeleton rounded w-1/4" />
                    <div className="h-5 skeleton rounded w-4/5" />
                    <div className="h-3 skeleton rounded w-full" />
                    <div className="h-3 skeleton rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[60px] mb-4">📰</p>
              <p className="text-[18px] font-bold text-gray-700 mb-2">
                Aucune actualité dans cette catégorie
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginated.map((actu, i) => (
                <ActuCard key={actu.id} actu={actu} index={i}
                  type={onglet === 'annonces' ? 'annonce' : 'actualite'} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-10 h-10 rounded-full border border-capedig-beige-dark
                           text-gray-600 hover:border-capedig-orange hover:text-capedig-orange
                           disabled:opacity-40 transition-all duration-200 flex items-center justify-center">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-full font-semibold text-[14px] transition-all duration-200
                               ${page === n
                                 ? 'bg-capedig-orange text-white shadow-md'
                                 : 'border border-capedig-beige-dark text-gray-600 hover:border-capedig-orange hover:text-capedig-orange'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-capedig-beige-dark
                           text-gray-600 hover:border-capedig-orange hover:text-capedig-orange
                           disabled:opacity-40 transition-all duration-200 flex items-center justify-center">
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
