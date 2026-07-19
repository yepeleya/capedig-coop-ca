// ─── IMPORTANT POUR CLAUDE CODE ────────────────────────────
// Le dashboard admin n'existe pas encore : "Nos Services & Ressources"
// et "Actualités" affichent pour l'instant les données statiques
// FALLBACK définies ci-dessous. Quand le dashboard sera prêt, on
// remplacera ces tableaux par des fetch() vers :
//   - Annonces       → GET /api/annonces/index.php?statut=publiee&limit=4
//   - Documents      → GET /api/documents/index.php?acces=tous&limit=4
//   - Projets        → GET /api/projets/index.php?limit=4
//   - Actualités     → GET /api/actualites/index.php?limit=3
// ────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import CacaoCanvas from '../../components/CacaoCanvas'
import HeroSlider, { SLIDES as HERO_SLIDES } from '../../components/HeroSlider'
import PartenairesCarousel from '../../components/PartenairesCarousel'
import CertificationsCarousel from '../../components/CertificationsCarousel'
import { useReveal } from '../../hooks/useReveal'
import { useCounter } from '../../hooks/useCounter'
import { isVideoFile, stripHtml } from '../../utils/richContent'

// ── Données fallback (si API indisponible) ──────────────────
const SERVICES_FALLBACK = [
  {
    id: 1,
    titre: 'Annonces',
    description: 'Dernières nouvelles du marché mondial du cacao et prix officiels bord champ.',
    lien: '/actualites',
    labelLien: 'Voir plus',
    image: '/hero/hero-2-cabosse-lumiere.jpg',
  },
  {
    id: 2,
    titre: 'Documents Officiels',
    description: 'Accédez aux statuts, règlements intérieurs et rapports annuels de la coopérative.',
    lien: '/login-producteur',
    labelLien: 'Télécharger',
    image: '/hero/hero-4-cabosse-dramatique.jpg',
  },
  {
    id: 3,
    titre: 'Projets & Activités',
    description: "Découvrez nos initiatives sur le terrain pour l'amélioration de la productivité.",
    lien: '/activites',
    labelLien: 'Explorer',
    image: '/hero/hero-1-cabosses-arbre.jpg',
  },
  {
    id: 4,
    titre: 'Communication Interne',
    description: "Espace d'échange pour les membres : assemblées générales et réunions.",
    lien: '/login-producteur',
    labelLien: 'Accéder',
    image: '/hero/hero-2-cabosse-lumiere.jpg',
  },
]


const ACTUS_FALLBACK = [
  {
    id: 1,
    image: '/hero/hero-3-panier-recolte.jpg',
    categorie: 'RÉCOLTE', catBg: '#D4641A',
    titre: 'Prévisions de la récolte principale 2024',
    contenu: "Analyse des conditions météorologiques et des rendements attendus pour la prochaine campagne de cacao...",
    date: '15 Nov 2024',
  },
  {
    id: 2,
    image: '/hero/hero-1-cabosses-arbre.jpg',
    categorie: 'FORMATION', catBg: '#2D6A4F',
    titre: "Session de formation sur l'agroforesterie",
    contenu: "Nos techniciens accompagnent 150 producteurs dans la mise en œuvre de pratiques écologiques durables...",
    date: '8 Nov 2024',
  },
  {
    id: 3,
    image: '/hero/hero-2-cabosse-lumiere.jpg',
    categorie: 'COMMUNAUTÉ', catBg: '#0068B4',
    titre: 'Inauguration du nouveau centre de santé',
    contenu: "Grâce aux primes de certification, la coopérative a financé un centre médical pour les familles des producteurs...",
    date: '2 Nov 2024',
  },
]

// ── Composant HeroTitle ──────────────────────────────────────
// Reveal mot par mot avec perspective 3D. Reçoit ses lignes en prop pour
// pouvoir rejouer l'animation à chaque changement de slide (via `key`
// sur le parent, qui force le remount de ce composant).
function HeroTitle({ lines }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) { setVisible(true); return }
    const id = requestAnimationFrame(() => setTimeout(() => setVisible(true), 150))
    return () => cancelAnimationFrame(id)
  }, [])

  let wordIndex = 0

  return (
    <h1
      className="text-white font-display font-bold leading-[1.15]"
      style={{ fontSize: 'clamp(34px, 4.8vw, 54px)' }}
    >
      {lines.map((line, li) => (
        <span
          key={li}
          className={line.gradient ? (visible ? 'text-gradient-shimmer' : 'text-gradient') : ''}
        >
          {line.words.map((word) => {
            const idx = wordIndex++
            return (
              <span
                key={idx}
                className={`word-up mr-[0.28em] ${visible ? 'visible' : ''}`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {word}
              </span>
            )
          })}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </h1>
  )
}

// ── Composant SkeletonCard ──────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-capedig-beige rounded-xl overflow-hidden border border-capedig-beige-dark">
      <div className="h-[130px] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  )
}

// ── Composant SkeletonActu ──────────────────────────────────
function SkeletonActu() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-capedig-beige-dark">
      <div className="h-[190px] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded w-1/4" />
        <div className="h-5 skeleton rounded w-4/5" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function Accueil() {
  // ── Scroll reveal ─────────────────────────────────────────
  useReveal()

  // ── Stats — trigger quand la section est visible ──────────
  const statsRef   = useRef(null)
  const [statsTrigger, setStatsTrigger] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsTrigger(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const c3000 = useCounter(3000, 1800, statsTrigger)
  const c10   = useCounter(10,   1200, statsTrigger)
  const c100  = useCounter(100,  1500, statsTrigger)

  // ── Hero : index du slide actif, synchronisé depuis HeroSlider ──
  const [slideIndex, setSlideIndex] = useState(0)
  const activeSlide = HERO_SLIDES[slideIndex] || HERO_SLIDES[0]

  // ── Services : données statiques en attendant le dashboard ──
  const services     = SERVICES_FALLBACK
  const loadServices = false

  // ── Actualités : 3 dernières publiées, fallback si vide/indisponible ──
  const [actus, setActus] = useState([])
  const [loadActus, setLoadActus] = useState(true)
  useEffect(() => {
    fetch('/api/actualites/index.php?limit=3')
      .then(r => r.ok ? r.json() : [])
      .then(data => setActus(Array.isArray(data) ? data : []))
      .catch(() => setActus([]))
      .finally(() => setLoadActus(false))
  }, [])

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO                                   */}
      {/* ════════════════════════════════════════════════════ */}
      <section
        className="relative hero-clip overflow-hidden"
        style={{ minHeight: 'clamp(560px, 100vh, 960px)', paddingTop: '68px' }}
      >
        {/* Slideshow d'images (cabosses, fèves, plantations) avec effet Ken Burns */}
        <HeroSlider onIndexChange={setSlideIndex} />

        {/* Overlay gradient directionnel */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(18,6,0,0.90) 0%, rgba(18,6,0,0.4) 30%, rgba(18,6,0,0.0) 98%)',
          }}
        />

        {/* Blob décoratif orange */}
        <div
          className="absolute top-16 right-10 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: '#D4641A', opacity: 0.06, filter: 'blur(90px)' }}
        />
        {/* Blob décoratif vert */}
        <div
          className="absolute bottom-24 right-32 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: '#2D6A4F', opacity: 0.08, filter: 'blur(70px)' }}
        />

        {/* Fèves de cacao flottantes + particules — Canvas2D léger */}
        <CacaoCanvas className="z-[5]" />

        {/* Contenu */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex items-center"
          style={{ minHeight: 'calc(clamp(560px, 100vh, 960px) - 68px)' }}
        >
          {/* `key` force le remount à chaque changement de slide, ce qui
              rejoue les animations d'entrée (badge, titre mot-par-mot,
              sous-titre) avec le nouveau texte accrocheur. */}
          <div className="max-w-[620px]" key={slideIndex}>

            {/* Badge — change selon le slide actif */}
            <div
              className="inline-block bg-capedig-orange text-white text-[11px]
                         font-bold tracking-[2px] px-3.5 py-1.5 rounded mb-7"
              style={{ animation: 'fadeIn 0.8s ease 0.1s both', opacity: 0 }}
            >
              {activeSlide.badge}
            </div>

            {/* Titre H1 — reveal mot par mot avec profondeur 3D */}
            <HeroTitle lines={activeSlide.titleLines} />

            {/* Sous-titre — change selon le slide actif */}
            <p
              className="text-white/85 leading-relaxed mt-6 mb-10"
              style={{
                fontSize: 'clamp(14px, 1.6vw, 16px)',
                animation: 'fadeUp 0.85s ease 0.5s both',
                opacity: 0,
              }}
            >
              {activeSlide.subtitle}
            </p>

            {/* Boutons CTA */}
            <div
              className="flex flex-wrap gap-4"
              style={{ animation: 'fadeUp 0.85s ease 0.65s both', opacity: 0 }}
            >
              <Link
                to="/a-propos"
                className="btn-shine bg-capedig-orange text-white px-8 py-4
                           rounded-xl text-[15px] font-semibold
                           transition-all duration-300 hover:bg-capedig-orange-light
                           hover:-translate-y-0.5 shadow-lg shadow-orange-900/25"
              >
                En savoir plus
              </Link>
              <Link
                to="/activites"
                className="text-white px-8 py-4 rounded-xl text-[15px] font-medium
                           border border-white/35 backdrop-blur-sm
                           transition-all duration-300 hover:bg-white/15
                           hover:border-white/60 hover:-translate-y-0.5"
              >
                Nos activités
              </Link>
            </div>

            {/* Indicateur de scroll */}
            <div
              className="mt-20 flex items-center gap-3 text-white/40"
              style={{ animation: 'fadeIn 1s ease 1.4s both', opacity: 0 }}
            >
              <div className="w-10 h-px bg-white/25" />
              <span className="text-[11px] tracking-[2.5px] font-medium uppercase">Défiler</span>
              <svg
                className="w-4 h-4 animate-bounce"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 2 — STATS                                  */}
      {/* ════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="#D4641A" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              label: 'PRODUCTEURS', value: c3000, suffix: '+',
              note: '+5% cette année', noteColor: '#D4641A',
              noteIcon: '↗',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="#D4641A" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
              label: 'CERTIFICATIONS', value: c10, suffix: '+',
              note: 'Global G.A.P, Fairtrade', noteColor: '#D4641A',
              noteIcon: '✓',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="#2D6A4F" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              label: 'DURABILITÉ', value: c100, suffix: '%',
              note: 'Traçabilité complète', noteColor: '#2D6A4F',
              noteIcon: '✓',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-capedig-beige rounded-2xl p-7 reveal delay-${i + 1}
                          transition-all duration-300 cursor-default
                          hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-900/8`}
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center
                              justify-center mb-5 shadow-sm">
                {stat.icon}
              </div>
              <p className="text-[11px] font-bold tracking-[1.8px] text-gray-400 mb-2">
                {stat.label}
              </p>
              <p className="font-display text-[44px] font-bold text-gray-900 leading-none mb-2">
                {stat.value.toLocaleString('fr-FR')}{stat.suffix}
              </p>
              <p
                className="text-[12.5px] font-medium flex items-center gap-1.5"
                style={{ color: stat.noteColor }}
              >
                <span className="font-bold">{stat.noteIcon}</span>
                {stat.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 3 — NOS SERVICES & RESSOURCES              */}
      {/* ════════════════════════════════════════════════════ */}
      <section className="bg-capedig-beige py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-[32px] font-bold text-gray-900 mb-4">
              Nos Services &amp; Ressources
            </h2>
            <div className="w-14 h-[3px] bg-capedig-orange mx-auto mb-5 rounded-full" />
            <p className="text-gray-500 text-[15px] max-w-xl mx-auto leading-relaxed">
              Nous mettons à disposition de nos membres et partenaires
              les outils nécessaires pour une filière cacao performante.
            </p>
          </div>

          {/* Grille 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadServices
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : (services.length ? services : SERVICES_FALLBACK).map((svc, i) => (
                <div
                  key={svc.id || i}
                  className={`card-hover bg-white rounded-2xl overflow-hidden
                              border border-capedig-beige-dark reveal delay-${i + 1}`}
                >
                  {/* Image */}
                  <div className="img-container h-[130px]">
                    <div
                      className="img-bg w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${svc.image || SERVICES_FALLBACK[i]?.image}')`,
                      }}
                    />
                  </div>
                  {/* Corps */}
                  <div className="p-5">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center
                                    justify-center mb-3 text-capedig-orange">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-display text-[15.5px] font-bold text-gray-900 mb-2">
                      {svc.titre}
                    </h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-4 line-clamp-3">
                      {svc.description || svc.contenu}
                    </p>
                    <Link
                      to={svc.lien || '/actualites'}
                      className="inline-flex items-center gap-1.5 text-capedig-orange
                                 text-[13px] font-semibold group/link
                                 transition-all duration-200"
                    >
                      {svc.labelLien || 'Voir plus'}
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-200
                                   group-hover/link:translate-x-1"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 4 — CARROUSEL CERTIFICATIONS               */}
      {/* ════════════════════════════════════════════════════ */}
      <section className="bg-white py-12 border-y border-capedig-beige-dark">
        <div className="max-w-7xl mx-auto px-6 mb-8 reveal text-center">
          <p className="text-[11px] font-bold tracking-[1.8px] text-gray-400 uppercase mb-1">
            CERTIFIÉS PAR L'EXCELLENCE
          </p>
          <h3 className="font-display text-[18px] font-bold text-gray-700">
            Nos certifications
          </h3>
        </div>
        <CertificationsCarousel />
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 4bis — PARTENAIRES                         */}
      {/* ════════════════════════════════════════════════════ */}
      <section className="bg-capedig-beige py-12">
        <div className="max-w-7xl mx-auto px-6 mb-6 reveal text-center">
          <p className="text-[11px] font-bold tracking-[1.8px] text-gray-400 uppercase mb-1">
            ILS NOUS FONT CONFIANCE
          </p>
          <h3 className="font-display text-[18px] font-bold text-gray-700">
            Nos partenaires
          </h3>
        </div>
        <PartenairesCarousel />
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 5 — CTA MEMBRE                             */}
      {/* ════════════════════════════════════════════════════ */}
      <section className="bg-capedig-beige py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="reveal bg-capedig-brun rounded-2xl px-10 lg:px-16 py-14
                        flex flex-col lg:flex-row items-center justify-between
                        gap-10 relative overflow-hidden"
          >
            {/* Décors lumineux */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: '#D4641A', opacity: 0.07,
                       filter: 'blur(90px)', transform: 'translate(30%,-30%)' }}
            />
            <div
              className="absolute bottom-0 left-24 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: '#52B788', opacity: 0.07,
                       filter: 'blur(70px)', transform: 'translateY(30%)' }}
            />

            <div className="relative z-10 max-w-xl">
              <h2 className="font-display text-white text-[28px] lg:text-[32px]
                             font-bold leading-[1.25] mb-4">
                Vous êtes un membre de la<br />CAPEDIG-COOP CA ?
              </h2>
              <p className="text-white/75 text-[15px] leading-relaxed">
                Accédez à votre tableau de bord personnel pour suivre vos
                livraisons, paiements et documents administratifs en temps réel.
              </p>
            </div>

            <Link
              to="/login-producteur"
              className="btn-shine relative z-10 flex-shrink-0
                         bg-capedig-orange text-white px-9 py-4
                         rounded-xl text-[15px] font-bold whitespace-nowrap
                         transition-all duration-300 hover:bg-capedig-orange-light
                         hover:-translate-y-0.5 hover:shadow-2xl
                         shadow-lg shadow-orange-900/30"
            >
              Accéder à votre espace →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/* SECTION 6 — ACTUALITÉS                             */}
      {/* ════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex items-end justify-between mb-12 reveal">
            <div>
              <p className="text-capedig-orange text-[11px] font-bold
                            tracking-[2.5px] uppercase mb-2">
                ACTUALITÉS
              </p>
              <h2 className="font-display text-[30px] lg:text-[34px] font-bold text-gray-900">
                Dernières Mises à Jour
              </h2>
            </div>
            <Link
              to="/actualites"
              className="hidden sm:flex items-center gap-2 text-capedig-orange
                         text-[14px] font-semibold group/voir
                         transition-all duration-200 hover:gap-3"
            >
              Voir tout le blog
              <svg className="w-4 h-4 transition-transform duration-200
                             group-hover/voir:translate-x-1"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Grille 3 articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadActus
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonActu key={i} />)
              : (actus.length ? actus : ACTUS_FALLBACK).slice(0, 3).map((actu, i) => {
                  const isReal   = actus.length > 0
                  const rawImg   = actu.image || ACTUS_FALLBACK[i]?.image
                  const img      = isReal && rawImg && !rawImg.startsWith('http')
                                   ? `/uploads/${rawImg}` : rawImg
                  const video    = isReal && isVideoFile(actu.image)
                  const cat      = actu.categorie || ACTUS_FALLBACK[i]?.categorie || 'ACTUALITÉ'
                  const catBg    = actu.catBg     || ACTUS_FALLBACK[i]?.catBg     || '#D4641A'
                  const titre    = actu.titre
                  const contenu  = isReal ? stripHtml(actu.contenu, 120) : actu.contenu
                  const lien     = isReal ? `/actualites/${actu.id}` : '/actualites'
                  const dateStr  = actu.date
                    ? actu.date
                    : actu.created_at
                      ? new Date(actu.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : ACTUS_FALLBACK[i]?.date

                  return (
                    <article
                      key={actu.id || i}
                      className={`actu-card bg-capedig-beige rounded-2xl overflow-hidden
                                  border border-capedig-beige-dark reveal delay-${i + 1}`}
                    >
                      {/* Image */}
                      <div className="img-container h-[195px] bg-gray-900 relative">
                        {video ? (
                          <>
                            <video src={img} className="w-full h-full object-cover opacity-70" muted />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-capedig-orange" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div
                            className="img-bg w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${img}')` }}
                          />
                        )}
                      </div>
                      {/* Corps */}
                      <div className="p-6">
                        <span
                          className="inline-block text-white text-[10px] font-bold
                                     tracking-[1.5px] px-3 py-1 rounded mb-3"
                          style={{ background: catBg }}
                        >
                          {cat.toUpperCase()}
                        </span>
                        <h3 className="font-display text-[17px] font-bold text-gray-900
                                       leading-snug mb-3">
                          {titre}
                        </h3>
                        <p className="text-gray-500 text-[13.5px] leading-relaxed
                                      mb-4 line-clamp-3">
                          {contenu}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-gray-400">{dateStr}</span>
                          <Link
                            to={lien}
                            className="text-capedig-orange text-[13px] font-semibold
                                       hover:underline underline-offset-2 transition"
                          >
                            Lire →
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })
            }
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
