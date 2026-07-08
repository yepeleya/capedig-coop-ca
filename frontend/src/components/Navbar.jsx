import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/',           label: 'Accueil'    },
  { to: '/a-propos',   label: 'À propos'   },
  { to: '/activites',  label: 'Activités'  },
  { to: '/actualites', label: 'Actualités' },
  { to: '/contact',    label: 'Contact'    },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [elevation, setElevation] = useState(0)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
      setElevation(Math.min(window.scrollY / 200, 1))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400
        ${scrolled ? 'navbar-glass' : 'bg-transparent'}`}
      style={{
        height: '68px',
        boxShadow: scrolled
          ? `0 ${4 + elevation * 6}px ${16 + elevation * 12}px rgba(20,8,2,${0.06 + elevation * 0.06})`
          : 'none',
      }}
    >
      <div className={`max-w-7xl mx-auto h-full px-6 lg:px-8
                      flex items-center justify-between
                      ${scrolled ? 'text-gray-800' : 'text-white'}`}>

        {/* ─── LOGO ─── */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-14 h-14 bg-capedig-orange rounded-xl overflow-hidden
                          flex items-center justify-center flex-shrink-0
                          transition-transform duration-300 group-hover:scale-110
                          shadow-md shadow-orange-900/25">
            <img
              src="/logo/cape_logo_new.png"
              alt="CAPEDIG"
              className="w-16 h-16 object-contain"
            />
          </div>
          <span className={`font-bold text-[14.5px] tracking-wide
                           hidden sm:block leading-tight transition-colors duration-300
                           ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            CAPEDIG-COOP CA
          </span>
        </Link>

        {/* ─── LIENS DESKTOP ─── */}
        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link relative ${active ? 'active' : ''}`}
              >
                {label}
                {active && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2
                                   w-1.5 h-1.5 rounded-full bg-capedig-orange"
                        style={{ animation: 'scaleIn 0.25s ease both' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ─── BOUTON DROITE ───
             Seul l'espace producteur est accessible depuis la navigation
             publique. La connexion admin n'est jamais liée ici : exposer
             son URL publiquement faciliterait le brute-force sur ce compte
             sensible. L'admin y accède via un lien direct (favori/mémorisé). */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login-producteur"
            className="btn-shine flex items-center gap-2 bg-capedig-vert text-white
                       px-4 py-2.5 rounded-lg text-[13px] font-semibold
                       transition-all duration-300 hover:bg-capedig-vert-light
                       shadow-md"
          >
            {/* Icône blé */}
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            Espace Producteurs
          </Link>
        </div>

        {/* ─── BURGER MOBILE ─── */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors duration-200
                     ${scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6 transition-transform duration-300"
               style={{ transform: menuOpen ? 'rotate(90deg)' : 'none' }}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* ─── MENU MOBILE ─── */}
      <div
        className={`md:hidden absolute top-full left-0 right-0
                    bg-white border-t border-gray-100 shadow-lg
                    px-6 py-5 flex flex-col gap-3
                    transition-all duration-300 origin-top overflow-hidden
                    ${menuOpen
                      ? 'opacity-100 max-h-[400px]'
                      : 'opacity-0 max-h-0 pointer-events-none'}`}
      >
        {LINKS.map(({ to, label }, i) => (
          <Link
            key={to}
            to={to}
            className="text-gray-700 hover:text-capedig-orange hover:translate-x-1
                       text-[15px] font-medium py-1.5 border-b border-gray-100
                       last:border-0 transition-all duration-300"
            style={{
              transitionProperty: 'opacity, transform',
              transitionDelay: menuOpen ? `${i * 60}ms` : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
            }}
          >
            {label}
          </Link>
        ))}
        <div
          className="flex flex-col gap-3 pt-3 transition-all duration-300"
          style={{
            transitionDelay: menuOpen ? `${LINKS.length * 60}ms` : '0ms',
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <Link to="/login-producteur"
            className="btn-shine bg-capedig-vert text-white px-5 py-3 rounded-lg
                       text-[14px] font-semibold text-center transition-transform
                       duration-200 hover:scale-[1.02]">
            Espace Producteurs
          </Link>
        </div>
      </div>
    </header>
  )
}
