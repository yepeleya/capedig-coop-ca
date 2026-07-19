import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { api } from '../../services/api'

// ── helpers ───────────────────────────────────────────────────
function tempsEcoule(dateStr) {
  if (!dateStr) return ''
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const min  = Math.round(diff / 60000)
  if (min < 1)  return "à l'instant"
  if (min < 60) return `${min} min`
  const h = Math.round(min / 60)
  if (h < 24)   return `${h} h`
  const d = Math.round(h / 24)
  if (d < 7)    return `${d} j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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

function nomProducteur(conv) {
  return [conv.prd_prenom, conv.prd_nom].filter(Boolean).join(' ') || 'Producteur'
}

function formatDuree(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ── Colonne gauche : item conversation ────────────────────────
function ConvItem({ conv, selected, onClick }) {
  const nom = nomProducteur(conv)
  const initiale = nom.charAt(0).toUpperCase()
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100
                  transition-colors flex items-start gap-3
                  ${selected ? 'bg-capedig-orange/6' : 'hover:bg-gray-50'}`}
    >
      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                       font-bold text-[14px] text-white
                       ${conv.statut === 'close' ? 'bg-gray-400' : 'bg-capedig-vert'}`}>
        {initiale}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-[13.5px] truncate
                        ${conv.non_lus > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
            {nom}
          </p>
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
            {tempsEcoule(conv.updated_at)}
          </span>
        </div>
        <p className={`text-[12px] truncate mb-1
                       ${conv.non_lus > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
          {conv.sujet}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[11.5px] text-gray-400 truncate">
            {conv.dernier_expediteur === 'admin' && '✓ '}
            {conv.dernier_message || '—'}
          </p>
          {conv.non_lus > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1
                             bg-capedig-orange rounded-full text-white text-[10px]
                             font-bold flex items-center justify-center">
              {conv.non_lus > 9 ? '9+' : conv.non_lus}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Lecteur audio compact pour les notes vocales ────────────────
function AudioPlayer({ src, light }) {
  return (
    <audio
      controls
      src={src}
      className={light ? 'voice-player voice-player-light' : 'voice-player'}
      style={{ height: '34px', maxWidth: '220px' }}
    />
  )
}

// ── Bulle de message ──────────────────────────────────────────
function Bubble({ msg, prdNom }) {
  const isAdminMsg = msg.expediteur_type === 'admin'
  const initiale = isAdminMsg
    ? 'A'
    : (prdNom || 'P').charAt(0).toUpperCase()

  return (
    <div className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isAdminMsg && (
        <div className="w-7 h-7 rounded-full bg-capedig-vert flex items-center justify-center
                        text-white text-[11px] font-bold mr-2 flex-shrink-0 self-end">
          {initiale}
        </div>
      )}
      <div className="flex flex-col">
        {/* Nom de l'expéditeur */}
        <span className={`text-[10.5px] font-semibold mb-0.5 px-1
                          ${isAdminMsg ? 'text-right text-capedig-orange' : 'text-left text-gray-500'}`}>
          {isAdminMsg ? 'Admin' : (prdNom || 'Producteur')}
        </span>
        <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
                         ${isAdminMsg
                           ? 'bg-capedig-orange text-white rounded-br-sm'
                           : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
          {msg.audio ? (
            <AudioPlayer src={`/uploads/${msg.audio}`} light={isAdminMsg} />
          ) : (
            <p className="whitespace-pre-line">{msg.contenu}</p>
          )}
          <p className={`text-[10.5px] mt-1 text-right
                         ${isAdminMsg ? 'text-white/70' : 'text-gray-400'}`}>
            {dateHeure(msg.created_at)}
            {isAdminMsg && (
              <span className="ml-1">{msg.lu ? ' ✓✓' : ' ✓'}</span>
            )}
          </p>
        </div>
      </div>
      {isAdminMsg && (
        <div className="w-7 h-7 rounded-full bg-capedig-orange flex items-center justify-center
                        text-white text-[11px] font-bold ml-2 flex-shrink-0 self-end">
          A
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function Messages() {
  useAuth('/login-admin', null)

  const [conversations, setConversations] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('Tous')
  const [search,        setSearch]        = useState('')

  const [selectedConv, setSelectedConv] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading,  setChatLoading]  = useState(false)

  const [reply,   setReply]   = useState('')
  const [sending, setSending] = useState(false)
  const [msgErr,  setMsgErr]  = useState('')
  const [confirmCloture, setConfirmCloture] = useState(false)

  const [listError, setListError] = useState('')

  const chatEndRef   = useRef(null)
  const pollRef      = useRef(null)
  const prevCountRef = useRef(0)   // pour scroller seulement si nouveaux messages
  const firstLoad    = useRef(true) // pour éviter le flash de loading sur les polls

  // Charger la liste des conversations (silent = ne pas afficher le spinner)
  const chargerListe = (silent = false) => {
    if (!silent) setLoading(true)
    setListError('')
    api.get('conversations/index.php')
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setConversations(list)
        if (list.length > 0 && firstLoad.current) {
          setSelectedConv(list[0])
          firstLoad.current = false
        }
      })
      .catch(e => {
        if (!silent) {
          const expire = /token|401|expir/i.test(e.message || '')
          setListError(expire
            ? 'Session expirée. Reconnectez-vous.'
            : `Impossible de charger les messages : ${e.message}`)
        }
      })
      .finally(() => { if (!silent) setLoading(false) })
  }

  // Charger les messages d'une conversation
  const chargerMessages = (conv, silent = false) => {
    if (!conv) return
    if (!silent) setChatLoading(true)
    api.get('conversations/messages.php', { id: conv.id })
      .then(data => {
        const msgs = data.messages || []
        setChatMessages(msgs)
        setConversations(prev =>
          prev.map(c => c.id === conv.id ? { ...c, non_lus: 0 } : c)
        )
        window.dispatchEvent(new Event('capedig:messages-updated'))
      })
      .catch(() => {})
      .finally(() => { if (!silent) setChatLoading(false) })
  }

  // Sélectionner une conversation
  const handleSelect = (conv) => {
    setSelectedConv(conv)
    setReply('')
    setMsgErr('')
    chargerMessages(conv)
  }

  // Poll automatique toutes les 8 s quand une conversation est ouverte
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (selectedConv) {
      pollRef.current = setInterval(() => chargerMessages(selectedConv, true), 8000)
    }
    return () => clearInterval(pollRef.current)
  }, [selectedConv?.id])

  // Scroller vers le bas uniquement quand de nouveaux messages arrivent
  useEffect(() => {
    if (chatMessages.length > prevCountRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevCountRef.current = chatMessages.length
  }, [chatMessages])

  // Charge initiale + rafraîchissement liste toutes les 20 s (silent pour éviter le flash)
  useEffect(() => {
    chargerListe(false)
    const interval = setInterval(() => chargerListe(true), 20000)
    const onUpdate = () => chargerListe(true)
    window.addEventListener('capedig:messages-updated', onUpdate)
    return () => {
      clearInterval(interval)
      window.removeEventListener('capedig:messages-updated', onUpdate)
    }
  }, [])

  // Envoyer une réponse
  const handleReply = async () => {
    if (!selectedConv || !reply.trim() || sending) return
    setSending(true)
    setMsgErr('')
    try {
      const res = await api.post('conversations/repondre.php', {
        conversation_id: selectedConv.id,
        contenu: reply.trim(),
      })
      setReply('')
      // Ajouter immédiatement le message dans le chat (optimistic)
      setChatMessages(prev => [...prev, {
        id: res.id,
        contenu: reply.trim(),
        expediteur_type: 'admin',
        lu: 0,
        created_at: new Date().toISOString(),
      }])
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id
          ? { ...c, dernier_message: reply.trim(), dernier_expediteur: 'admin', updated_at: new Date().toISOString() }
          : c)
      )
      window.dispatchEvent(new Event('capedig:messages-updated'))
    } catch (e) {
      setMsgErr(e.message || 'Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  // Envoyer une note vocale
  const handleAudioReady = async (blob, mimeType) => {
    if (!selectedConv) return
    setSending(true)
    setMsgErr('')
    try {
      const ext = mimeType.includes('ogg') ? 'ogg' : 'webm'
      const fd = new FormData()
      fd.append('conversation_id', selectedConv.id)
      fd.append('audio', blob, `note.${ext}`)
      const res = await api.postForm('conversations/envoyer_audio.php', fd)
      setChatMessages(prev => [...prev, {
        id: res.id,
        audio: res.audio,
        expediteur_type: 'admin',
        lu: 0,
        created_at: new Date().toISOString(),
      }])
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id
          ? { ...c, dernier_message: '🎤 Note vocale', dernier_expediteur: 'admin', updated_at: new Date().toISOString() }
          : c)
      )
      window.dispatchEvent(new Event('capedig:messages-updated'))
    } catch (e) {
      setMsgErr(e.message || "Erreur lors de l'envoi de la note vocale")
    } finally {
      setSending(false)
    }
  }
  const voice = useVoiceRecorder(handleAudioReady)

  // Clôturer la conversation
  const handleCloturer = () => {
    if (!selectedConv) return
    setConfirmCloture(true)
  }

  const confirmerCloture = async () => {
    setConfirmCloture(false)
    try {
      await api.post('conversations/cloturer.php', { id: selectedConv.id })
      setSelectedConv(prev => ({ ...prev, statut: 'close' }))
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, statut: 'close' } : c)
      )
    } catch (e) {
      setMsgErr(e.message)
    }
  }

  // Filtrage
  const totalNonLus = conversations.reduce((s, c) => s + (c.non_lus || 0), 0)
  const filtrees = conversations.filter(c => {
    if (filter === 'Non lus'    && !c.non_lus)          return false
    if (filter === 'Clôturées'  && c.statut !== 'close') return false
    if (filter === 'Ouvertes'   && c.statut !== 'ouverte') return false
    if (search) {
      const q = search.toLowerCase()
      const nom = nomProducteur(c).toLowerCase()
      if (!nom.includes(q) && !c.sujet.toLowerCase().includes(q)) return false
    }
    return true
  })

  const conv = selectedConv

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="flex h-[calc(100vh-64px)]" style={{ animation: 'fadeIn 0.4s ease both' }}>

          {/* ── Colonne liste ── */}
          <div className="w-[340px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-display text-[18px] font-bold text-gray-900">Messages</h1>
                {totalNonLus > 0 && (
                  <span className="bg-capedig-orange text-white text-[11px] font-bold
                                   px-2.5 py-0.5 rounded-full">
                    {totalNonLus}
                  </span>
                )}
              </div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-gray-100 rounded-xl px-3.5 py-2 text-[13px] outline-none
                           placeholder:text-gray-400 mb-2.5"
              />
              <div className="flex gap-1.5 flex-wrap">
                {['Tous', 'Non lus', 'Ouvertes', 'Clôturées'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-semibold transition-colors
                               ${filter === f
                                 ? 'bg-capedig-orange text-white'
                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {loading && (
                <p className="text-center text-gray-400 text-[13px] py-8">Chargement…</p>
              )}
              {!loading && listError && (
                <div className="px-4 py-6 text-center">
                  <p className="text-red-500 text-[13px] mb-2">{listError}</p>
                  <button onClick={chargerListe}
                    className="text-capedig-orange text-[13px] font-semibold hover:underline">
                    Réessayer
                  </button>
                </div>
              )}
              {!loading && !listError && filtrees.length === 0 && (
                <p className="text-center text-gray-400 text-[13px] py-8">
                  {conversations.length === 0 ? 'Aucun message reçu.' : 'Aucune conversation dans ce filtre.'}
                </p>
              )}
              {filtrees.map(c => (
                <ConvItem
                  key={c.id}
                  conv={c}
                  selected={conv?.id === c.id}
                  onClick={() => handleSelect(c)}
                />
              ))}
            </div>
          </div>

          {/* ── Zone chat ── */}
          <div className="flex-1 flex flex-col bg-[#F0F0F0] overflow-hidden min-h-0">
            {conv ? (
              <>
                {/* Header conversation */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center
                                justify-between gap-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                     text-white font-bold text-[15px]
                                     ${conv.statut === 'close' ? 'bg-gray-400' : 'bg-capedig-vert'}`}>
                      {nomProducteur(conv).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-gray-900 leading-tight">
                        {nomProducteur(conv)}
                        {conv.prd_code && (
                          <span className="ml-2 text-[11px] font-semibold text-gray-400">
                            {conv.prd_code}
                          </span>
                        )}
                      </p>
                      <p className="text-[12px] text-gray-500">{conv.sujet}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.statut === 'close' ? (
                      <span className="px-3 py-1.5 rounded-xl text-[12px] font-bold
                                       bg-gray-100 text-gray-500">
                        Clôturée
                      </span>
                    ) : (
                      <button onClick={handleCloturer}
                        className="px-3.5 py-2 rounded-xl border border-gray-200 text-[12.5px]
                                   font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500
                                   hover:border-red-200 transition-colors">
                        Clôturer
                      </button>
                    )}
                  </div>
                </div>

                {/* Fil de messages */}
                <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
                  {chatLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-[13.5px]">Chargement…</p>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-[13.5px]">Aucun message dans cette conversation.</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map(msg => (
                        <Bubble key={msg.id} msg={msg} prdNom={nomProducteur(conv)} />
                      ))}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Zone de réponse */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
                  {msgErr && (
                    <p className="text-red-500 text-[12.5px] mb-2">✗ {msgErr}</p>
                  )}
                  {voice.erreur && (
                    <p className="text-red-500 text-[12.5px] mb-2">✗ {voice.erreur}</p>
                  )}
                  {conv.statut === 'close' ? (
                    <p className="text-center text-gray-400 text-[13px] py-2">
                      Cette conversation est clôturée — impossible de répondre.
                    </p>
                  ) : voice.recording ? (
                    <div className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                            style={{ animation: 'pulse 1.2s ease infinite' }} />
                      <span className="text-[13.5px] font-semibold text-red-600 flex-1">
                        Enregistrement… {formatDuree(voice.seconds)}
                      </span>
                      <button onClick={voice.cancel}
                        className="text-[12.5px] font-semibold text-gray-500 hover:text-gray-700 px-2">
                        Annuler
                      </button>
                      <button onClick={voice.stop}
                        className="btn-shine w-10 h-10 rounded-full bg-red-500 text-white
                                   flex items-center justify-center flex-shrink-0
                                   hover:bg-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-3">
                      <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleReply()
                          }
                        }}
                        rows={1}
                        placeholder="Écrire une réponse… (Entrée pour envoyer, Shift+Entrée pour saut de ligne)"
                        className="flex-1 border border-gray-200 rounded-2xl px-4 py-3
                                   text-[13.5px] outline-none resize-none bg-gray-50
                                   focus:border-capedig-orange focus:bg-white transition-colors
                                   max-h-32 overflow-y-auto"
                        style={{ minHeight: '46px' }}
                        onInput={e => {
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                        }}
                      />
                      {reply.trim() ? (
                        <button
                          onClick={handleReply}
                          disabled={sending}
                          className="btn-shine w-10 h-10 rounded-full bg-capedig-orange text-white
                                     flex items-center justify-center flex-shrink-0
                                     disabled:opacity-40 hover:bg-capedig-orange-light transition-colors"
                        >
                          {sending ? (
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
                      ) : (
                        <button
                          onClick={voice.start}
                          disabled={sending}
                          title="Enregistrer une note vocale"
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-600
                                     flex items-center justify-center flex-shrink-0
                                     disabled:opacity-40 hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M19 11a7 7 0 01-14 0M12 18v3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-[14px]">
                  {loading ? 'Chargement…' : 'Sélectionnez une conversation'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmCloture}
        danger
        title="Clôturer la conversation"
        message="Clôturer cette conversation ? Le producteur ne pourra plus y répondre."
        confirmLabel="Clôturer"
        onConfirm={confirmerCloture}
        onCancel={() => setConfirmCloture(false)}
      />
    </div>
  )
}
