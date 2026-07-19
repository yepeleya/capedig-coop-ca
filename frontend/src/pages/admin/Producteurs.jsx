import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { api } from '../../services/api'

const STATUT_LABEL = { actif: 'Actif', en_attente: 'En attente', suspendu: 'Suspendu' }
const STATUT_STYLE = {
  actif:      { bg: '#2D6A4F1A', text: '#2D6A4F' },
  en_attente: { bg: '#D4641A1A', text: '#D4641A' },
  suspendu:   { bg: '#DC26261A', text: '#DC2626' },
}

export default function Producteurs() {
  useAuth('/login-admin', null)

  const [producteurs, setProducteurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [msgSuccess, setMsgSuccess] = useState('')
  const [msgError, setMsgError] = useState('')
  const [page, setPage] = useState(1)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'suspendre'|'supprimer', producteur }
  const limit = 20

  const charger = () => {
    setLoading(true)
    api.get('producteurs/index.php', { page, limit, statut, search })
      .then(data => setProducteurs(Array.isArray(data) ? data : []))
      .catch(() => setMsgError('Impossible de charger les producteurs.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statut, search])

  const flash = (setter, text) => {
    setter(text)
    setTimeout(() => setter(''), 4000)
  }

  const handleValider = async (p) => {
    try {
      await api.post('producteurs/valider.php', { id: p.id, statut: 'actif' })
      flash(setMsgSuccess, `Le compte de ${p.nom} ${p.prenom} a été validé avec succès.`)
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const handleSuspendre = (p) => setConfirmAction({ type: 'suspendre', producteur: p })

  const confirmerSuspendre = async (p) => {
    try {
      await api.post('producteurs/valider.php', { id: p.id, statut: 'suspendu' })
      flash(setMsgSuccess, `Le compte de ${p.nom} ${p.prenom} a été suspendu.`)
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const handleReactiver = async (p) => {
    try {
      await api.post('producteurs/valider.php', { id: p.id, statut: 'actif' })
      flash(setMsgSuccess, `Le compte de ${p.nom} ${p.prenom} a été réactivé.`)
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const handleSupprimer = (p) => setConfirmAction({ type: 'supprimer', producteur: p })

  const confirmerSupprimer = async (p) => {
    try {
      await api.del('producteurs/supprimer.php', { id: p.id })
      flash(setMsgSuccess, `Le compte de ${p.nom} ${p.prenom} a été supprimé.`)
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const handleConfirmAction = () => {
    const { type, producteur } = confirmAction
    setConfirmAction(null)
    if (type === 'suspendre') confirmerSuspendre(producteur)
    else confirmerSupprimer(producteur)
  }

  const handleExportCSV = () => {
    const header = 'Code,Nom,Prenom,Localisation,Statut,Date inscription\n'
    const rows = producteurs.map(p =>
      `${p.code},${p.nom},${p.prenom},${p.localisation || ''},${STATUT_LABEL[p.statut]},${p.created_at}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'producteurs_capedig.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const total      = producteurs.length
  const actifs     = producteurs.filter(p => p.statut === 'actif').length
  const enAttente  = producteurs.filter(p => p.statut === 'en_attente').length
  const suspendus  = producteurs.filter(p => p.statut === 'suspendu').length

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          <div className="flex items-center justify-between mb-6"
               style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h1 className="font-display text-[26px] font-bold text-gray-900">
                Gestion des producteurs
              </h1>
              <p className="text-gray-500 text-[14px] mt-1">
                {total} producteurs affichés
              </p>
            </div>
            <button onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13.5px]
                         font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Exporter CSV
            </button>
          </div>

          {msgSuccess && (
            <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                            px-4 py-3 text-capedig-vert text-[13.5px] mb-5">
              ✓ {msgSuccess}
            </div>
          )}
          {msgError && (
            <div className="bg-red-50 border border-red-300 rounded-xl
                            px-4 py-3 text-red-600 text-[13.5px] mb-5">
              ✗ {msgError}
            </div>
          )}

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={e => { setPage(1); setSearch(e.target.value) }}
              placeholder="Rechercher un producteur (nom, code)..."
              className="flex-1 min-w-[220px] bg-white border border-gray-200 rounded-xl
                         px-4 py-2.5 text-[13.5px] outline-none focus:border-capedig-orange"
            />
            <select value={statut} onChange={e => { setPage(1); setStatut(e.target.value) }}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5
                         text-[13.5px] outline-none">
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="en_attente">En attente</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-bold
                               text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Producteur</th>
                  <th className="px-5 py-3.5">Localisation</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Inscrit le</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Chargement...</td></tr>
                )}
                {!loading && producteurs.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Aucun producteur trouvé.</td></tr>
                )}
                {!loading && producteurs.map(p => {
                  const style = STATUT_STYLE[p.statut] || STATUT_STYLE.en_attente
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-capedig-orange/15
                                         flex items-center justify-center font-bold
                                         text-[13px] text-capedig-orange">
                            {p.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13.5px] font-semibold text-gray-800">{p.nom} {p.prenom}</p>
                            <p className="text-[11.5px] text-gray-400">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-gray-600">{p.localisation || '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full w-fit"
                                style={{ background: style.bg, color: style.text }}>
                            {STATUT_LABEL[p.statut] || p.statut}
                          </span>
                          {p.statut === 'en_attente' && (
                            p.tel_verifie ? (
                              <span className="text-[10.5px] font-semibold text-capedig-vert flex items-center gap-1">
                                ✓ Téléphone vérifié
                              </span>
                            ) : (
                              <span className="text-[10.5px] font-semibold text-amber-600 flex items-center gap-1">
                                ⚠ Téléphone non vérifié
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-gray-600">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.statut === 'en_attente' && (
                            <button
                              onClick={() => handleValider(p)}
                              title={!p.tel_verifie
                                ? "Vérification SMS suspendue temporairement — validation possible sans confirmation du téléphone"
                                : undefined}
                              className="text-[12.5px] font-semibold text-capedig-vert hover:underline"
                            >
                              Valider
                            </button>
                          )}
                          {p.statut === 'actif' && (
                            <button onClick={() => handleSuspendre(p)}
                              className="text-[12.5px] font-semibold text-capedig-orange
                                         hover:underline">
                              Suspendre
                            </button>
                          )}
                          {p.statut === 'suspendu' && (
                            <button onClick={() => handleReactiver(p)}
                              className="text-[12.5px] font-semibold text-capedig-vert
                                         hover:underline">
                              Réactiver
                            </button>
                          )}
                          <button onClick={() => handleSupprimer(p)}
                            className="text-[12.5px] font-semibold text-red-500
                                       hover:underline">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t
                            border-gray-100">
              <p className="text-[12.5px] text-gray-400">
                Page {page} — {total} résultats affichés
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12.5px]
                             text-gray-600 hover:bg-gray-50">
                  Précédent
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-capedig-orange text-white
                                 text-[12.5px] font-semibold">{page}</span>
                <button onClick={() => setPage(p => p + 1)}
                  disabled={producteurs.length < limit}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12.5px]
                             text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  Suivant
                </button>
              </div>
            </div>
          </div>

          {/* Stats résumé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-capedig-vert font-display">{actifs}</p>
              <p className="text-[13px] text-gray-500 mt-1">Comptes actifs (page)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-capedig-orange font-display">{enAttente}</p>
              <p className="text-[13px] text-gray-500 mt-1">En attente de validation (page)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-red-500 font-display">{suspendus}</p>
              <p className="text-[13px] text-gray-500 mt-1">Comptes suspendus (page)</p>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        danger={confirmAction?.type === 'supprimer'}
        title={confirmAction?.type === 'supprimer' ? 'Supprimer le compte' : 'Suspendre le compte'}
        message={confirmAction ? (
          confirmAction.type === 'supprimer'
            ? `Supprimer définitivement le compte de ${confirmAction.producteur.nom} ${confirmAction.producteur.prenom} ? Cette action est irréversible.`
            : `Confirmer la suspension du compte de ${confirmAction.producteur.nom} ${confirmAction.producteur.prenom} ?`
        ) : ''}
        confirmLabel={confirmAction?.type === 'supprimer' ? 'Supprimer' : 'Suspendre'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
