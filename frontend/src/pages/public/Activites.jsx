import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useReveal } from '../../hooks/useReveal'
import { useCounter } from '../../hooks/useCounter'
import { useRef } from 'react'

const CATEGORIES = [
  { id: 'tous',             label: 'Toutes les activités' },
  { id: 'agricole',         label: 'Projets agricoles'     },
  { id: 'social',           label: 'Projets sociaux'       },
  { id: 'environnemental',  label: 'Projets environnementaux' },
]

const CAT_COLORS = {
  agricole:        { bg: '#D4641A', text: '#fff', lightBg: '#FFF3CD' },
  social:          { bg: '#0068B4', text: '#fff', lightBg: '#E6F1FB' },
  environnemental: { bg: '#2D6A4F', text: '#fff', lightBg: '#D4EDDA' },
}

const PROJETS_FALLBACK = [
  { id: 1, titre: 'Renforcement de la cacao-culture',        categorie: 'agricole',
    desc: 'Optimisation des rendements et techniques de récolte durable pour une meilleure productivité.',
    statut: 'EN COURS',
    image: '/hero/hero-1-cabosses-arbre.jpg' },
  { id: 2, titre: 'Soutien à l\'éducation rurale',           categorie: 'social',
    desc: 'Construction et rénovation d\'écoles pour les enfants des membres de la coopérative.',
    statut: 'COMPLÉTÉ',
    image: '/hero/hero-3-panier-recolte.jpg' },
  { id: 3, titre: 'Reboisement Communautaire',               categorie: 'environnemental',
    desc: "Plantation d'arbres d'ombrage pour favoriser la biodiversité et protéger les plantations.",
    statut: 'EN COURS',
    image: '/hero/hero-1-cabosses-arbre.jpg' },
  { id: 4, titre: 'Modernisation des infrastructures',       categorie: 'agricole',
    desc: 'Amélioration des centres de collecte et des équipements de séchage du cacao.',
    statut: 'NOUVEAU',
    image: '/hero/hero-2-cabosse-lumiere.jpg' },
  { id: 5, titre: 'Empowerment des femmes',                  categorie: 'social',
    desc: 'Formation et micro-financement pour les activités génératrices de revenus des femmes.',
    statut: 'EN COURS',
    image: '/hero/hero-4-cabosse-dramatique.jpg' },
  { id: 6, titre: 'Énergie Solaire Rurale',                  categorie: 'environnemental',
    desc: 'Installation de panneaux solaires dans les centres de traitement pour une énergie propre.',
    statut: 'PILOTE',
    image: '/hero/hero-3-panier-recolte.jpg' },
]

// Mapping statut DB → libellé affiché + couleur du point
const STATUT_INFO = {
  planifie:   { label: 'Planifié',  dot: '#9CA3AF' },
  nouveau:    { label: 'Nouveau',   dot: '#0068B4' },
  pilote:     { label: 'Pilote',    dot: '#B45309' },
  en_cours:   { label: 'En cours',  dot: '#D4641A' },
  termine:    { label: 'Terminé',   dot: '#2D6A4F' },
  // compatibilité avec les données fallback
  'EN COURS': { label: 'En cours',  dot: '#D4641A' },
  'COMPLÉTÉ': { label: 'Terminé',   dot: '#2D6A4F' },
  'NOUVEAU':  { label: 'Nouveau',   dot: '#0068B4' },
  'PILOTE':   { label: 'Pilote',    dot: '#B45309' },
}

function SkeletonProjet() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-capedig-beige-dark">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded w-1/4" />
        <div className="h-5 skeleton rounded w-4/5" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  )
}

export default function Activites() {
  useReveal()

  const [projets,   setProjets]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtre,    setFiltre]    = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState(null) // projet ouvert en modal
  const PER_PAGE = 6

  // Stats
  const statsRef = useRef(null)
  const [trigger, setTrigger] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setTrigger(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])
  const c24   = useCounter(24,   1000, trigger)
  const c1250 = useCounter(1250, 1600, trigger)
  const c12   = useCounter(12,   1200, trigger)

  useEffect(() => {
    fetch('/api/projets/index.php')
      .then(r => r.ok ? r.json() : [])
      .then(data => setProjets(Array.isArray(data) && data.length ? data : PROJETS_FALLBACK))
      .catch(() => setProjets(PROJETS_FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  // Filtrage + recherche
  const filtered = projets.filter(p => {
    const matchCat = filtre === 'tous' || p.categorie === filtre
    const matchSearch = recherche === '' ||
      p.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      (p.desc || p.description || '').toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Reset page quand le filtre change
  useEffect(() => setPage(1), [filtre, recherche])

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '65vh', paddingTop: '68px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero/hero-3-panier-recolte.jpg')",
            filter: 'brightness(0.4)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(20,8,2,0.5)' }}
        />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1
            className="font-display text-white font-bold uppercase tracking-wider leading-tight"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              animation: 'fadeUp 0.85s ease 0.2s both',
              opacity: 0,
            }}
          >
            Nos Activités<br />et Projets
          </h1>
          <p
            className="text-white/80 text-[16px] leading-relaxed mt-6 mb-10 max-w-2xl mx-auto"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            Découvrez les initiatives de la CAPEDIG-COOP CA pour un cacao durable,
            l'autonomisation des producteurs et une communauté florissante.
          </p>
          <div
            className="flex flex-wrap gap-4 justify-center"
            style={{ animation: 'fadeUp 0.85s ease 0.55s both', opacity: 0 }}
          >
            <a href="#projets"
              className="btn-shine bg-capedig-orange text-white px-7 py-3.5
                         rounded-xl text-[15px] font-semibold
                         transition-all duration-300 hover:bg-capedig-orange-light">
              Explorer nos projets
            </a>
            <a href="#impact"
              className="text-white px-7 py-3.5 rounded-xl text-[15px] font-medium
                         border border-white/35 transition-all duration-300
                         hover:bg-white/15">
              Notre impact
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { val: c24,   suf: '',   label: 'Projets actifs',   icon: '🚜' },
            { val: c1250, suf: '+',  label: 'Bénéficiaires',    icon: '👥' },
            { val: c12,   suf: '',   label: 'Zones couvertes',  icon: '📍' },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-capedig-beige rounded-2xl p-7 flex items-center gap-5
                          reveal delay-${i + 1} hover:-translate-y-1
                          transition-all duration-300`}
            >
              <span className="text-4xl">{s.icon}</span>
              <div>
                <p className="font-display text-[40px] font-bold text-capedig-orange leading-none">
                  {s.val.toLocaleString('fr-FR')}{s.suf}
                </p>
                <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FILTRES + RECHERCHE ── */}
      <section id="projets" className="bg-capedig-beige py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFiltre(cat.id)}
              className={`px-5 py-2.5 rounded-full text-[13.5px] font-semibold
                          transition-all duration-250 border
                          ${filtre === cat.id
                            ? 'bg-capedig-orange text-white border-capedig-orange shadow-md'
                            : 'bg-white text-gray-600 border-capedig-beige-dark hover:border-capedig-orange hover:text-capedig-orange'}`}
            >
              {cat.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 bg-white border
                          border-capedig-beige-dark rounded-full px-4 py-2.5
                          min-w-[200px] focus-within:border-capedig-orange
                          transition-colors duration-250">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              className="flex-1 outline-none text-[13.5px] bg-transparent text-gray-700
                         placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* ── GRILLE PROJETS ── */}
      <section className="bg-capedig-beige pb-14 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonProjet key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[60px] mb-4">🔍</p>
              <p className="text-[18px] font-bold text-gray-700 mb-2">Aucun projet trouvé</p>
              <p className="text-gray-500 text-[14.5px]">
                Essayez un autre filtre ou une autre recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginated.map((proj, i) => {
                const cat    = proj.categorie?.toLowerCase() || 'agricole'
                const colors = CAT_COLORS[cat] || CAT_COLORS.agricole
                const stInfo = STATUT_INFO[proj.statut] || STATUT_INFO.en_cours
                const rawImg = proj.image || proj.img_url || ''
                const img    = rawImg && !rawImg.startsWith('http') ? `/uploads/${rawImg}` : rawImg
                return (
                  <div
                    key={proj.id}
                    className={`card-hover bg-white rounded-2xl overflow-hidden
                                border border-capedig-beige-dark reveal delay-${(i % 3) + 1}`}
                  >
                    <div className="img-container h-48 relative">
                      {img ? (
                        <div
                          className="img-bg w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${img}')` }}
                        />
                      ) : (
                        <div className="w-full h-full bg-capedig-beige-dark" />
                      )}
                      {/* Badge catégorie */}
                      <span
                        className="absolute top-3 left-3 text-[10.5px] font-bold
                                   tracking-[1.4px] px-2.5 py-1 rounded"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {cat.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-[16.5px] font-bold text-gray-900 mb-2">
                        {proj.titre}
                      </h3>
                      <p className="text-gray-500 text-[13.5px] leading-relaxed mb-4 line-clamp-2">
                        {proj.desc || proj.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {/* Statut : point coloré + libellé, discret et pro */}
                        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-500">
                          <span className="w-2 h-2 rounded-full inline-block"
                                style={{ background: stInfo.dot }} />
                          {stInfo.label}
                        </span>
                        <button
                          onClick={() => setSelected(proj)}
                          className="flex items-center gap-1 text-capedig-orange
                                     text-[13.5px] font-semibold
                                     hover:gap-2 transition-all duration-200"
                        >
                          Voir plus
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor"
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center
                           border border-capedig-beige-dark text-gray-600
                           hover:border-capedig-orange hover:text-capedig-orange
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-full font-semibold text-[14px]
                               transition-all duration-200
                               ${page === n
                                 ? 'bg-capedig-orange text-white shadow-md'
                                 : 'border border-capedig-beige-dark text-gray-600 hover:border-capedig-orange hover:text-capedig-orange'}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center
                           border border-capedig-beige-dark text-gray-600
                           hover:border-capedig-orange hover:text-capedig-orange
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA MEMBRE ── */}
      <section id="impact" className="bg-capedig-beige py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="reveal bg-capedig-brun rounded-2xl px-10 py-14 text-center
                          relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(212,100,26,0.12) 0%, transparent 70%)' }}
            />
            <h2 className="font-display text-white text-[30px] font-bold mb-4 relative z-10">
              Prêt à rejoindre l'aventure ?
            </h2>
            <p className="text-white/75 text-[15px] leading-relaxed mb-8 max-w-xl
                          mx-auto relative z-10">
              Vous êtes membre de la CAPEDIG-COOP CA ? Accédez à votre espace dédié
              pour suivre l'évolution de vos projets et gérer vos activités.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Link to="/login-producteur"
                className="btn-shine bg-capedig-orange text-white px-8 py-4
                           rounded-xl text-[15px] font-bold
                           transition-all duration-300 hover:bg-capedig-orange-light
                           hover:-translate-y-0.5">
                Accéder à l'espace producteurs
              </Link>
              <Link to="/contact"
                className="border-2 border-capedig-orange text-capedig-orange px-8 py-4
                           rounded-xl text-[15px] font-bold
                           transition-all duration-300 hover:bg-capedig-orange
                           hover:text-white">
                Devenir Membre
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL DÉTAIL PROJET ── */}
      {selected && (() => {
        const cat    = selected.categorie?.toLowerCase() || 'agricole'
        const colors = CAT_COLORS[cat] || CAT_COLORS.agricole
        const stInfo = STATUT_INFO[selected.statut] || STATUT_INFO.en_cours
        const rawImg = selected.image || selected.img_url || ''
        const img    = rawImg && !rawImg.startsWith('http') ? `/uploads/${rawImg}` : rawImg
        return (
          <div
            onClick={e => e.target === e.currentTarget && setSelected(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              style={{ animation: 'scaleIn 0.3s ease both' }}
            >
              {img && (
                <div className="w-full h-52 bg-cover bg-center rounded-t-2xl"
                     style={{ backgroundImage: `url('${img}')` }} />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10.5px] font-bold tracking-[1.4px] px-2.5 py-1 rounded"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {cat.toUpperCase()}
                  </span>
                  <button onClick={() => setSelected(null)}
                          className="text-gray-400 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-display text-[22px] font-bold text-gray-900 mb-2 leading-tight">
                  {selected.titre}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full inline-block"
                          style={{ background: stInfo.dot }} />
                    {stInfo.label}
                  </span>
                  {selected.date_debut && (
                    <span className="text-[12.5px] text-gray-400">
                      Depuis {new Date(selected.date_debut).toLocaleDateString('fr-FR',
                        { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-[14.5px] leading-relaxed whitespace-pre-line">
                  {selected.desc || selected.description}
                </p>
              </div>
            </div>
          </div>
        )
      })()}

      <Footer />
    </div>
  )
}
