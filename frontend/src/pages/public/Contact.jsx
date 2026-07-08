import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useReveal } from '../../hooks/useReveal'

const INFO_CARDS = [
  {
    titre: 'Adresse',
    lignes: ['Siège Social CAPEDIG-COOP CA,', 'Abidjan, Côte d\'Ivoire'],
    path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    titre: 'Téléphone',
    lignes: ['Standard: +225 27 00 00 00', 'Mobile: +225 07 00 00 00'],
    path: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  },
  {
    titre: 'Email & Horaires',
    lignes: ['contact@capedig.ci', 'Lun-Ven: 08:00 - 17:00'],
    path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
]

const SUJETS = [
  'Informations générales',
  'Adhésion / devenir membre',
  'Partenariat commercial',
  'Questions techniques',
  'Réclamation',
  'Autre',
]

export default function Contact() {
  useReveal()

  const [form, setForm] = useState({
    nom: '', email: '', sujet: '', message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(false)

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      const res = await fetch('/api/contact/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setSent(true); setForm({ nom: '', email: '', sujet: '', message: '' }) }
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  const inputClass = `w-full border border-capedig-beige-dark rounded-xl px-4 py-3
    text-[14px] text-gray-800 placeholder-gray-400 outline-none
    focus:border-capedig-orange focus:ring-1 focus:ring-capedig-orange/30
    transition-all duration-250 bg-capedig-beige`

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center"
        style={{ minHeight: '52vh', paddingTop: '68px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero/hero-4-cabosse-dramatique.jpg')",
            filter: 'brightness(0.4)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(20,8,2,0.55)' }}
        />
        <div className="relative z-10 text-center px-6">
          <h1
            className="font-display text-white font-bold mb-4"
            style={{
              fontSize: 'clamp(36px, 5vw, 58px)',
              animation: 'fadeUp 0.85s ease 0.2s both',
              opacity: 0,
            }}
          >
            Contactez-nous
          </h1>
          <p
            className="text-white/80 text-[16px] max-w-xl mx-auto leading-relaxed"
            style={{ animation: 'fadeUp 0.85s ease 0.4s both', opacity: 0 }}
          >
            Notre équipe est à votre entière disposition pour répondre
            à toutes vos questions et besoins d'accompagnement.
          </p>
        </div>
      </section>

      {/* ── 3 CARDS INFO ── */}
      <section className="relative z-10 px-6 -mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {INFO_CARDS.map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-7 text-center shadow-xl
                          shadow-gray-900/10 border border-capedig-beige-dark reveal delay-${i + 1}`}
            >
              <div className="w-14 h-14 rounded-full bg-capedig-orange/12 flex items-center
                              justify-center mx-auto mb-5">
                <svg className="w-6 h-6 text-capedig-orange" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.8} d={card.path} />
                </svg>
              </div>
              <h3 className="font-bold text-[16px] text-gray-900 mb-2">{card.titre}</h3>
              {card.lignes.map((l, j) => (
                <p key={j} className="text-gray-500 text-[13.5px] leading-relaxed">{l}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULAIRE + PANNEAU DROIT ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

          {/* Formulaire */}
          <div className="bg-white rounded-2xl p-8 border border-capedig-beige-dark reveal-left">
            <h2 className="font-display text-[26px] font-bold text-gray-900 mb-7">
              Formulaire de Contact
            </h2>

            {sent ? (
              <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl p-6 text-center">
                <p className="text-[36px] mb-3">✅</p>
                <p className="font-bold text-[17px] text-capedig-vert mb-2">
                  Message envoyé avec succès !
                </p>
                <p className="text-capedig-vert text-[14px]">
                  Nous vous répondrons dans les 24 heures ouvrables.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-capedig-orange text-[14px] font-semibold
                             hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500
                                      tracking-[1px] uppercase mb-2">
                      Nom Complet
                    </label>
                    <input
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Ex: Jean Koffi"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500
                                      tracking-[1px] uppercase mb-2">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jean.koffi@exemple.ci"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500
                                    tracking-[1px] uppercase mb-2">
                    Objet du Message
                  </label>
                  <select
                    name="sujet"
                    value={form.sujet}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Sélectionnez un sujet</option>
                    {SUJETS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500
                                    tracking-[1px] uppercase mb-2">
                    Votre Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Comment pouvons-nous vous aider ?"
                    required
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                                  text-red-700 text-[13.5px]">
                    Une erreur est survenue. Veuillez réessayer.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-shine bg-capedig-orange text-white px-7 py-4
                             rounded-xl font-semibold text-[15px] flex items-center gap-2
                             transition-all duration-300 hover:bg-capedig-orange-light
                             hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le message
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Panneau droit */}
          <div className="flex flex-col gap-5 reveal-right">
            {/* Bloc producteur */}
            <div className="bg-capedig-brun rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-capedig-orange/20 flex items-center
                              justify-center mb-5">
                <svg className="w-6 h-6 text-capedig-orange" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display text-white text-[20px] font-bold mb-3">
                Producteur ou membre ?
              </h3>
              <p className="text-white/70 text-[13.5px] leading-relaxed mb-6">
                Connectez-vous à votre espace dédié pour utiliser la messagerie
                interne et accéder à vos services personnalisés.
              </p>
              <Link
                to="/login-producteur"
                className="btn-shine block w-full text-center bg-capedig-orange text-white
                           py-3.5 rounded-xl font-semibold text-[14px]
                           transition-all duration-250 hover:bg-capedig-orange-light"
              >
                Accéder à l'Espace Pro
              </Link>
            </div>

            {/* Bloc urgence */}
            <div className="bg-white rounded-2xl p-7 border border-capedig-beige-dark">
              <h3 className="font-bold text-[17px] text-gray-900 mb-3">
                Urgence ou Assistance
              </h3>
              <p className="text-gray-500 text-[13.5px] leading-relaxed mb-4">
                Pour toute assistance immédiate liée à la collecte ou au transport,
                veuillez contacter notre ligne prioritaire.
              </p>
              <a href="tel:+22527000001"
                className="flex items-center gap-2 text-capedig-orange font-bold text-[16px]
                           hover:text-capedig-orange-light transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +225 27 00 00 01
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARTE ── */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div
            className="reveal bg-capedig-beige-dark rounded-2xl overflow-hidden
                        h-[350px] flex items-center justify-center
                        border border-capedig-beige-dark relative"
          >
            {/* Placeholder carte (remplacer par un vrai embed si disponible) */}
            <div className="text-center">
              <svg className="w-14 h-14 text-capedig-orange mx-auto mb-4"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-bold text-[17px] text-gray-700 mb-1">
                Vue de la Carte — Siège CAPEDIG-COOP CA
              </p>
              <p className="text-gray-500 text-[14px]">Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
