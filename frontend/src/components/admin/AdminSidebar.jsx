import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { api } from '../../services/api'

const NAV_MAIN = [
  {
    to: '/admin/dashboard',
    label: 'Tableau de bord',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    to: '/admin/producteurs',
    label: 'Gestion des producteurs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/annonces',
    label: 'Annonces',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    to: '/admin/actualites',
    label: 'Actualités',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2zM9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    to: '/admin/documents',
    label: 'Documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2a4 4 0 014-4h3.5M9 21V11a2 2 0 012-2h3.5L19 13.5V19a2 2 0 01-2 2H9z" />
      </svg>
    ),
  },
  {
    to: '/admin/projets',
    label: 'Projets & Activités',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/messages',
    label: 'Messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const NAV_RAPPORTS = [
  {
    to: '/admin/statistiques',
    label: 'Statistiques',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/admin/rapports',
    label: 'Rapports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6M4 20h16M5 4h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    to: '/admin/parametres',
    label: 'Paramètres',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function NavItem({ item, index = 0, active, unreadMessages }) {
  return (
    <Link
      to={item.to}
      style={{ animation: `fadeUp 0.4s ease ${index * 0.05}s both` }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px]
                  font-medium transition-all duration-200 group
                  ${active
                    ? 'bg-capedig-orange text-white shadow-md shadow-orange-900/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <span className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.to === '/admin/messages' && unreadMessages > 0 && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
          ${active ? 'bg-white text-capedig-orange' : 'bg-red-500 text-white'}`}>
          {unreadMessages}
        </span>
      )}
    </Link>
  )
}

export default function AdminSidebar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { logout } = useAuthContext()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const charger = () => {
      api.get('admin/stats.php')
        .then(d => setUnreadMessages(d?.messages_non_lus ?? 0))
        .catch(() => {})
    }
    charger()
    // Rafraîchit aussi périodiquement (pendant qu'on reste sur la même page)
    // et immédiatement quand un message est marqué lu ailleurs sur la page.
    const interval = setInterval(charger, 15000)
    window.addEventListener('capedig:messages-updated', charger)
    return () => {
      clearInterval(interval)
      window.removeEventListener('capedig:messages-updated', charger)
    }
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login-admin', { replace: true })
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r
                border-gray-200 flex flex-col z-40 overflow-y-auto"
      style={{ animation: 'slideInLeft 0.5s ease both' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-capedig-orange rounded-xl overflow-hidden
                          flex items-center justify-center flex-shrink-0
                          transition-transform duration-300 group-hover:scale-110">
            <img src="/logo/cape_logo_new.png" alt="CAPEDIG"
                 className="w-12 h-12 object-contain" />
          </div>
          <div>
            <p className="font-bold text-[13px] text-gray-900 leading-tight">
              CAPEDIG-COOP CA
            </p>
            <p className="text-[11px] font-bold text-capedig-orange tracking-[1px] uppercase">
              Administration
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_MAIN.map((item, i) => (
          <NavItem key={item.to} item={item} index={i}
            active={isActive(item.to)} unreadMessages={unreadMessages} />
        ))}

        {/* Séparateur Rapports */}
        <div className="pt-5 pb-2 px-3">
          <p className="text-[10.5px] font-bold text-gray-400 tracking-[1.5px] uppercase">
            Rapports
          </p>
        </div>

        {NAV_RAPPORTS.map((item, i) => (
          <NavItem key={item.to} item={item} index={NAV_MAIN.length + i}
            active={isActive(item.to)} unreadMessages={unreadMessages} />
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                     text-[14px] font-medium text-red-500 hover:bg-red-50
                     transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
