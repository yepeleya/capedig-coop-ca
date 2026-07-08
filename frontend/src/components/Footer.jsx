import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',           label: 'Accueil'    },
  { to: '/a-propos',   label: 'Notre Histoire' },
  { to: '/activites',  label: 'Projets'    },
  { to: '/contact',    label: 'Contact'    },
]

export default function Footer() {
  const [email, setEmail]     = useState('')
  const [subSent, setSubSent] = useState(false)

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    // POST vers /api/newsletter/subscribe.php
    fetch('/api/newsletter/subscribe.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .catch(() => {})
      .finally(() => { setSubSent(true); setEmail('') })
  }

  return (
    <footer className="bg-capedig-brun text-white">
      {/* ── Contenu principal ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-12
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Col 1 — Brand */}
        <div className="reveal delay-1">
          <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
            <div className="w-12 h-12 bg-capedig-orange rounded-xl overflow-hidden
                            flex items-center justify-center
                            transition-transform duration-300 group-hover:scale-110 shadow-md">
              <img
                src="/logo/cape_logo_new.png"
                alt="CAPEDIG"
                className="w-14 h-14 object-contain"
              />
            </div>
            <span className="text-white font-bold text-[14.5px] tracking-wide leading-tight">
              CAPEDIG-COOP CA
            </span>
          </Link>
          <p className="text-white/65 text-[13.5px] leading-relaxed mb-7">
            Ensemble pour une filière cacao ivoirienne plus forte,
            plus juste et plus durable.
          </p>
          {/* Réseaux sociaux */}
          <div className="flex gap-3">
            {[
              { label: 'Facebook',
                path: 'M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.88h-2.4v6.99A10 10 0 0 0 22 12Z' },
              { label: 'Email',
                path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { label: 'Personnes',
                path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            ].map(({ label, path }) => (
              <a key={label} href="#" aria-label={label}
                className="w-10 h-10 rounded-lg border border-white/20 flex items-center
                           justify-center text-white/70 hover:text-white
                           hover:bg-white/10 hover:border-white/45
                           transition-all duration-250">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Liens rapides */}
        <div className="reveal delay-2">
          <h4 className="text-white font-bold text-[14px] tracking-wide mb-6">
            Liens Rapides
          </h4>
          <ul className="space-y-4">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}
                  className="flex items-center gap-0 text-white/65 text-[13.5px]
                             hover:text-white hover:gap-2 hover:pl-1
                             transition-all duration-250 group">
                  <span className="w-0 overflow-hidden transition-all duration-250
                                   group-hover:w-3 text-capedig-orange font-bold text-[12px]">
                    →
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Contact */}
        <div className="reveal delay-3">
          <h4 className="text-white font-bold text-[14px] tracking-wide mb-6">
            Contact
          </h4>
          <ul className="space-y-5">
            {[
              {
                path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                text: 'Siège Social, Quartier Commerce,\nAbidjan, Côte d\'Ivoire',
              },
              {
                path: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                text: '+225 07 00 00 00 00',
              },
              {
                path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                text: 'contact@capedigcoop.ci',
              },
            ].map(({ path, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-capedig-orange/20 flex items-center
                                justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-capedig-orange"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={1.8} d={path} />
                  </svg>
                </div>
                <span className="text-white/65 text-[13.5px] leading-relaxed whitespace-pre-line">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Newsletter */}
        <div className="reveal delay-4">
          <h4 className="text-white font-bold text-[14px] tracking-wide mb-6">
            Newsletter
          </h4>
          <p className="text-white/65 text-[13.5px] leading-relaxed mb-5">
            Restez informé de nos projets et innovations.
          </p>
          {subSent ? (
            <div className="bg-capedig-vert/30 border border-capedig-vert
                            text-white text-[13.5px] px-4 py-3 rounded-xl">
              ✓ Inscription confirmée !
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Votre email"
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl
                           px-4 py-3 text-[13.5px] text-white placeholder-white/40
                           outline-none focus:border-capedig-orange transition-colors
                           min-w-0"
              />
              <button type="submit"
                className="btn-shine bg-capedig-orange text-white px-4 py-3
                           rounded-xl font-semibold text-[13.5px] flex-shrink-0
                           transition-all duration-250 hover:bg-capedig-orange-light">
                Ok
              </button>
            </form>
          )}
          {/* Localisation */}
          <div className="mt-6 bg-white/8 border border-white/12 rounded-xl
                          p-4 text-center">
            <svg className="w-7 h-7 text-capedig-orange mx-auto mb-2"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white/75 text-[12px] font-bold tracking-[0.8px] uppercase">
              Abidjan, Ivory Coast
            </p>
            <p className="text-white/45 text-[11px] mt-1">
              Région du Guémon — Côte d'Ivoire
            </p>
          </div>
        </div>
      </div>

      {/* ── Barre bottom ── */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-[12px] text-white/38">
          <span>© {new Date().getFullYear()} CAPEDIG-COOP CA — Tous droits réservés.</span>
          <span>Design institutionnel par CAPEDIG Media Team.</span>
        </div>
      </div>
    </footer>
  )
}
