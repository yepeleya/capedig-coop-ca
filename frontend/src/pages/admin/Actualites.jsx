import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import RichTextEditor from '../../components/admin/RichTextEditor'
import { api } from '../../services/api'

const CATEGORIES = ['Certification', 'Récolte', 'Formation', 'Infrastructure', 'Marché', 'Autre']
const STATUT_LABEL = { publiee: 'Publiée', brouillon: 'Brouillon', programmee: 'Programmée' }
const STATUT_COLOR = { publiee: 'capedig-vert', brouillon: 'capedig-orange', programmee: '#3B82F6' }
const EXT_VIDEO = ['mp4', 'webm', 'mov']

function isVideo(filename) {
  if (!filename) return false
  const ext = filename.split('.').pop().toLowerCase()
  return EXT_VIDEO.includes(ext)
}

function ActualiteModal({ initial, onClose, onSave }) {
  useLockBodyScroll()
  const [titre, setTitre] = useState(initial?.titre || '')
  const [categorie, setCategorie] = useState(initial?.categorie || CATEGORIES[0])
  const [contenu, setContenu] = useState(initial?.contenu || '')
  const [statut, setStatut] = useState(initial?.statut || 'brouillon')
  const [datePublication, setDatePublication] = useState(initial?.date_publication || '')
  const [dateSuppression, setDateSuppression] = useState(initial?.date_suppression || '')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(initial?.image ? `/uploads/${initial.image}` : null)
  const [mediaPreviewIsVideo, setMediaPreviewIsVideo] = useState(isVideo(initial?.image))
  const [mediaRetiree, setMediaRetiree] = useState(false)
  const [erreur, setErreur] = useState('')
  const [sending, setSending] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setErreur('Fichier trop volumineux (max 20 Mo).')
      return
    }
    setMediaFile(file)
    setMediaRetiree(false)
    setMediaPreview(URL.createObjectURL(file))
    setMediaPreviewIsVideo(file.type.startsWith('video/'))
  }

  const handleRetirerMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaRetiree(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (statut === 'programmee' && !datePublication) {
      setErreur('La date de publication est requise pour une actualité programmée.')
      return
    }
    if (!contenu || contenu.trim() === '') {
      setErreur('Le contenu est requis.')
      return
    }

    const formData = new FormData()
    if (initial?.id) formData.append('id', initial.id)
    formData.append('titre', titre)
    formData.append('categorie', categorie)
    formData.append('contenu', contenu)
    formData.append('statut', statut)
    if (datePublication) formData.append('date_publication', datePublication)
    if (dateSuppression) formData.append('date_suppression', dateSuppression)
    if (mediaFile) formData.append('media', mediaFile)
    formData.append('image_actuelle', mediaRetiree ? '' : (initial?.image || ''))

    setSending(true)
    setErreur('')
    try {
      await onSave(formData, !!initial?.id)
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
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto overscroll-contain"
           style={{ animation: 'scaleIn 0.3s ease both' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-[19px] font-bold text-gray-900">
            {initial ? "Modifier l'actualité" : 'Nouvelle actualité'}
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
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Catégorie</label>
            <select value={categorie} onChange={e => setCategorie(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Image ou vidéo (facultatif, max 20 Mo)
            </label>
            {mediaPreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 mb-2 bg-black">
                {mediaPreviewIsVideo ? (
                  <video src={mediaPreview} className="w-full h-full object-contain" controls />
                ) : (
                  <img src={mediaPreview} alt="" className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={handleRetirerMedia}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500
                             rounded-lg px-2.5 py-1 text-[12px] font-semibold shadow">
                  Retirer
                </button>
              </div>
            ) : (
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contenu</label>
            <RichTextEditor value={contenu} onChange={setContenu}
              placeholder="Rédigez le contenu de l'actualité..." />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Statut</label>
            <select value={statut} onChange={e => setStatut(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              <option value="brouillon">Brouillon</option>
              <option value="publiee">Publiée immédiatement</option>
              <option value="programmee">Programmée</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Date de publication {statut === 'programmee' && <span className="text-red-500">*</span>}
              </label>
              <input type="datetime-local" value={datePublication}
                onChange={e => setDatePublication(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Date de suppression auto
              </label>
              <input type="datetime-local" value={dateSuppression}
                onChange={e => setDateSuppression(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13.5px]
                         font-semibold text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={sending}
              className="btn-shine px-4 py-2.5 rounded-xl bg-capedig-orange text-white
                         text-[13.5px] font-semibold hover:bg-capedig-orange-light disabled:opacity-50">
              {sending ? 'Enregistrement...' : (initial ? 'Enregistrer' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Actualites() {
  useAuth('/login-admin', null)

  const [actualites, setActualites] = useState([])
  const [loading, setLoading] = useState(true)
  const [categorie, setCategorie] = useState('Toutes')
  const [modal, setModal] = useState(null) // null | 'new' | objet à éditer
  const [msgSuccess, setMsgSuccess] = useState('')
  const [msgError, setMsgError] = useState('')

  const charger = () => {
    setLoading(true)
    api.get('actualites/index.php', { admin: 1 })
      .then(data => setActualites(Array.isArray(data) ? data : []))
      .catch(() => setMsgError('Impossible de charger les actualités.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { charger() }, [])

  const flash = (setter, text) => { setter(text); setTimeout(() => setter(''), 4000) }

  const filtered = actualites.filter(a => categorie === 'Toutes' || a.categorie === categorie)

  const handleSave = async (formData, isUpdate) => {
    await api.postForm(isUpdate ? 'actualites/update.php' : 'actualites/create.php', formData)
    flash(setMsgSuccess, isUpdate ? 'Actualité mise à jour avec succès.' : 'Actualité créée avec succès.')
    setModal(null)
    charger()
  }

  const handleDelete = async (a) => {
    if (!confirm(`Supprimer l'actualité "${a.titre}" ?`)) return
    try {
      await api.del('actualites/supprimer.php', { id: a.id })
      flash(setMsgSuccess, 'Actualité supprimée.')
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const toggleStatut = async (a) => {
    const nouveau = a.statut === 'publiee' ? 'brouillon' : 'publiee'
    try {
      await api.post('actualites/update_statut.php', { id: a.id, statut: nouveau })
      charger()
    } catch (e) {
      flash(setMsgError, e.message)
    }
  }

  const publiees = actualites.filter(a => a.statut === 'publiee').length
  const programmees = actualites.filter(a => a.statut === 'programmee').length
  const brouillons = actualites.filter(a => a.statut === 'brouillon').length

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          <div className="flex items-center justify-between mb-6"
               style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h1 className="font-display text-[26px] font-bold text-gray-900">Actualités</h1>
              <p className="text-gray-500 text-[14px] mt-1">{actualites.length} actualités au total</p>
            </div>
            <button onClick={() => setModal('new')}
              className="btn-shine px-4 py-2.5 rounded-xl bg-capedig-orange text-white
                         text-[13.5px] font-semibold hover:bg-capedig-orange-light">
              + Nouvelle actualité
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-capedig-vert font-display">{publiees}</p>
              <p className="text-[13px] text-gray-500 mt-1">Publiées</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-blue-500 font-display">{programmees}</p>
              <p className="text-[13px] text-gray-500 mt-1">Programmées</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 card-hover">
              <p className="text-[24px] font-bold text-capedig-orange font-display">{brouillons}</p>
              <p className="text-[13px] text-gray-500 mt-1">Brouillons</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <select value={categorie} onChange={e => setCategorie(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              <option>Toutes</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-bold
                               text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Actualité</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Publication</th>
                  <th className="px-5 py-3.5">Suppression auto</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Chargement...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-[13.5px]">Aucune actualité.</td></tr>
                )}
                {!loading && filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {a.image ? (
                          isVideo(a.image) ? (
                            <div className="w-12 h-12 rounded-lg bg-gray-900 flex-shrink-0 flex
                                            items-center justify-center text-white text-[16px]">
                              ▶
                            </div>
                          ) : (
                            <img src={`/uploads/${a.image}`} alt=""
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          )
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex
                                          items-center justify-center text-gray-300 text-[10px]">
                            ∅
                          </div>
                        )}
                        <div>
                          <p className="text-[13.5px] font-semibold text-gray-800 line-clamp-1">{a.titre}</p>
                          <p className="text-[11.5px] text-gray-400">{a.categorie}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleStatut(a)}
                        className="flex items-center gap-2 text-[12.5px] font-semibold"
                        disabled={a.statut === 'programmee'}>
                        <span className="w-2 h-2 rounded-full"
                              style={{ background: STATUT_COLOR[a.statut] }} />
                        <span style={{ color: a.statut === 'programmee' ? '#3B82F6' : undefined }}
                              className={a.statut !== 'programmee' ? (a.statut === 'publiee' ? 'text-capedig-vert' : 'text-capedig-orange') : ''}>
                          {STATUT_LABEL[a.statut]}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">
                      {a.date_publication ? new Date(a.date_publication).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">
                      {a.date_suppression ? new Date(a.date_suppression).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(a)}
                          className="text-[12.5px] font-semibold text-gray-500 hover:underline">
                          Éditer
                        </button>
                        <button onClick={() => handleDelete(a)}
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
        <ActualiteModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
