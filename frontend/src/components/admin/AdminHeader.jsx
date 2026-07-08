import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { api } from '../../services/api'

function tempsEcoule(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.max(0, Math.round(diffMs / 60000))
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.round(h / 24)} j`
}

export default function AdminHeader({ title = 'Tableau de bord' }) {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [nonLues, setNonLues] = useState(0)
  const panelRef = useRef(null)

  const initial = user?.nom?.charAt(0)?.toUpperCase() || 'A'

  const chargerNotifications = () => {
    api.get('notifications/index.php')
      .then(data => {
        setNotifications(data.notifications || [])
        setNonLues(data.non_lues || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    chargerNotifications()
    const interval = setInterval(chargerNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showNotifs) return
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showNotifs])

  const handleToggleNotifs = () => {
    setShowNotifs(v => !v)
  }

  const handleMarquerTout = async () => {
    try {
      await api.post('notifications/marquer_lu.php', {})
      setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })))
      setNonLues(0)
    } catch {
      // silencieux : pas critique pour l'UX
    }
  }

  return (
    <header
      className="h-16 bg-white border-b border-gray-200 flex items-center
                justify-between px-8 sticky top-0 z-30"
      style={{ animation: 'fadeIn 0.5s ease both' }}
    >
      {/* Recherche */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5
                      w-full max-w-sm">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none"
             stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher producteurs, annonces..."
          className="flex-1 bg-transparent outline-none text-[13.5px] text-gray-700
                     placeholder-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <div className="relative" ref={panelRef}>
          <button onClick={handleToggleNotifs}
            className="relative text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {nonLues > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-capedig-orange
                               rounded-full text-[9.5px] font-bold text-white flex items-center justify-center">
                {nonLues > 9 ? '9+' : nonLues}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-9 w-80 bg-white rounded-2xl border
                            border-gray-200 shadow-xl z-40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-[13.5px] text-gray-900">Notifications</p>
                {nonLues > 0 && (
                  <button onClick={handleMarquerTout}
                    className="text-[12px] font-semibold text-capedig-orange hover:underline">
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 && (
                  <p className="text-[13px] text-gray-400 text-center py-6">Aucune notification</p>
                )}
                {notifications.map(n => (
                  <div key={n.id}
                    className={`px-4 py-3 text-[13px] ${!n.lu ? 'bg-capedig-orange/5' : ''}`}>
                    <p className="text-gray-700">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{tempsEcoule(n.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/admin/parametres')}
          className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-[13.5px] font-bold text-gray-900 leading-tight">
              {user?.nom || 'Administrateur'}
            </p>
            <p className="text-[11.5px] text-gray-400">
              {user?.role || 'Admin'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-capedig-orange flex items-center
                          justify-center text-white font-bold text-[14px] flex-shrink-0">
            {initial}
          </div>
        </div>
      </div>
    </header>
  )
}
