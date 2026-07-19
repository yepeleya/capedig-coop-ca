import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { api } from '../../services/api'

const CATEGORIES_SUGGESTIONS = ['Général', 'Guides techniques', 'Statuts', 'Rapports financiers', 'Formulaires']

function DocumentModal({ initial, onClose, onSave }) {
  const [titre, setTitre] = useState(initial?.titre || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [acces, setAcces] = useState(initial?.acces || 'actifs')
  const [categorie, setCategorie] = useState(initial?.categorie || 'Général')
  const [fichier, setFichier] = useState(null)
  const [erreur, setErreur] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!initial && !fichier) { setErreur('Sélectionnez un fichier.'); return }

    setSending(true)
    setErreur('')
    try {
      if (initial) {
        await onSave({ id: initial.id, titre, description, acces, categorie }, false)
      } else {
        const formData = new FormData()
        formData.append('titre', titre)
        formData.append('description', description)
        formData.append('acces', acces)
        formData.append('categorie', categorie)
        formData.append('fichier', fichier)
        await onSave(formData, true)
      }
    } catch (err) {
      setErreur(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" style={{ animation: 'scaleIn 0.3s ease both' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-[19px] font-bold text-gray-900">
            {initial ? 'Modifier le document' : 'Nouveau document'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {erreur && (
          <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-2.5 text-red-600 text-[13px] mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Titre</label>
            <input value={titre} onChange={e => setTitre(e.target.value)} required maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                         outline-none focus:border-capedig-orange" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                         outline-none focus:border-capedig-orange resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Catégorie</label>
              <input value={categorie} onChange={e => setCategorie(e.target.value)}
                list="categories-suggestions" maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
              <datalist id="categories-suggestions">
                {CATEGORIES_SUGGESTIONS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Accès</label>
              <select value={acces} onChange={e => setAcces(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
                <option value="actifs">Producteurs actifs uniquement</option>
                <option value="tous">Tous les producteurs</option>
              </select>
            </div>
          </div>
          {!initial && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Fichier</label>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={e => setFichier(e.target.files[0])} required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13.5px]
                         font-semibold text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={sending}
              className="btn-shine px-4 py-2.5 rounded-xl bg-capedig-orange text-white
                         text-[13.5px] font-semibold hover:bg-capedig-orange-light disabled:opacity-50">
              {sending ? 'Enregistrement...' : (initial ? 'Enregistrer' : 'Téléverser')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Documents() {
  useAuth('/login-admin', null)

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [acces, setAcces] = useState('tous')
  const [categorieFiltre, setCategorieFiltre] = useState('Toutes')
  const [modal, setModal] = useState(null) // null | 'new' | objet à éditer
  const [msgSuccess, setMsgSuccess] = useState('')
  const [msgError, setMsgError] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)

  const flash = (setter, text) => { setter(text); setTimeout(() => setter(''), 4000) }

  const charger = () => {
    setLoading(true)
    api.get('documents/index.php', { acces })
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setMsgError('Impossible de charger les documents.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { charger() }, [acces])

  const categories = ['Toutes', ...new Set(documents.map(d => d.categorie).filter(Boolean))]
  const filtered = documents.filter(d => categorieFiltre === 'Toutes' || d.categorie === categorieFiltre)

  const handleSave = async (payload, isCreate) => {
    if (isCreate) {
      await api.postForm('documents/create.php', payload)
      flash(setMsgSuccess, 'Document ajouté avec succès.')
    } else {
      await api.post('documents/update.php', payload)
      flash(setMsgSuccess, 'Document mis à jour avec succès.')
    }
    setModal(null)
    charger()
  }

  const handleDelete = (d) => setASupprimer(d)

  const confirmerSuppression = async () => {
    const d = aSupprimer
    setASupprimer(null)
    try {
      await api.del('documents/supprimer.php', { id: d.id })
      flash(setMsgSuccess, 'Document supprimé.')
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          <div className="flex items-center justify-between mb-6"
               style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h1 className="font-display text-[26px] font-bold text-gray-900">Documents</h1>
              <p className="text-gray-500 text-[14px] mt-1">{documents.length} documents disponibles</p>
            </div>
            <button onClick={() => setModal('new')}
              className="btn-shine px-4 py-2.5 rounded-xl bg-capedig-orange text-white
                         text-[13.5px] font-semibold hover:bg-capedig-orange-light">
              + Ajouter un document
            </button>
          </div>

          {msgSuccess && (
            <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                            px-4 py-3 text-capedig-vert text-[13.5px] mb-5">✓ {msgSuccess}</div>
          )}
          {msgError && (
            <div className="bg-red-50 border border-red-300 rounded-xl
                            px-4 py-3 text-red-600 text-[13.5px] mb-5">✗ {msgError}</div>
          )}

          <div className="flex flex-wrap gap-3 mb-5">
            <select value={acces} onChange={e => setAcces(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              <option value="tous">Tous les documents</option>
              <option value="actifs">Accès producteurs actifs</option>
            </select>
            <select value={categorieFiltre} onChange={e => setCategorieFiltre(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-bold
                               text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Document</th>
                  <th className="px-5 py-3.5">Catégorie</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Taille</th>
                  <th className="px-5 py-3.5">Accès</th>
                  <th className="px-5 py-3.5">Ajouté le</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Chargement...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Aucun document.</td></tr>
                )}
                {!loading && filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[13.5px] font-semibold text-gray-800 line-clamp-1">{d.titre}</p>
                      {d.description && <p className="text-[11.5px] text-gray-400 line-clamp-1">{d.description}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {d.categorie || 'Général'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] font-bold text-gray-500 uppercase">{d.type_fichier}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-gray-600">{d.taille}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-capedig-orange/10 text-capedig-orange">
                        {d.acces === 'tous' ? 'Tous' : 'Actifs'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-gray-600">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/uploads/${d.fichier}`} target="_blank" rel="noreferrer"
                          className="text-[12.5px] font-semibold text-gray-500 hover:underline">
                          Télécharger
                        </a>
                        <button onClick={() => setModal(d)}
                          className="text-[12.5px] font-semibold text-gray-500 hover:underline">
                          Éditer
                        </button>
                        <button onClick={() => handleDelete(d)}
                          className="text-[12.5px] font-semibold text-red-500 hover:underline">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {modal && (
        <DocumentModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!aSupprimer}
        danger
        title="Supprimer le document"
        message={aSupprimer ? `Supprimer le document "${aSupprimer.titre}" ?` : ''}
        confirmLabel="Supprimer"
        onConfirm={confirmerSuppression}
        onCancel={() => setASupprimer(null)}
      />
    </div>
  )
}
