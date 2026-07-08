import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

export default function LoginAdmin() {
  const [email,     setEmail]     = useState('')
  const [mdp,       setMdp]       = useState('')
  const [showMdp,   setShowMdp]   = useState(false)
  const [remember,  setRemember]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [attempts,  setAttempts]  = useState(0)

  const { login }  = useAuthContext()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (attempts >= 3) {
      setError('Trop de tentatives. Veuillez patienter quelques minutes.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        email.trim().toLowerCase(),
          mot_de_passe: mdp,
          remember_me:  remember,
        }),
      })
      const data = await res.json()

      if (data.success) {
        login(data.token, data.user)
        navigate('/admin/dashboard', { replace: true })
      } else {
        setAttempts(a => a + 1)
        setError(data.message || 'Identifiants incorrects.')
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const inputWrap = `flex items-center gap-3 border rounded-xl px-4 py-3.5
    transition-all duration-250 focus-within:ring-2 focus-within:ring-capedig-orange/20`
  const inputEl   = `flex-1 outline-none text-[14.5px] text-gray-800
    placeholder-gray-400 bg-transparent`

  return (
    <div className="min-h-screen flex">

      {/* ── GAUCHE — Visuel ── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col items-center
                   justify-center overflow-hidden"
      >
        {/* Image */}
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
          style={{ background: 'linear-gradient(135deg, rgba(42,21,9,0.96) 0%, rgba(42,21,9,0.75) 100%)' }}
        />

        <div className="relative z-10 text-center px-12">
          {/* Logo dans cercle blanc */}
          <div
            className="w-24 h-24 rounded-full bg-white/95 flex items-center
                       justify-center mx-auto mb-8 shadow-2xl overflow-hidden"
            style={{ animation: 'scaleIn 0.7s ease 0.2s both', opacity: 0 }}
          >
            <img src="/logo/cape_logo_new.png" alt="CAPEDIG"
                 className="w-16 h-16 object-contain" />
          </div>

          <h1
            className="text-white font-bold text-[32px] tracking-wide mb-4
                       font-display"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            CAPEDIG-COOP CA
          </h1>
          <p
            className="text-white/65 text-[15px] leading-relaxed max-w-xs mx-auto"
            style={{ animation: 'fadeUp 0.85s ease 0.55s both', opacity: 0 }}
          >
            La force de la terre, le progrès des producteurs.<br />
            Espace de gestion sécurisé.
          </p>
        </div>
      </div>

      {/* ── DROITE — Formulaire ── */}
      <div
        className="flex-1 lg:w-[45%] flex flex-col justify-between px-8 lg:px-14 py-12"
        style={{ background: '#FAF8F5' }}
      >
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div
            className="mb-9"
            style={{ animation: 'fadeUp 0.8s ease 0.1s both', opacity: 0 }}
          >
            <h2 className="font-display text-[30px] font-bold text-gray-900 mb-3">
              Connexion Administrateur
            </h2>
            <p className="text-gray-500 text-[14.5px] leading-relaxed">
              Veuillez saisir vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            style={{ animation: 'fadeUp 0.8s ease 0.25s both', opacity: 0 }}
          >
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Identifiant Admin ou Email
              </label>
              <div className={`${inputWrap} bg-white border-gray-200
                               focus-within:border-capedig-orange`}>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@capedig.ci"
                  required
                  className={inputEl}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-semibold text-gray-700">
                  Mot de passe
                </label>
                <Link to="/mot-de-passe-oublie"
                  className="text-[13px] font-semibold text-capedig-orange
                             hover:text-capedig-orange-light transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className={`${inputWrap} bg-white border-gray-200
                               focus-within:border-capedig-orange`}>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor"
                       viewBox="0 0 24 24">
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

            {/* Se souvenir */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-capedig-orange
                           focus:ring-capedig-orange accent-capedig-orange"
              />
              <span className="text-[13.5px] text-gray-600">Se souvenir de moi</span>
            </label>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                              text-red-700 text-[13.5px] flex items-start gap-2">
                <span className="flex-shrink-0">⚠</span> {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading || attempts >= 3}
              className="btn-shine w-full bg-capedig-orange text-white py-4 rounded-xl
                         font-bold text-[15px] flex items-center justify-center gap-2
                         transition-all duration-300 hover:bg-capedig-orange-light
                         disabled:opacity-55 disabled:cursor-not-allowed"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Se connecter au Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer bas */}
        <div className="border-t border-gray-200 pt-6 flex items-center justify-between
                        text-[12.5px] text-gray-400 max-w-md mx-auto w-full">
          <span>© {new Date().getFullYear()} CAPEDIG-COOP CA.</span>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-gray-600 transition-colors">
              Aide &amp; Support
            </Link>
            <Link to="/confidentialite" className="hover:text-gray-600 transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
