import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

// ── Styles inputs réutilisables ────────────────────────────
const inputWrap = `flex items-center gap-3 border border-capedig-beige-dark
  rounded-xl px-4 py-3.5 bg-capedig-beige focus-within:border-capedig-orange
  focus-within:ring-2 focus-within:ring-capedig-orange/20 transition-all duration-250`
const inputEl = `flex-1 outline-none text-[14px] text-gray-800
  placeholder-gray-400 bg-transparent`

// ── Icônes SVG inline ──────────────────────────────────────
const IconUser = () => (
  <svg className="w-5 h-5 text-gray-400 flex-shrink-0"
       fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconLock = () => (
  <svg className="w-5 h-5 text-gray-400 flex-shrink-0"
       fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

// ── Composant formulaire connexion ─────────────────────────
function FormConnexion({ onSuccess }) {
  const [email,   setEmail]   = useState('')
  const [mdp,     setMdp]     = useState('')
  const [showMdp, setShowMdp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login_producteur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mot_de_passe: mdp }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess(data.token, data.user)
      } else {
        if (data.statut === 'en_attente')
          setError('Votre compte est en attente de validation par l\'administration.')
        else if (data.statut === 'suspendu')
          setError('Votre compte a été suspendu. Contactez l\'administration.')
        else
          setError(data.message || 'Email ou mot de passe incorrect.')
      }
    } catch {
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email ou ID */}
      <div>
        <label className="block text-[12.5px] font-bold text-gray-600
                          tracking-[0.8px] uppercase mb-2">
          Email ou ID Producteur
        </label>
        <div className={inputWrap}>
          <IconUser />
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Ex: PRD-2024-890"
            required
            className={inputEl}
            autoComplete="username"
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12.5px] font-bold text-gray-600
                            tracking-[0.8px] uppercase">
            Mot de passe
          </label>
          <Link to="/mot-de-passe-oublie"
            className="text-[13px] font-semibold text-capedig-orange
                       hover:text-capedig-orange-light transition-colors">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className={inputWrap}>
          <IconLock />
          <input
            type={showMdp ? 'text' : 'password'}
            value={mdp}
            onChange={e => setMdp(e.target.value)}
            placeholder="••••••••"
            required
            className={inputEl}
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowMdp(!showMdp)}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMdp
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                        text-red-700 text-[13.5px] flex items-start gap-2">
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          {error}
        </div>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className="btn-shine w-full bg-capedig-orange text-white py-4 rounded-xl
                   font-bold text-[15px] flex items-center justify-center gap-2
                   transition-all duration-300 hover:bg-capedig-orange-light
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connexion...
          </>
        ) : (
          <>
            Se connecter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      {/* Info validation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4
                      flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-blue-700 text-[13px] leading-relaxed">
          Les nouveaux comptes sont soumis à une validation manuelle par l'administration
          de la coopérative pour garantir l'intégrité de notre réseau de producteurs.
        </p>
      </div>
    </form>
  )
}

// ── Composant formulaire inscription ──────────────────────
function FormInscription() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    localisation: '', section: '', mot_de_passe: '', confirm_mdp: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  // Étape de vérification du téléphone par SMS
  const [producteurId, setProducteurId] = useState(null)
  const [codeSms,      setCodeSms]      = useState('')
  const [smsVerifie,   setSmsVerifie]   = useState(false)
  const [smsLoading,   setSmsLoading]   = useState(false)
  const [smsError,     setSmsError]     = useState('')
  const [renvoiOk,     setRenvoiOk]     = useState('')

  const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D',
                    'Section E', 'Section F', 'Section G', 'Section H']

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.mot_de_passe.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (form.mot_de_passe !== form.confirm_mdp) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register_producteur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom:          form.nom.trim(),
          prenom:       form.prenom.trim(),
          email:        form.email.trim().toLowerCase(),
          telephone:    form.telephone.trim(),
          localisation: form.localisation.trim(),
          section:      form.section,
          mot_de_passe: form.mot_de_passe,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProducteurId(data.producteur_id)
        setSuccess(true)
      } else {
        setError(data.message || 'Une erreur est survenue.')
      }
    } catch {
      setError('Erreur de connexion. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifierSms = async (e) => {
    e.preventDefault()
    setSmsError('')
    setSmsLoading(true)
    try {
      const res = await fetch('/api/auth/verifier_sms.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producteur_id: producteurId, code: codeSms.trim() }),
      })
      const data = await res.json()
      if (data.success) setSmsVerifie(true)
      else setSmsError(data.message || 'Code incorrect')
    } catch {
      setSmsError('Erreur de connexion. Réessayez.')
    } finally {
      setSmsLoading(false)
    }
  }

  const handleRenvoyerSms = async () => {
    setSmsError('')
    setRenvoiOk('')
    try {
      const res = await fetch('/api/auth/renvoyer_sms.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producteur_id: producteurId }),
      })
      const data = await res.json()
      if (data.success) setRenvoiOk('Un nouveau code a été envoyé par SMS.')
      else setSmsError(data.message || 'Erreur lors du renvoi')
    } catch {
      setSmsError('Erreur de connexion. Réessayez.')
    }
  }

  // ── Étape 3 : compte créé + téléphone vérifié ──
  if (success && smsVerifie) {
    return (
      <div className="text-center py-8">
        <div className="text-[56px] mb-4">✅</div>
        <h3 className="font-display text-[22px] font-bold text-gray-900 mb-3">
          Demande envoyée !
        </h3>
        <p className="text-gray-600 text-[14.5px] leading-relaxed">
          Votre numéro a été vérifié et votre demande d'adhésion a été reçue.
          L'administration de la CAPEDIG vous contactera dans les 48 heures
          pour valider votre compte.
        </p>
      </div>
    )
  }

  // ── Étape 2 : saisie du code SMS ──
  if (success && !smsVerifie) {
    return (
      <div className="py-4">
        <div className="text-center mb-6">
          <div className="text-[48px] mb-3">📱</div>
          <h3 className="font-display text-[19px] font-bold text-gray-900 mb-2">
            Vérifiez votre numéro
          </h3>
          <p className="text-gray-500 text-[13.5px] leading-relaxed">
            Un code à 6 chiffres a été envoyé par SMS au<br />
            <span className="font-semibold text-gray-700">{form.telephone}</span>
          </p>
        </div>

        <form onSubmit={handleVerifierSms} className="space-y-4">
          <input
            value={codeSms}
            onChange={e => setCodeSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            required
            className="w-full text-center text-[26px] font-bold tracking-[8px]
                       border border-capedig-beige-dark rounded-xl py-3.5
                       outline-none bg-capedig-beige focus:border-capedig-orange
                       focus:ring-2 focus:ring-capedig-orange/20 transition-all duration-250"
          />

          {smsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                            text-red-700 text-[13.5px]">⚠ {smsError}</div>
          )}
          {renvoiOk && (
            <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                            px-4 py-3 text-capedig-vert text-[13.5px]">✓ {renvoiOk}</div>
          )}

          <button type="submit" disabled={smsLoading || codeSms.length !== 6}
            className="btn-shine w-full bg-capedig-orange text-white py-4 rounded-xl
                       font-bold text-[15px] transition-all duration-300
                       hover:bg-capedig-orange-light disabled:opacity-60">
            {smsLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>

          <button type="button" onClick={handleRenvoyerSms}
            className="w-full text-center text-[13.5px] font-semibold text-capedig-orange
                       hover:text-capedig-orange-light transition-colors">
            Je n'ai rien reçu — Renvoyer le code
          </button>
        </form>
      </div>
    )
  }

  const fieldClass = `w-full border border-capedig-beige-dark rounded-xl px-4 py-3.5
    text-[14px] text-gray-800 placeholder-gray-400 outline-none bg-capedig-beige
    focus:border-capedig-orange focus:ring-2 focus:ring-capedig-orange/20
    transition-all duration-250`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase
                            tracking-[0.8px] mb-1.5">Nom</label>
          <input name="nom" value={form.nom} onChange={handleChange}
            placeholder="Ex: Kouassi" required className={fieldClass} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase
                            tracking-[0.8px] mb-1.5">Prénom</label>
          <input name="prenom" value={form.prenom} onChange={handleChange}
            placeholder="Ex: Jean" required className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase
                          tracking-[0.8px] mb-1.5">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange}
          placeholder="jean@exemple.ci" required className={fieldClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase
                            tracking-[0.8px] mb-1.5">Téléphone</label>
          <input name="telephone" value={form.telephone} onChange={handleChange}
            placeholder="+225 07 00 00 00" required className={fieldClass} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase
                            tracking-[0.8px] mb-1.5">Localisation</label>
          <input name="localisation" value={form.localisation} onChange={handleChange}
            placeholder="Daloa" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase
                          tracking-[0.8px] mb-1.5">Section</label>
        <select name="section" value={form.section} onChange={handleChange}
          className={fieldClass}>
          <option value="">Choisir une section</option>
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase
                          tracking-[0.8px] mb-1.5">Mot de passe</label>
        <input type="password" name="mot_de_passe" value={form.mot_de_passe}
          onChange={handleChange} placeholder="Min. 8 caractères"
          required minLength={8} className={fieldClass} />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase
                          tracking-[0.8px] mb-1.5">Confirmer le mot de passe</label>
        <input type="password" name="confirm_mdp" value={form.confirm_mdp}
          onChange={handleChange} placeholder="Répétez le mot de passe"
          required className={fieldClass} />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                        text-red-700 text-[13.5px]">⚠ {error}</div>
      )}
      <button type="submit" disabled={loading}
        className="btn-shine w-full bg-capedig-orange text-white py-4 rounded-xl
                   font-bold text-[15px] transition-all duration-300
                   hover:bg-capedig-orange-light disabled:opacity-60">
        {loading ? 'Envoi en cours...' : "Envoyer la demande d'adhésion"}
      </button>
    </form>
  )
}

// ── Composant principal ────────────────────────────────────
export default function LoginProducteur() {
  const [onglet, setOnglet] = useState('connexion')
  const { login }    = useAuthContext()
  const navigate     = useNavigate()

  const handleSuccess = (token, user) => {
    login(token, user)
    navigate('/producteur/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── COLONNE GAUCHE — Visuel ── */}
      <div
        className="relative lg:w-1/2 min-h-[45vh] lg:min-h-screen
                   flex flex-col justify-center px-10 lg:px-16 overflow-hidden"
        style={{ background: '#3D2314' }}
      >
        {/* Image fond cacao */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero/hero-1-cabosses-arbre.jpg')",
            opacity: 0.25,
          }}
        />
        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(61,35,20,0.95) 0%, rgba(61,35,20,0.7) 100%)' }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-capedig-orange rounded-xl overflow-hidden
                            flex items-center justify-center shadow-lg">
              <img src="/logo/cape_logo_new.png" alt="CAPEDIG"
                   className="w-16 h-16 object-contain" />
            </div>
            <span className="text-white font-bold text-[16px] tracking-wide">
              CAPEDIG-COOP CA
            </span>
          </div>

          {/* Titre hero */}
          <h1
            className="font-display text-white font-bold leading-[1.1] mb-6"
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              animation: 'fadeUp 0.85s ease 0.2s both',
              opacity: 0,
            }}
          >
            Ensemble,<br />cultivons<br />l'avenir du<br />cacao
          </h1>
          <p
            className="text-white/70 text-[15px] leading-relaxed max-w-sm"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            CAPEDIG-COOP CA : Excellence et Développement Intégré pour les
            producteurs du Grand-Ouest.
          </p>

          {/* 3 bullet points */}
          <div
            className="mt-10 space-y-3"
            style={{ animation: 'fadeUp 0.85s ease 0.55s both', opacity: 0 }}
          >
            {[
              'Accès aux annonces de la coopérative',
              'Documents officiels téléchargeables',
              'Messagerie directe avec l\'administration',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-capedig-orange flex items-center
                                justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/80 text-[14px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLONNE DROITE — Formulaire ── */}
      <div
        className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-12"
        style={{ background: '#FAFAF8' }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Tabs connexion / inscription */}
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { id: 'connexion',   label: 'Connexion'    },
              { id: 'inscription', label: 'Inscription'  },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOnglet(tab.id)}
                className={`flex-1 pb-3.5 text-[15px] font-semibold border-b-2
                            transition-all duration-250 -mb-px
                            ${onglet === tab.id
                              ? 'border-capedig-orange text-gray-900'
                              : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {onglet === 'connexion' ? (
            <>
              <div className="mb-7">
                <h2 className="font-display text-[26px] font-bold text-gray-900 mb-2">
                  Accédez à votre espace
                </h2>
                <p className="text-gray-500 text-[14.5px]">
                  Gérez votre production et vos transactions en toute sécurité.
                </p>
              </div>
              <FormConnexion onSuccess={handleSuccess} />
            </>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="font-display text-[26px] font-bold text-gray-900 mb-2">
                  Rejoindre la coopérative
                </h2>
                <p className="text-gray-500 text-[14.5px]">
                  Remplissez le formulaire. Votre compte sera validé sous 48h.
                </p>
              </div>
              <FormInscription />
            </>
          )}

          {/* Retour accueil */}
          <div className="mt-8 text-center">
            <Link to="/"
              className="text-gray-400 text-[13.5px] hover:text-capedig-orange
                         transition-colors duration-200">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
