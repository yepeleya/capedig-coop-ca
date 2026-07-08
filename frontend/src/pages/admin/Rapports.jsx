import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import { api } from '../../services/api'

// ── Export CSV natif (sans bibliothèque) ─────────────────────
function exportCSV(rows, colonnes, nomFichier) {
  const escape = v => {
    if (v == null) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = colonnes.map(c => escape(c.label)).join(',')
  const body   = rows.map(r => colonnes.map(c => escape(r[c.key])).join(',')).join('\n')
  const blob   = new Blob(['﻿' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = nomFichier
  a.click()
  URL.revokeObjectURL(url)
}

// ── Carte statistique ─────────────────────────────────────────
function StatCard({ label, value, color = '#D4641A', sub }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-[12px] text-gray-500 font-medium mb-1">{label}</p>
        <p className="font-display font-bold text-[32px]" style={{ color }}>{value}</p>
        {sub && <p className="text-[11.5px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Badge statut ──────────────────────────────────────────────
function StatutBadge({ statut }) {
  const cfg = {
    actif:       { bg: '#D1FAE5', color: '#065F46', label: 'Actif' },
    en_attente:  { bg: '#FEF3C7', color: '#92400E', label: 'En attente' },
    suspendu:    { bg: '#FEE2E2', color: '#991B1B', label: 'Suspendu' },
  }[statut] || { bg: '#F3F4F6', color: '#374151', label: statut }
  return (
    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function Rapports() {
  useAuth('/login-admin', null)

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [onglet,  setOnglet]  = useState('producteurs')
  const [search,  setSearch]  = useState('')
  const printRef = useRef(null)

  useEffect(() => {
    api.get('rapports/index.php')
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => window.print()

  // ── Producteurs filtrés ───────────────────────────────────
  const producteursFiltres = (data?.producteurs || []).filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return [p.nom, p.prenom, p.code_producteur, p.email, p.localisation, p.section]
      .some(v => (v || '').toLowerCase().includes(q))
  })

  const handleExportProducteurs = () => {
    exportCSV(producteursFiltres, [
      { key: 'code_producteur',    label: 'Code' },
      { key: 'nom',                label: 'Nom' },
      { key: 'prenom',             label: 'Prénom' },
      { key: 'email',              label: 'Email' },
      { key: 'telephone',          label: 'Téléphone' },
      { key: 'localisation',       label: 'Localisation' },
      { key: 'section',            label: 'Section' },
      { key: 'statut',             label: 'Statut' },
      { key: 'nb_messages',        label: 'Messages envoyés' },
      { key: 'nb_telechargements', label: 'Téléchargements' },
      { key: 'created_at',         label: 'Inscrit le' },
    ], 'producteurs_capedig.csv')
  }

  const handleExportDocuments = () => {
    exportCSV(data?.documents || [], [
      { key: 'titre',              label: 'Titre' },
      { key: 'type_fichier',       label: 'Type' },
      { key: 'categorie',          label: 'Catégorie' },
      { key: 'acces',              label: 'Accès' },
      { key: 'nb_telechargements', label: 'Téléchargements' },
      { key: 'created_at',         label: 'Ajouté le' },
    ], 'documents_capedig.csv')
  }

  const stats = data?.stats || {}

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8" ref={printRef}>

          {/* En-tête */}
          <div className="flex items-start justify-between mb-8"
               style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h1 className="font-display text-[26px] font-bold text-gray-900">Rapports</h1>
              <p className="text-gray-500 text-[14px] mt-1">
                Vue d'ensemble de l'activité de la coopérative
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200
                           text-[13.5px] font-semibold text-gray-600 bg-white hover:bg-gray-50
                           transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer / PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 skeleton rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Cartes statistiques */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                   style={{ animation: 'fadeUp 0.5s ease 0.1s both', opacity: 0 }}>
                <StatCard label="Total producteurs"  value={stats.total_producteurs}      color="#D4641A" />
                <StatCard label="Actifs"              value={stats.producteurs_actifs}     color="#059669" />
                <StatCard label="En attente"          value={stats.producteurs_en_attente} color="#D97706" />
                <StatCard label="Annonces publiées"   value={stats.annonces_publiees}      color="#7C3AED" />
                <StatCard label="Documents"           value={stats.total_documents}        color="#0284C7" />
                <StatCard label="Téléchargements"     value={stats.total_telechargements}  color="#0891B2" />
                <StatCard label="Conversations"       value={stats.total_conversations}    color="#D4641A" />
                <StatCard label="Conv. ouvertes"      value={stats.conversations_ouvertes} color="#DC2626" />
              </div>

              {/* Onglets */}
              <div className="flex gap-2 mb-5 print:hidden"
                   style={{ animation: 'fadeUp 0.5s ease 0.2s both', opacity: 0 }}>
                {[
                  { key: 'producteurs', label: 'Producteurs' },
                  { key: 'documents',   label: 'Documents' },
                ].map(o => (
                  <button key={o.key} onClick={() => setOnglet(o.key)}
                    className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-colors
                               ${onglet === o.key
                                 ? 'bg-capedig-orange text-white'
                                 : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    {o.label}
                  </button>
                ))}
              </div>

              {/* ── TABLE PRODUCTEURS ── */}
              {onglet === 'producteurs' && (
                <div style={{ animation: 'fadeUp 0.4s ease both' }}>
                  <div className="flex items-center justify-between mb-4 print:hidden">
                    <div className="flex items-center gap-3">
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un producteur…"
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5
                                   text-[13.5px] outline-none w-72" />
                      <span className="text-[13px] text-gray-500">
                        {producteursFiltres.length} résultat{producteursFiltres.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <button onClick={handleExportProducteurs}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                 bg-capedig-vert text-white text-[13.5px] font-semibold
                                 hover:opacity-90 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Exporter CSV
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11.5px] font-bold
                                       text-gray-400 uppercase tracking-wide">
                          <th className="px-5 py-3.5">Code</th>
                          <th className="px-5 py-3.5">Nom & Prénom</th>
                          <th className="px-5 py-3.5">Email</th>
                          <th className="px-5 py-3.5">Localisation</th>
                          <th className="px-5 py-3.5">Statut</th>
                          <th className="px-5 py-3.5 text-center">Messages</th>
                          <th className="px-5 py-3.5 text-center">Téléch.</th>
                          <th className="px-5 py-3.5">Inscrit le</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {producteursFiltres.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-[13.5px]">
                              Aucun producteur trouvé.
                            </td>
                          </tr>
                        ) : producteursFiltres.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="text-[12px] font-bold text-gray-500 font-mono">
                                {p.code_producteur || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="text-[13.5px] font-semibold text-gray-800">
                                {[p.prenom, p.nom].filter(Boolean).join(' ') || '—'}
                              </p>
                              {p.section && (
                                <p className="text-[11.5px] text-gray-400">{p.section}</p>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-600">{p.email || '—'}</td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-600">{p.localisation || '—'}</td>
                            <td className="px-5 py-3.5"><StatutBadge statut={p.statut} /></td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="text-[13.5px] font-bold text-gray-700">
                                {p.nb_messages || 0}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="text-[13.5px] font-bold text-gray-700">
                                {p.nb_telechargements || 0}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-500">
                              {p.created_at
                                ? new Date(p.created_at).toLocaleDateString('fr-FR')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TABLE DOCUMENTS ── */}
              {onglet === 'documents' && (
                <div style={{ animation: 'fadeUp 0.4s ease both' }}>
                  <div className="flex items-center justify-between mb-4 print:hidden">
                    <p className="text-[13px] text-gray-500">
                      {(data?.documents || []).length} documents · classés par popularité
                    </p>
                    <button onClick={handleExportDocuments}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                 bg-capedig-vert text-white text-[13.5px] font-semibold
                                 hover:opacity-90 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Exporter CSV
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11.5px] font-bold
                                       text-gray-400 uppercase tracking-wide">
                          <th className="px-5 py-3.5">Document</th>
                          <th className="px-5 py-3.5">Type</th>
                          <th className="px-5 py-3.5">Catégorie</th>
                          <th className="px-5 py-3.5">Accès</th>
                          <th className="px-5 py-3.5 text-right">Téléchargements</th>
                          <th className="px-5 py-3.5">Ajouté le</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(data?.documents || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-[13.5px]">
                              Aucun document.
                            </td>
                          </tr>
                        ) : (data?.documents || []).map((d, i) => (
                          <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                {i < 3 && (
                                  <span className="text-[11px] font-bold text-capedig-orange">
                                    #{i + 1}
                                  </span>
                                )}
                                <p className="text-[13.5px] font-semibold text-gray-800">{d.titre}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[11.5px] font-bold uppercase text-gray-500">
                                {d.type_fichier}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full
                                               bg-gray-100 text-gray-600">
                                {d.categorie || 'Général'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-600">
                              {d.acces === 'tous' ? 'Tous' : 'Actifs'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`text-[15px] font-bold
                                ${(d.nb_telechargements || 0) > 0 ? 'text-capedig-orange' : 'text-gray-300'}`}>
                                {d.nb_telechargements || 0}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-gray-500">
                              {d.created_at
                                ? new Date(d.created_at).toLocaleDateString('fr-FR')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* CSS print */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          [class*="ml-[240px]"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
