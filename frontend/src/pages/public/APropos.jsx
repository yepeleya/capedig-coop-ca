import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import EquipeDirigeants from '../../components/EquipeDirigeants'
import { useReveal } from '../../hooks/useReveal'
import { useCounter } from '../../hooks/useCounter'
import { useEffect, useRef, useState } from 'react'

// Données statiques
const TIMELINE = [
  {
    annee: '2015',
    texte: 'Fondation de la coopérative avec 30 membres fondateurs engagés.',
    side: 'left',
  },
  {
    annee: '2018',
    texte: 'Obtention de la première certification Fairtrade et expansion régionale.',
    side: 'right',
  },
  {
    annee: '2021',
    texte: "Lancement du programme de reboisement 'Vision Green' avec 10 000 arbres plantés.",
    side: 'left',
  },
  {
    annee: "Aujourd'hui",
    texte: "Plus de 3 000 producteurs membres et un impact national reconnu.",
    side: 'right',
    highlight: true,
  },
]

const MISSIONS = [
  {
    titre: 'Développement Durable',
    desc: "Préserver notre coopérative pour les générations futures grâce à des pratiques agroécologiques.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    titre: 'Accompagnement',
    desc: "Soutenir techniquement et financièrement chaque producteur dans sa croissance quotidienne.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    titre: 'Qualité Supérieure',
    desc: "Garantir un cacao d'exception répondant aux plus hauts standards internationaux.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    titre: 'Solidarité',
    desc: "Fédérer nos membres autour d'une vision commune pour une prospérité partagée et équitable.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function APropos() {
  useReveal()

  // Compteurs stats
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
  const c3000 = useCounter(3000, 1800, trigger)
  const c14   = useCounter(14,   1200, trigger)
  const c2005 = useCounter(2005, 1500, trigger)

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '60vh', paddingTop: '68px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero/hero-1-cabosses-arbre.jpg')",
            filter: 'brightness(0.35)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,8,2,0.5) 0%, rgba(20,8,2,0.7) 100%)' }}
        />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-20">
          <h1
            className="font-display text-white font-bold leading-[1.15] mb-6"
            style={{
              fontSize: 'clamp(36px, 5vw, 58px)',
              animation: 'fadeUp 0.85s ease 0.2s both',
              opacity: 0,
            }}
          >
            À propos de la<br />CAPEDIG-COOP CA
          </h1>
          <p
            className="text-white/80 text-[16px] leading-relaxed mb-8"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            Une coopérative engagée pour un cacao durable et la prospérité des producteurs
            en Côte d'Ivoire. Découvrez notre héritage et notre vision pour l'avenir.
          </p>
          <Link
            to="#engagement"
            className="btn-shine inline-block bg-capedig-orange text-white
                       px-8 py-4 rounded-xl text-[15px] font-semibold
                       transition-all duration-300 hover:bg-capedig-orange-light
                       hover:-translate-y-0.5"
            style={{ animation: 'fadeUp 0.85s ease 0.55s both', opacity: 0 }}
          >
            Notre Engagement
          </Link>
        </div>
      </section>

      {/* ── PRÉSENTATION 2 COLONNES ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Texte */}
          <div className="reveal-left">
            <p className="text-capedig-orange text-[11.5px] font-bold tracking-[2px]
                          uppercase mb-4">
              PRÉSENTATION GÉNÉRALE
            </p>
            <h2 className="font-display text-[32px] font-bold text-gray-900 leading-[1.25] mb-6">
              Notre Rôle en<br />Côte d'Ivoire
            </h2>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
              Basée au cœur des régions productrices, la CAPEDIG-COOP CA œuvre
              pour structurer la filière cacao et améliorer les conditions de vie
              de ses membres. Nous croyons en une agriculture qui respecte la terre
              tout en offrant une rémunération juste à ceux qui la travaillent.
            </p>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              Depuis notre siège social, nous coordonnons des collectes, des formations
              techniques et des programmes sociaux qui bénéficient à des milliers de
              familles à travers le pays.
            </p>
          </div>
          {/* Image */}
          <div className="reveal-right">
            <div className="img-container rounded-2xl overflow-hidden shadow-2xl
                            shadow-orange-900/15 aspect-[4/3]">
              <div
                className="img-bg w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('public/images2.jpeg')",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="bg-capedig-brun py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { val: c3000, suf: '+', label: 'Producteurs membres' },
            { val: c14,   suf: '',  label: 'Sections régionales' },
            { val: c2005, suf: '',  label: 'Année de fondation'  },
          ].map((s, i) => (
            <div key={i} className={`reveal delay-${i + 1}`}>
              <p className="font-display text-[52px] font-bold text-capedig-orange
                            leading-none mb-2">
                {s.val.toLocaleString('fr-FR')}{s.suf}
              </p>
              <p className="text-white/70 text-[14px] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="bg-capedig-beige py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="font-display text-[32px] font-bold text-gray-900 mb-4">
              Notre Histoire &amp; Étapes Clés
            </h2>
            <div className="w-14 h-[3px] bg-capedig-orange mx-auto rounded-full" />
          </div>

          {/* Timeline verticale */}
          <div className="relative">
            {/* Ligne centrale */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px]
                            bg-capedig-orange/30 -translate-x-1/2" />

            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className={`relative flex items-center mb-14 delay-${i + 1}
                            ${item.side === 'left' ? 'flex-row reveal-left' : 'flex-row-reverse reveal-right'}`}
              >
                {/* Contenu */}
                <div className={`w-[calc(50%-32px)]
                                 ${item.side === 'left' ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <span
                    className={`font-display text-[28px] font-bold block mb-2
                                 ${item.highlight ? 'text-capedig-orange' : 'text-gray-900'}`}
                  >
                    {item.annee}
                  </span>
                  <p className="text-gray-600 text-[14.5px] leading-relaxed">{item.texte}</p>
                </div>

                {/* Point central */}
                <div className="flex-shrink-0 z-10">
                  <div className={`w-14 h-14 rounded-full border-4 border-white shadow-lg
                                   flex items-center justify-center
                                   ${item.highlight
                                     ? 'bg-capedig-orange'
                                     : 'bg-white border-capedig-orange'}`}>
                    <div className={`w-4 h-4 rounded-full
                                     ${item.highlight
                                       ? 'bg-white'
                                       : 'bg-capedig-orange'}`} />
                  </div>
                </div>

                {/* Espace côté opposé */}
                <div className="w-[calc(50%-32px)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSIONS & VALEURS ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-[32px] font-bold text-gray-900 mb-4">
              Nos Missions &amp; Valeurs
            </h2>
            <div className="w-14 h-[3px] bg-capedig-orange mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSIONS.map((m, i) => (
              <div
                key={i}
                className={`card-hover bg-capedig-beige rounded-2xl p-7
                            border border-capedig-beige-dark reveal delay-${i + 1}`}
              >
                <div className="w-11 h-11 rounded-xl bg-capedig-vert/15
                                flex items-center justify-center mb-5
                                text-capedig-vert">
                  {m.icon}
                </div>
                <h3 className="font-display text-[17px] font-bold text-gray-900 mb-3">
                  {m.titre}
                </h3>
                <p className="text-gray-500 text-[13.5px] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRIGEANTS ── */}
      <section className="bg-capedig-beige py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-[32px] font-bold text-gray-900 mb-3">
              Nos Dirigeants
            </h2>
            <p className="text-gray-500 text-[15px] max-w-lg mx-auto">
              Une direction transparente et engagée pour la réussite de tous nos membres.
            </p>
          </div>
          <EquipeDirigeants />
        </div>
      </section>

      {/* ── ENGAGEMENTS STRATÉGIQUES ── */}
      <section id="engagement" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <h2 className="font-display text-[32px] font-bold text-gray-900 mb-4">
              Nos Engagements Stratégiques
            </h2>
            <div className="w-14 h-[3px] bg-capedig-orange mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                titre: 'Social',
                desc: "Construction d'écoles et de centres de santé dans nos zones rurales d'activité.",
                icon: '👥', color: '#D4641A',
              },
              {
                titre: 'Économique',
                desc: 'Prime de qualité et fonds de soutien pour stabiliser le revenu des planteurs.',
                icon: '📈', color: '#2D6A4F',
              },
              {
                titre: 'Environnemental',
                desc: "Objectif zéro déforestation et promotion de l'agroforesterie certifiée.",
                icon: '🌿', color: '#D4641A',
              },
            ].map((eng, i) => (
              <div
                key={i}
                className={`flex gap-4 items-start reveal delay-${i + 1}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center
                                flex-shrink-0 text-xl"
                  style={{ background: `${eng.color}18` }}>
                  {eng.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[17px] text-gray-900 mb-2">{eng.titre}</h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed">{eng.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
