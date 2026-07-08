import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'
import { api } from '../../services/api'
import { stripHtml } from '../../utils/richContent'

// ── Icônes de type fichier ────────────────────────────────
const FILE_ICONS = {
  pdf:  { color: '#EF4444', bg: '#FEF2F2', label: 'PDF' },
  docx: { color: '#3B82F6', bg: '#EFF6FF', label: 'DOCX' },
  doc:  { color: '#3B82F6', bg: '#EFF6FF', label: 'DOC' },
  xlsx: { color: '#22C55E', bg: '#F0FDF4', label: 'XLSX' },
  xls:  { color: '#22C55E', bg: '#F0FDF4', label: 'XLS' },
  jpg:  { color: '#8B5CF6', bg: '#F5F3FF', label: 'JPG' },
  jpeg: { color: '#8B5CF6', bg: '#F5F3FF', label: 'JPG' },
  png:  { color: '#8B5CF6', bg: '#F5F3FF', label: 'PNG' },
}

function FileIcon({ type }) {
  const ext  = (type || 'pdf').toLowerCase()
  const info = FILE_ICONS[ext] || FILE_ICONS.pdf
  return (
    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
         style={{ background: info.bg }}>
      <span className="font-bold text-[13px]" style={{ color: info.color }}>
        {info.label}
      </span>
    </div>
  )
}

// ── Icônes SVG (cohérentes avec le reste de la plateforme) ──
const ICONS = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  annonces: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  documents: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17v-2a4 4 0 014-4h3.5M9 21V11a2 2 0 012-2h3.5L19 13.5V19a2 2 0 01-2 2H9z" />
    </svg>
  ),
  messagerie: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  profil: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  actualites: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2zM9 8h6M9 12h6M9 16h4" />
    </svg>
  ),
  telechargements: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  horloge: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  crayon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l9.586-9.586z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  cloche: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
}

function tempsEcoule(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.max(0, Math.round(diffMs / 60000))
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.round(h / 24)} j`
}

function NotificationBell({ onGoToMessagerie }) {
  const [notifications, setNotifications] = useState([])
  const [nonLues, setNonLues] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  const charger = () => {
    api.get('notifications/index.php')
      .then(d => {
        setNotifications(d.notifications || [])
        setNonLues(d.non_lues || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    charger()
    const interval = setInterval(charger, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleMarquerTout = async () => {
    try {
      await api.post('notifications/marquer_lu.php', {})
      setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })))
      setNonLues(0)
    } catch {
      // pas critique pour l'UX
    }
  }

  const handleClickNotif = (n) => {
    setOpen(false)
    if (n.lien === '/producteur/dashboard') onGoToMessagerie()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-lg border border-capedig-beige-dark flex items-center
                   justify-center text-gray-500 hover:bg-gray-50 transition-all duration-200">
        {ICONS.cloche}
        {nonLues > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-capedig-orange
                           rounded-full text-[9.5px] font-bold text-white flex items-center justify-center">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border
                        border-capedig-beige-dark shadow-xl z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-capedig-beige-dark">
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
              <button key={n.id} onClick={() => handleClickNotif(n)}
                className={`w-full text-left px-4 py-3 text-[13px] hover:bg-gray-50
                           transition-colors ${!n.lu ? 'bg-capedig-orange/5' : ''}`}>
                <p className="text-gray-700">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{tempsEcoule(n.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SideLink({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px]
                  font-medium transition-all duration-200 text-left
                  ${active
                    ? 'bg-capedig-orange/12 text-capedig-orange'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <span className={active ? 'text-capedig-orange' : 'text-gray-400'}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="min-w-[18px] h-[18px] px-1 bg-capedig-orange rounded-full
                         text-[9.5px] font-bold text-white flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-10 text-gray-400">
      <div className="w-12 h-12 mx-auto mb-3 opacity-50 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[13.5px]">{text}</p>
    </div>
  )
}

function dateHeure(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  const isToday =
    d.getDate()    === today.getDate() &&
    d.getMonth()   === today.getMonth() &&
    d.getFullYear()=== today.getFullYear()
  if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' +
         d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ════════════════════════════════════════════════════════════
export default function DashboardProducteur() {
  const { user } = useAuth('/login-producteur')
  const { logout } = useAuthContext()
  const navigate = useNavigate()

  const [activePage, setActivePage] = useState('dashboard')

  const [annonces,     setAnnonces]     = useState([])
  const [documents,    setDocuments]    = useState([])
  const [actualites,   setActualites]   = useState([])
  const [telechargements, setTelechargements] = useState([])
  const [docCategorie, setDocCategorie] = useState('Toutes')
  const [loadAnn,      setLoadAnn]      = useState(true)
  const [loadDoc,      setLoadDoc]      = useState(true)
  const [loadAct,      setLoadAct]      = useState(false)
  const [loadTel,      setLoadTel]      = useState(false)
  const [actSearch,    setActSearch]    = useState('')
  const [selectedActualite, setSelectedActualite] = useState(null)

  const [selectedAnnonce, setSelectedAnnonce] = useState(null)

  // ── Profil éditable ──
  const [profil,         setProfil]         = useState(null)
  const [profilEdit,     setProfilEdit]      = useState({ nom: '', prenom: '', telephone: '', localisation: '' })
  const [profilPhoto,    setProfilPhoto]     = useState(null)
  const [profilPhotoUrl, setProfilPhotoUrl]  = useState(null)
  const [profilSending,  setProfilSending]   = useState(false)
  const [profilOk,       setProfilOk]        = useState('')
  const [profilErr,      setProfilErr]       = useState('')
  const [mdpForm,        setMdpForm]         = useState({ ancien: '', nouveau: '', confirm: '' })
  const [mdpSending,     setMdpSending]      = useState(false)
  const [mdpOk,          setMdpOk]           = useState('')
  const [mdpErr,         setMdpErr]          = useState('')

  const chargerProfil = () => {
    api.get('producteurs/profil.php')
      .then(d => {
        if (d.success && d.profil) {
          setProfil(d.profil)
          setProfilEdit({
            nom: d.profil.nom || '',
            prenom: d.profil.prenom || '',
            telephone: d.profil.telephone || '',
            localisation: d.profil.localisation || '',
          })
          setProfilPhotoUrl(d.profil.photo_url)
        }
      })
      .catch(() => {})
  }

  const chargerActualites = () => {
    setLoadAct(true)
    api.get('actualites/index.php', { limit: 20 })
      .then(d => setActualites(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadAct(false))
  }

  const chargerTelechargements = () => {
    setLoadTel(true)
    api.get('documents/historique.php')
      .then(d => setTelechargements(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadTel(false))
  }

  const handleProfilSubmit = async (e) => {
    e.preventDefault()
    setProfilSending(true)
    setProfilErr('')
    setProfilOk('')
    try {
      const fd = new FormData()
      fd.append('nom',          profilEdit.nom)
      fd.append('prenom',       profilEdit.prenom)
      fd.append('telephone',    profilEdit.telephone)
      fd.append('localisation', profilEdit.localisation)
      if (profilPhoto) fd.append('photo', profilPhoto)
      const res = await api.postForm('producteurs/update_profil.php', fd)
      if (res.success) {
        setProfilOk('Profil mis à jour avec succès.')
        if (res.photo_url) setProfilPhotoUrl(res.photo_url)
        setProfilPhoto(null)
        chargerProfil()
      }
    } catch (e) {
      setProfilErr(e.message || 'Erreur lors de la mise à jour')
    } finally {
      setProfilSending(false)
    }
  }

  const handleMdpSubmit = async (e) => {
    e.preventDefault()
    if (mdpForm.nouveau !== mdpForm.confirm) {
      setMdpErr('Les mots de passe ne correspondent pas.')
      return
    }
    if (mdpForm.nouveau.length < 8) {
      setMdpErr('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }
    setMdpSending(true)
    setMdpErr('')
    setMdpOk('')
    try {
      await api.post('producteurs/change_password.php', {
        ancien_mdp: mdpForm.ancien,
        nouveau_mdp: mdpForm.nouveau,
      })
      setMdpOk('Mot de passe modifié avec succès.')
      setMdpForm({ ancien: '', nouveau: '', confirm: '' })
    } catch (e) {
      setMdpErr(e.message || 'Erreur')
    } finally {
      setMdpSending(false)
    }
  }

  const handleTelecharger = async (doc) => {
    try {
      const res = await api.post('documents/telecharger.php', { document_id: doc.id })
      if (res.success) {
        window.open(res.url, '_blank')
        chargerTelechargements()
      }
    } catch {
      window.open(`/uploads/${doc.fichier}`, '_blank')
    }
  }

  // ── messagerie (conversations WhatsApp-style) ──
  const [conversations,  setConversations]  = useState([])
  const [convLoading,    setConvLoading]    = useState(true)
  const [selectedConv,   setSelectedConv]   = useState(null) // conversation ouverte
  const [chatMessages,   setChatMessages]   = useState([])
  const [chatLoading,    setChatLoading]    = useState(false)
  const [vueChat,        setVueChat]        = useState(false) // mobile: false=liste, true=chat
  const [reply,          setReply]          = useState('')
  const [replySending,   setReplySending]   = useState(false)
  const [replyErr,       setReplyErr]       = useState('')
  const [nouvelleConv,   setNouvelleConv]   = useState(false)
  const [newForm,        setNewForm]        = useState({ sujet: '', contenu: '' })
  const [newSending,     setNewSending]     = useState(false)
  const [newErr,         setNewErr]         = useState('')
  const chatEndRef = useRef(null)
  const pollRef    = useRef(null)

  const chargerConversations = (silent = false) => {
    if (!silent) setConvLoading(true)
    api.get('conversations/index.php')
      .then(d => setConversations(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setConvLoading(false))
  }

  const chargerMessages = (conv, silent = false) => {
    if (!conv) return
    if (!silent) setChatLoading(true)
    api.get('conversations/messages.php', { id: conv.id })
      .then(data => {
        setChatMessages(data.messages || [])
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, non_lus: 0 } : c))
      })
      .catch(() => {})
      .finally(() => setChatLoading(false))
  }

  const handleSelectConv = (conv) => {
    setSelectedConv(conv)
    setReply('')
    setReplyErr('')
    setVueChat(true)
    chargerMessages(conv)
  }

  // Poll toutes les 8 s quand un chat est ouvert
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (selectedConv) {
      pollRef.current = setInterval(() => chargerMessages(selectedConv, true), 8000)
    }
    return () => clearInterval(pollRef.current)
  }, [selectedConv?.id])

  // Scroller vers le bas à chaque nouveau message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleReplyConv = async () => {
    if (!selectedConv || !reply.trim() || replySending) return
    setReplySending(true)
    setReplyErr('')
    try {
      const res = await api.post('conversations/repondre.php', {
        conversation_id: selectedConv.id,
        contenu: reply.trim(),
      })
      const newMsg = {
        id: res.id,
        contenu: reply.trim(),
        expediteur_type: 'producteur',
        lu: 0,
        created_at: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, newMsg])
      setConversations(prev => prev.map(c =>
        c.id === selectedConv.id
          ? { ...c, dernier_message: reply.trim(), dernier_expediteur: 'producteur', updated_at: new Date().toISOString() }
          : c
      ))
      setReply('')
    } catch (e) {
      setReplyErr(e.message || 'Erreur d\'envoi')
    } finally {
      setReplySending(false)
    }
  }

  const handleCreerConv = async (e) => {
    e.preventDefault()
    if (!newForm.sujet.trim() || !newForm.contenu.trim()) return
    setNewSending(true)
    setNewErr('')
    try {
      const res = await api.post('conversations/creer.php', {
        sujet: newForm.sujet.trim(),
        contenu: newForm.contenu.trim(),
      })
      setNewForm({ sujet: '', contenu: '' })
      setNouvelleConv(false)
      chargerConversations()
      // Aller directement dans la nouvelle conversation
      setTimeout(() => {
        const fakeConv = { id: res.conversation_id, sujet: newForm.sujet.trim(), statut: 'ouverte', non_lus: 0 }
        handleSelectConv(fakeConv)
      }, 300)
    } catch (e) {
      setNewErr(e.message || 'Erreur lors de la création')
    } finally {
      setNewSending(false)
    }
  }

  // Charger selon l'onglet actif (lazy loading)
  useEffect(() => {
    if (activePage === 'actualites' && actualites.length === 0 && !loadAct) chargerActualites()
    if (activePage === 'telechargements') chargerTelechargements()
    if (activePage === 'profil' && !profil) chargerProfil()
  }, [activePage])

  useEffect(() => {
    api.get('annonces/index.php', { statut: 'publiee', limit: 6 })
      .then(d => setAnnonces(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadAnn(false))

    api.get('documents/index.php', { acces: 'actifs' })
      .then(d => setDocuments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadDoc(false))

    chargerConversations()

    const interval = setInterval(() => chargerConversations(true), 20000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const totalNonLus = conversations.reduce((s, c) => s + (c.non_lus || 0), 0)
  const prenom = user?.prenom || user?.nom || 'Producteur'
  const stats = { annonces: annonces.length, conversations: conversations.length, documents: documents.length }

  return (
    <div className="min-h-screen flex bg-capedig-beige">

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r
                        border-capedig-beige-dark flex flex-col z-40">
        <div className="px-5 pt-6 pb-4 border-b border-capedig-beige-dark">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-capedig-orange rounded-lg overflow-hidden
                            flex items-center justify-center flex-shrink-0">
              <img src="/logo/cape_logo_new.png" alt="CAPEDIG"
                   className="w-12 h-12 object-contain" />
            </div>
            <span className="font-display font-bold text-[13px] text-gray-900 leading-tight">
              CAPEDIG-COOP CA
            </span>
          </div>
          <p className="text-[11.5px] font-bold text-gray-700">Espace Producteur</p>
          <p className="text-[10.5px] font-bold text-capedig-orange tracking-[1px] uppercase mt-0.5">
            {user?.section || 'Secteur Café-Cacao'}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SideLink icon={ICONS.dashboard} label="Tableau de bord"
            active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <SideLink icon={ICONS.annonces} label="Annonces"
            active={activePage === 'annonces'} onClick={() => setActivePage('annonces')} />
          <SideLink icon={ICONS.actualites} label="Actualités"
            active={activePage === 'actualites'} onClick={() => setActivePage('actualites')} />
          <SideLink icon={ICONS.documents} label="Documents"
            active={activePage === 'documents'} onClick={() => setActivePage('documents')} />
          <SideLink icon={ICONS.telechargements} label="Téléchargements"
            active={activePage === 'telechargements'} onClick={() => setActivePage('telechargements')} />
          <SideLink icon={ICONS.messagerie} label="Messagerie"
            active={activePage === 'messagerie'} onClick={() => setActivePage('messagerie')}
            badge={totalNonLus > 0 ? totalNonLus : null} />
          <SideLink icon={ICONS.profil} label="Mon Profil"
            active={activePage === 'profil'} onClick={() => setActivePage('profil')} />
        </nav>

        <div className="px-3 py-4 border-t border-capedig-beige-dark">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-[14px] font-medium text-red-500 hover:bg-red-50
                       transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ════════════════════ ZONE PRINCIPALE ════════════════════ */}
      <main className="ml-[220px] flex-1 flex flex-col min-h-screen">

        <header className="sticky top-0 z-30 bg-white border-b border-capedig-beige-dark
                           px-8 py-4 flex items-center justify-between">
          <p className="text-[11.5px] text-gray-400 font-medium">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[13.5px] text-gray-500">
              Bienvenue, <strong className="text-gray-900">{prenom}</strong>
            </span>
            <NotificationBell onGoToMessagerie={() => setActivePage('messagerie')} />
            <div className="w-9 h-9 rounded-full bg-capedig-orange flex items-center
                            justify-center text-white font-bold text-[13px] overflow-hidden">
              {user?.photo
                ? <img src={user.photo} alt={prenom} className="w-full h-full object-cover" />
                : prenom.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout}
              className="w-9 h-9 rounded-lg border border-capedig-beige-dark flex items-center
                         justify-center text-gray-500 hover:bg-red-50 hover:text-red-500
                         transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8">

          {/* ── TABLEAU DE BORD ── */}
          {activePage === 'dashboard' && (
            <>
              <div style={{ animation: 'fadeUp 0.7s ease 0.1s both', opacity: 0 }}>
                <h1 className="font-display text-[28px] font-bold text-gray-900">
                  Bonjour {prenom},
                </h1>
                <p className="text-gray-500 text-[14.5px] mt-1">
                  Voici le résumé de votre activité aujourd'hui.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                   style={{ animation: 'fadeUp 0.7s ease 0.2s both', opacity: 0 }}>
                {[
                  { label: 'Annonces',       val: stats.annonces,      icon: ICONS.annonces,   color: '#D4641A' },
                  { label: 'Conversations',  val: stats.conversations, icon: ICONS.messagerie, color: '#3B82F6' },
                  { label: 'Documents',      val: stats.documents,     icon: ICONS.documents,  color: '#22C55E' },
                  { label: 'Statut du compte', val: user?.statut === 'actif' ? 'Actif' : 'En attente',
                    icon: ICONS.horloge, color: '#8B5CF6', isText: true },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-capedig-beige-dark
                                          flex items-center justify-between card-hover">
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium mb-1">{s.label}</p>
                      <p className="font-display font-bold"
                         style={{ fontSize: s.isText ? '18px' : '36px', color: s.color }}>
                        {s.val}
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: `${s.color}1A`, color: s.color }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ animation: 'fadeUp 0.7s ease 0.3s both', opacity: 0 }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-[20px] font-bold text-gray-900">
                    Annonces de la Coopérative
                  </h2>
                  <button onClick={() => setActivePage('annonces')}
                    className="text-[13.5px] font-semibold text-capedig-orange hover:underline">
                    Voir tout
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {loadAnn ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl border border-capedig-beige-dark
                                              h-[120px] skeleton" />
                    ))
                  ) : annonces.length === 0 ? (
                    <div className="md:col-span-2">
                      <EmptyState icon={ICONS.annonces} text="Aucune annonce publiée pour le moment." />
                    </div>
                  ) : annonces.slice(0, 2).map(ann => (
                    <AnnonceCard key={ann.id} ann={ann} onOpen={setSelectedAnnonce} />
                  ))}
                </div>
              </div>

              <div style={{ animation: 'fadeUp 0.7s ease 0.4s both', opacity: 0 }}>
                <h2 className="font-display text-[20px] font-bold text-gray-900 mb-5">
                  Mes Documents
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {loadDoc ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl border border-capedig-beige-dark
                                              h-[160px] skeleton" />
                    ))
                  ) : documents.length === 0 ? (
                    <div className="col-span-2 lg:col-span-4">
                      <EmptyState icon={ICONS.documents} text="Aucun document disponible pour le moment." />
                    </div>
                  ) : documents.slice(0, 4).map(doc => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── ANNONCES (page complète) ── */}
          {activePage === 'annonces' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <h1 className="font-display text-[26px] font-bold text-gray-900 mb-6">
                Annonces de la Coopérative
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {loadAnn ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-capedig-beige-dark
                                            h-[120px] skeleton" />
                  ))
                ) : annonces.length === 0 ? (
                  <div className="md:col-span-2">
                    <EmptyState icon={ICONS.annonces} text="Aucune annonce publiée pour le moment." />
                  </div>
                ) : annonces.map(ann => <AnnonceCard key={ann.id} ann={ann} onOpen={setSelectedAnnonce} />)}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS (page complète) ── */}
          {activePage === 'documents' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-display text-[26px] font-bold text-gray-900">
                  Mes Documents
                </h1>
                {documents.length > 0 && (
                  <select value={docCategorie} onChange={e => setDocCategorie(e.target.value)}
                    className="bg-white border border-capedig-beige-dark rounded-xl px-4 py-2.5
                               text-[13.5px] outline-none">
                    {['Toutes', ...new Set(documents.map(d => d.categorie).filter(Boolean))].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loadDoc ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-capedig-beige-dark
                                            h-[160px] skeleton" />
                  ))
                ) : documents.length === 0 ? (
                  <div className="col-span-2 lg:col-span-4">
                    <EmptyState icon={ICONS.documents} text="Aucun document disponible pour le moment." />
                  </div>
                ) : documents
                    .filter(d => docCategorie === 'Toutes' || d.categorie === docCategorie)
                    .map(doc => <DocumentCard key={doc.id} doc={doc} />)}
              </div>
            </div>
          )}

          {/* ── MESSAGERIE (WhatsApp-style) ── */}
          {activePage === 'messagerie' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}
                 className="flex flex-col h-[calc(100vh-200px)] -mx-8 -mb-8">
              <div className="flex h-full overflow-hidden rounded-none min-h-0">

                {/* Colonne liste conversations */}
                <div className={`${vueChat ? 'hidden lg:flex' : 'flex'} flex-col
                                 w-full lg:w-[320px] flex-shrink-0 min-h-0
                                 bg-white border-r border-capedig-beige-dark`}>
                  <div className="px-4 pt-4 pb-3 border-b border-capedig-beige-dark">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-display text-[18px] font-bold text-gray-900">
                        Messagerie
                        {totalNonLus > 0 && (
                          <span className="ml-2 bg-capedig-orange text-white text-[11px]
                                           font-bold px-2.5 py-0.5 rounded-full">
                            {totalNonLus}
                          </span>
                        )}
                      </h2>
                    </div>
                    <button
                      onClick={() => { setNouvelleConv(true); setVueChat(false) }}
                      className="btn-shine w-full bg-capedig-orange text-white rounded-xl
                                 py-2.5 text-[13.5px] font-bold hover:bg-capedig-orange-light
                                 transition-colors">
                      + Nouvelle conversation
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    {convLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="px-4 py-3 border-b border-gray-100">
                          <div className="h-4 skeleton rounded mb-1.5" />
                          <div className="h-3 skeleton rounded w-3/4" />
                        </div>
                      ))
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 px-6">
                        <div className="w-14 h-14 mb-4 opacity-30 flex items-center justify-center">
                          {ICONS.messagerie}
                        </div>
                        <p className="text-[13.5px] text-gray-400 text-center">
                          Aucune conversation.<br />Cliquez sur « Nouvelle conversation » pour commencer.
                        </p>
                      </div>
                    ) : conversations.map(conv => (
                      <button key={conv.id} onClick={() => handleSelectConv(conv)}
                        className={`w-full text-left px-4 py-3.5 border-b border-gray-100
                                    transition-colors flex items-start gap-3
                                    ${selectedConv?.id === conv.id && !nouvelleConv
                                      ? 'bg-capedig-orange/6' : 'hover:bg-gray-50'}`}>
                        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center
                                         justify-center font-bold text-[13px] text-white
                                         ${conv.statut === 'close' ? 'bg-gray-400' : 'bg-capedig-orange'}`}>
                          {prenom.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-[13px] truncate
                                          ${conv.non_lus > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {conv.sujet}
                            </p>
                            <span className="text-[10.5px] text-gray-400 flex-shrink-0 ml-2">
                              {tempsEcoule(conv.updated_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-[11.5px] truncate
                                          ${conv.non_lus > 0 ? 'font-semibold text-capedig-orange' : 'text-gray-400'}`}>
                              {conv.dernier_expediteur === 'producteur' && '→ '}
                              {conv.dernier_message || '—'}
                            </p>
                            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                              {conv.statut === 'close' && (
                                <span className="text-[10px] text-gray-400 font-bold">Clôt.</span>
                              )}
                              {conv.non_lus > 0 && (
                                <span className="min-w-[16px] h-4 px-1 bg-capedig-orange rounded-full
                                                 text-[9.5px] font-bold text-white flex items-center justify-center">
                                  {conv.non_lus > 9 ? '9+' : conv.non_lus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone principale : nouvelle conversation ou chat */}
                <div className={`${!vueChat && !nouvelleConv ? 'hidden lg:flex' : 'flex'} flex-col
                                 flex-1 overflow-hidden min-h-0`}>

                  {/* Formulaire nouvelle conversation */}
                  {nouvelleConv && (
                    <div className="flex flex-col h-full bg-[#F5F5F0]">
                      <div className="bg-white px-6 py-4 border-b border-capedig-beige-dark
                                      flex items-center gap-3">
                        <button onClick={() => setNouvelleConv(false)}
                          className="text-gray-400 hover:text-gray-700 lg:hidden">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <h3 className="font-bold text-[16px] text-gray-900">Nouvelle conversation</h3>
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto">
                        <form onSubmit={handleCreerConv} className="space-y-4 max-w-lg mx-auto">
                          {newErr && (
                            <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3
                                            text-red-600 text-[13px]">
                              {newErr}
                            </div>
                          )}
                          <div>
                            <label className="block text-[12px] font-bold text-gray-600
                                              uppercase tracking-[0.8px] mb-1.5">
                              Sujet
                            </label>
                            <input
                              value={newForm.sujet}
                              onChange={e => setNewForm(f => ({ ...f, sujet: e.target.value }))}
                              placeholder="Ex : Question sur les paiements"
                              required maxLength={120}
                              className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                         text-[14px] outline-none focus:border-capedig-orange bg-white
                                         transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] font-bold text-gray-600
                                              uppercase tracking-[0.8px] mb-1.5">
                              Votre message
                            </label>
                            <textarea
                              value={newForm.contenu}
                              onChange={e => setNewForm(f => ({ ...f, contenu: e.target.value }))}
                              rows={6}
                              placeholder="Décrivez votre demande en détail..."
                              required
                              className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                         text-[14px] outline-none focus:border-capedig-orange bg-white
                                         transition-colors resize-none"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setNouvelleConv(false)}
                              className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px]
                                         font-semibold text-gray-600 hover:bg-gray-50">
                              Annuler
                            </button>
                            <button type="submit" disabled={newSending}
                              className="btn-shine flex-1 bg-capedig-orange text-white py-3 rounded-xl
                                         font-bold text-[14px] disabled:opacity-60
                                         hover:bg-capedig-orange-light transition-colors">
                              {newSending ? 'Envoi…' : 'Envoyer ➤'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Vue chat conversation */}
                  {!nouvelleConv && selectedConv && (
                    <div className="flex flex-col h-full bg-[#F0EDE8]">
                      {/* Header */}
                      <div className="bg-white px-5 py-4 border-b border-capedig-beige-dark
                                      flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => setVueChat(false)}
                          className="text-gray-400 hover:text-gray-700 lg:hidden">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-capedig-vert flex items-center
                                        justify-center text-white font-bold text-[13px] flex-shrink-0">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14.5px] text-gray-900 truncate">
                            Administration CAPEDIG
                          </p>
                          <p className="text-[11.5px] text-gray-500 truncate">{selectedConv.sujet}</p>
                        </div>
                        {selectedConv.statut === 'close' && (
                          <span className="px-2.5 py-1 bg-gray-100 rounded-xl text-[11px]
                                           font-bold text-gray-500 flex-shrink-0">
                            Clôturée
                          </span>
                        )}
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-5 space-y-2">
                        {chatLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-[13.5px]">Chargement…</p>
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-[13.5px]">Aucun message.</p>
                          </div>
                        ) : chatMessages.map(msg => {
                          const isMine = msg.expediteur_type === 'producteur'
                          return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {!isMine && (
                                <div className="w-7 h-7 rounded-full bg-capedig-vert flex-shrink-0
                                                flex items-center justify-center text-white
                                                text-[11px] font-bold mr-2 self-end">
                                  A
                                </div>
                              )}
                              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13.5px]
                                               leading-relaxed
                                               ${isMine
                                                 ? 'bg-capedig-orange text-white rounded-br-sm'
                                                 : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                                <p className="whitespace-pre-line">{msg.contenu}</p>
                                <p className={`text-[10.5px] mt-1 text-right
                                               ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                  {dateHeure(msg.created_at)}
                                  {isMine && <span className="ml-1">{msg.lu ? ' ✓✓' : ' ✓'}</span>}
                                </p>
                              </div>
                              {isMine && (
                                <div className="w-7 h-7 rounded-full bg-capedig-orange flex-shrink-0
                                                flex items-center justify-center text-white
                                                text-[11px] font-bold ml-2 self-end">
                                  {prenom.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Zone de réponse */}
                      <div className="bg-white border-t border-capedig-beige-dark px-4 py-3 flex-shrink-0">
                        {replyErr && (
                          <p className="text-red-500 text-[12px] mb-2">✗ {replyErr}</p>
                        )}
                        {selectedConv.statut === 'close' ? (
                          <p className="text-center text-gray-400 text-[13px] py-2">
                            Conversation clôturée par l'administration.
                          </p>
                        ) : (
                          <div className="flex items-end gap-3">
                            <textarea
                              value={reply}
                              onChange={e => setReply(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleReplyConv()
                                }
                              }}
                              rows={1}
                              placeholder="Votre message… (Entrée pour envoyer)"
                              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3
                                         text-[13.5px] outline-none resize-none bg-gray-50
                                         focus:border-capedig-orange focus:bg-white transition-colors"
                              style={{ minHeight: '46px', maxHeight: '120px', overflowY: 'auto' }}
                              onInput={e => {
                                e.target.style.height = 'auto'
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                              }}
                            />
                            <button
                              onClick={handleReplyConv}
                              disabled={replySending || !reply.trim()}
                              className="btn-shine w-10 h-10 rounded-full bg-capedig-orange text-white
                                         flex items-center justify-center flex-shrink-0
                                         disabled:opacity-40 hover:bg-capedig-orange-light transition-colors">
                              {replySending ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10"
                                          stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Placeholder quand rien n'est sélectionné */}
                  {!nouvelleConv && !selectedConv && (
                    <div className="flex-1 flex flex-col items-center justify-center
                                    bg-[#F0EDE8] text-gray-400">
                      <div className="w-16 h-16 mb-4 opacity-30 flex items-center justify-center">
                        {ICONS.messagerie}
                      </div>
                      <p className="text-[14px]">Sélectionnez une conversation</p>
                      <p className="text-[12px] mt-1">ou créez-en une nouvelle</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ACTUALITÉS ── */}
          {activePage === 'actualites' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-display text-[26px] font-bold text-gray-900">Actualités</h1>
                <input value={actSearch} onChange={e => setActSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="bg-white border border-capedig-beige-dark rounded-xl px-4 py-2.5
                             text-[13.5px] outline-none w-56" />
              </div>
              {loadAct ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-xl" />)}
                </div>
              ) : actualites.length === 0 ? (
                <EmptyState icon={ICONS.actualites} text="Aucune actualité publiée pour le moment." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {actualites
                    .filter(a => !actSearch || a.titre.toLowerCase().includes(actSearch.toLowerCase()))
                    .map(act => {
                      const img = act.image ? `/uploads/${act.image}` : null
                      return (
                        <button key={act.id} onClick={() => setSelectedActualite(act)}
                          className="bg-white rounded-xl border border-capedig-beige-dark
                                     overflow-hidden card-hover text-left w-full flex
                                     hover:border-capedig-orange/40 transition-colors">
                          {img && (
                            <div className="w-24 flex-shrink-0 bg-cover bg-center"
                                 style={{ backgroundImage: `url('${img}')` }} />
                          )}
                          <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10.5px] font-bold tracking-[1px] px-2 py-0.5
                                               rounded text-white bg-capedig-orange">
                                {(act.categorie || 'ACTUALITÉ').toUpperCase()}
                              </span>
                              <span className="text-[12px] text-gray-400">{act.date || ''}</span>
                            </div>
                            <h3 className="font-bold text-[14.5px] text-gray-900 mb-1 leading-tight">
                              {act.titre}
                            </h3>
                            <span className="text-capedig-orange text-[12.5px] font-semibold mt-1 inline-block">
                              Lire →
                            </span>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* ── TÉLÉCHARGEMENTS ── */}
          {activePage === 'telechargements' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-[26px] font-bold text-gray-900">
                    Historique des téléchargements
                  </h1>
                  <p className="text-gray-500 text-[14px] mt-1">
                    Documents que vous avez téléchargés
                  </p>
                </div>
                <button onClick={chargerTelechargements}
                  className="px-4 py-2.5 rounded-xl border border-capedig-beige-dark bg-white
                             text-[13px] font-semibold text-gray-600 hover:bg-gray-50">
                  Actualiser
                </button>
              </div>

              {loadTel ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
              ) : telechargements.length === 0 ? (
                <EmptyState icon={ICONS.telechargements}
                  text="Vous n'avez encore téléchargé aucun document." />
              ) : (
                <div className="bg-white rounded-2xl border border-capedig-beige-dark overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11.5px] font-bold
                                     text-gray-400 uppercase tracking-wide">
                        <th className="px-5 py-3.5">Document</th>
                        <th className="px-5 py-3.5">Type</th>
                        <th className="px-5 py-3.5">Catégorie</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {telechargements.map(t => (
                        <tr key={t.telechargement_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="text-[13.5px] font-semibold text-gray-800">{t.titre}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11.5px] font-bold uppercase text-gray-500">
                              {t.type_fichier}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full
                                             bg-gray-100 text-gray-600">
                              {t.categorie || 'Général'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-500">
                            {new Date(t.date_telechargement).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => window.open(`/uploads/${t.fichier}`, '_blank')}
                              className="text-[12.5px] font-semibold text-capedig-orange hover:underline">
                              Retélécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PROFIL ÉDITABLE ── */}
          {activePage === 'profil' && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <h1 className="font-display text-[26px] font-bold text-gray-900 mb-6">Mon Profil</h1>

              <div className="max-w-2xl space-y-6">

                {/* Infos générales */}
                <div className="bg-white rounded-2xl border border-capedig-beige-dark p-7">
                  <h2 className="font-display text-[17px] font-bold text-gray-900 mb-5">
                    Informations personnelles
                  </h2>

                  {/* Avatar + photo */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-capedig-orange flex items-center
                                      justify-center text-white font-display font-bold text-[28px]
                                      overflow-hidden">
                        {profilPhotoUrl
                          ? <img src={profilPhotoUrl} alt={prenom}
                                 className="w-full h-full object-cover" />
                          : prenom.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="inline-block px-4 py-2 rounded-xl border border-capedig-beige-dark
                                         text-[13px] font-semibold text-gray-600 bg-gray-50
                                         hover:bg-gray-100 transition-colors">
                          {profilPhoto ? `Sélectionné : ${profilPhoto.name}` : 'Changer la photo'}
                        </span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                               onChange={e => {
                                 const f = e.target.files[0]
                                 if (f) {
                                   setProfilPhoto(f)
                                   setProfilPhotoUrl(URL.createObjectURL(f))
                                 }
                               }} />
                      </label>
                      <p className="text-[11.5px] text-gray-400 mt-1">JPG, PNG, WEBP — max 5 Mo</p>
                    </div>
                  </div>

                  {profilOk && (
                    <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                                    px-4 py-3 text-capedig-vert text-[13px] mb-4">
                      ✓ {profilOk}
                    </div>
                  )}
                  {profilErr && (
                    <div className="bg-red-50 border border-red-300 rounded-xl
                                    px-4 py-3 text-red-600 text-[13px] mb-4">
                      ✗ {profilErr}
                    </div>
                  )}

                  <form onSubmit={handleProfilSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-500
                                          uppercase tracking-wide mb-1.5">Nom</label>
                        <input value={profilEdit.nom}
                               onChange={e => setProfilEdit(p => ({ ...p, nom: e.target.value }))}
                               required
                               className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                          text-[14px] outline-none focus:border-capedig-orange bg-gray-50
                                          focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-500
                                          uppercase tracking-wide mb-1.5">Prénom</label>
                        <input value={profilEdit.prenom}
                               onChange={e => setProfilEdit(p => ({ ...p, prenom: e.target.value }))}
                               className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                          text-[14px] outline-none focus:border-capedig-orange bg-gray-50
                                          focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-500
                                          uppercase tracking-wide mb-1.5">Téléphone</label>
                        <input value={profilEdit.telephone} type="tel"
                               onChange={e => setProfilEdit(p => ({ ...p, telephone: e.target.value }))}
                               placeholder="+225 …"
                               className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                          text-[14px] outline-none focus:border-capedig-orange bg-gray-50
                                          focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-gray-500
                                          uppercase tracking-wide mb-1.5">Localisation</label>
                        <input value={profilEdit.localisation}
                               onChange={e => setProfilEdit(p => ({ ...p, localisation: e.target.value }))}
                               placeholder="Ville, région…"
                               className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                          text-[14px] outline-none focus:border-capedig-orange bg-gray-50
                                          focus:bg-white transition-colors" />
                      </div>
                    </div>

                    {/* Champs en lecture seule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-capedig-beige-dark">
                      {[
                        { label: 'Code producteur', val: profil?.code_producteur },
                        { label: 'Email', val: profil?.email },
                        { label: 'Section', val: profil?.section },
                        { label: 'Statut du compte', val: profil?.statut === 'actif' ? 'Actif' : profil?.statut },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                            {f.label}
                          </p>
                          <p className="text-[14.5px] text-gray-600">{f.val || '—'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={profilSending}
                        className="btn-shine px-6 py-3 rounded-xl bg-capedig-orange text-white
                                   font-bold text-[14px] disabled:opacity-60
                                   hover:bg-capedig-orange-light transition-colors">
                        {profilSending ? 'Enregistrement…' : 'Enregistrer les modifications'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Changer le mot de passe */}
                <div className="bg-white rounded-2xl border border-capedig-beige-dark p-7">
                  <h2 className="font-display text-[17px] font-bold text-gray-900 mb-5">
                    Changer le mot de passe
                  </h2>

                  {mdpOk && (
                    <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                                    px-4 py-3 text-capedig-vert text-[13px] mb-4">
                      ✓ {mdpOk}
                    </div>
                  )}
                  {mdpErr && (
                    <div className="bg-red-50 border border-red-300 rounded-xl
                                    px-4 py-3 text-red-600 text-[13px] mb-4">
                      ✗ {mdpErr}
                    </div>
                  )}

                  <form onSubmit={handleMdpSubmit} className="space-y-4">
                    {[
                      { key: 'ancien',  label: 'Mot de passe actuel', placeholder: '••••••••' },
                      { key: 'nouveau', label: 'Nouveau mot de passe', placeholder: 'Min. 8 caractères' },
                      { key: 'confirm', label: 'Confirmer le nouveau', placeholder: '••••••••' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[12px] font-bold text-gray-500
                                          uppercase tracking-wide mb-1.5">{f.label}</label>
                        <input type="password" value={mdpForm[f.key]} placeholder={f.placeholder}
                               onChange={e => setMdpForm(m => ({ ...m, [f.key]: e.target.value }))}
                               required
                               className="w-full border border-capedig-beige-dark rounded-xl px-4 py-3
                                          text-[14px] outline-none focus:border-capedig-orange bg-gray-50
                                          focus:bg-white transition-colors" />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button type="submit" disabled={mdpSending}
                        className="btn-shine px-6 py-3 rounded-xl bg-gray-900 text-white
                                   font-bold text-[14px] disabled:opacity-60
                                   hover:bg-gray-700 transition-colors">
                        {mdpSending ? 'Modification…' : 'Modifier le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="bg-capedig-brun px-8 py-5
                           flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-capedig-orange rounded-md overflow-hidden
                            flex items-center justify-center">
              <img src="/logo/cape_logo_new.png" alt="" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-bold text-[13px]">CAPEDIG-COOP CA</span>
          </div>
          <p className="text-white/40 text-[12px]">
            © {new Date().getFullYear()} CAPEDIG.
          </p>
        </footer>
      </main>

      {selectedAnnonce && (
        <AnnonceDetailModal ann={selectedAnnonce} onClose={() => setSelectedAnnonce(null)} />
      )}

      {selectedActualite && (
        <ActualiteDetailModal act={selectedActualite} onClose={() => setSelectedActualite(null)} />
      )}
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────────────
function AnnonceCard({ ann, onOpen }) {
  const img = ann.image ? (ann.image.startsWith('http') ? ann.image : `/uploads/${ann.image}`) : null
  return (
    <button
      onClick={() => onOpen(ann)}
      className="bg-white rounded-xl border border-capedig-beige-dark
                flex overflow-hidden card-hover text-left w-full
                hover:border-capedig-orange/40 transition-colors"
    >
      {img && (
        <div className="w-24 flex-shrink-0 bg-cover bg-center"
             style={{ backgroundImage: `url('${img}')` }} />
      )}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] font-bold tracking-[1px] px-2 py-0.5 rounded text-white"
                style={{ background: '#2D6A4F' }}>
            {(ann.categorie || 'ANNONCE').toUpperCase()}
          </span>
          <span className="text-[12px] text-gray-400">{ann.date || 'Récent'}</span>
        </div>
        <h3 className="font-bold text-[14.5px] text-gray-900 mb-1 leading-tight">{ann.titre}</h3>
        <p className="text-gray-500 text-[12.5px] line-clamp-2 leading-relaxed">
          {stripHtml(ann.contenu, 140)}
        </p>
        <span className="text-capedig-orange text-[12.5px] font-semibold mt-2 inline-block">
          Lire la suite →
        </span>
      </div>
    </button>
  )
}

function AnnonceDetailModal({ ann, onClose }) {
  const img = ann.image ? (ann.image.startsWith('http') ? ann.image : `/uploads/${ann.image}`) : null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ animation: 'scaleIn 0.3s ease both' }}
      >
        {img && (
          <div className="w-full h-44 bg-cover bg-center rounded-t-2xl"
               style={{ backgroundImage: `url('${img}')` }} />
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-bold tracking-[1px] px-2 py-0.5 rounded text-white"
                  style={{ background: '#2D6A4F' }}>
              {(ann.categorie || 'ANNONCE').toUpperCase()}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="font-display text-[20px] font-bold text-gray-900 mb-1.5 leading-tight">
            {ann.titre}
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">{ann.date || 'Récent'}</p>
          <div className="prose-actualite text-gray-700 text-[14px] leading-relaxed"
               dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.contenu) }} />
        </div>
      </div>
    </div>
  )
}

function ActualiteDetailModal({ act, onClose }) {
  const img = act.image ? (act.image.startsWith('http') ? act.image : `/uploads/${act.image}`) : null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{ animation: 'scaleIn 0.3s ease both' }}
      >
        {img && (
          <div className="w-full h-44 bg-cover bg-center rounded-t-2xl"
               style={{ backgroundImage: `url('${img}')` }} />
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-bold tracking-[1px] px-2 py-0.5 rounded text-white bg-capedig-orange">
              {(act.categorie || 'ACTUALITÉ').toUpperCase()}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="font-display text-[20px] font-bold text-gray-900 mb-1.5 leading-tight">
            {act.titre}
          </h3>
          <p className="text-[12px] text-gray-400 mb-4">{act.date || 'Récent'}</p>
          <div className="prose-actualite text-gray-700 text-[14px] leading-relaxed"
               dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(act.contenu) }} />
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ doc }) {
  return (
    <div className="bg-white rounded-xl border border-capedig-beige-dark p-5
                    text-center card-hover">
      <FileIcon type={doc.type_fichier} />
      {doc.categorie && (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full
                         bg-gray-100 text-gray-500 mb-2">
          {doc.categorie}
        </span>
      )}
      <p className="font-bold text-[13.5px] text-gray-900 mb-1 leading-tight line-clamp-1">
        {doc.titre}
      </p>
      <p className="text-[11.5px] text-gray-400 mb-4">{doc.taille}</p>
      <a
        href={`/uploads/${doc.fichier}`}
        target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-1.5 w-full
                   border border-capedig-orange text-capedig-orange
                   py-2.5 rounded-lg text-[13px] font-semibold
                   hover:bg-capedig-orange hover:text-white
                   transition-all duration-250"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Télécharger
      </a>
    </div>
  )
}
