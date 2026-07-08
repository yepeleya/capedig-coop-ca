import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import { api } from '../../services/api'

const CATEGORIES = [
  { id: 'agricole',        label: 'Agricole' },
  { id: 'social',          label: 'Social' },
  { id: 'environnemental', label: 'Environnemental' },
]

const STATUTS = [
  { id: 'planifie', label: 'Planifié' },
  { id: 'nouveau',  label: 'Nouveau' },
  { id: 'pilote',   label: 'Pilote' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'termine',  label: 'Terminé' },
]

const STATUT_STYLE = {
  planifie: 'bg-gray-100 text-gray-600',
  nouveau:  'bg-blue-50 text-blue-600',
  pilote:   'bg-amber-50 text-amber-700',
  en_cours: 'bg-orange-50 text-capedig-orange',
  termine:  'bg-green-50 text-capedig-vert',
}

const PUBLICATION_LABEL = { publiee: 'Publié', brouillon: 'Brouillon', programmee: 'Programmé' }
const PUBLICATION_STYLE = {
  publiee:    'bg-capedig-vert/10 text-capedig-vert',
  brouillon:  'bg-gray-100 text-gray-500',
  programmee: 'bg-blue-50 text-blue-600',
}

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]))
const STATUT_LABEL = Object.fromEntries(STATUTS.map(s => [s.id, s.label]))

function ProjetModal({ initial, onClose, onSave }) {
  useLockBodyScroll()
  const [titre, setTitre]             = useState(initial?.titre || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [categorie, setCategorie]     = useState(initial?.categorie || 'agricole')
  const [statut, setStatut]           = useState(initial?.statut || 'planifie')
  const [dateDebut, setDateDebut]     = useState(initial?.date_debut || '')
  const [dateFin, setDateFin]         = useState(initial?.date_fin || '')
  const [publication, setPublication] = useState(initial?.publication || 'publiee')
  const [datePublication, setDatePublication] = useState(initial?.date_publication || '')
  const [dateSuppression, setDateSuppression] = useState(initial?.date_suppression || '')
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.image ? `/uploads/${initial.image}` : null)
  const [imageRetiree, setImageRetiree] = useState(false)
  const [erreur, setErreur]           = useState('')
  const [sending, setSending]         = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImageRetiree(false)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (publication === 'programmee' && !datePublication) {
      setErreur('La date de publication est requise pour un projet programmé.')
      return
    }

    const fd = new FormData()
    if (initial?.id) fd.append('id', initial.id)
    fd.append('titre', titre)
    fd.append('description', description)
    fd.append('categorie', categorie)
    fd.append('statut', statut)
    if (dateDebut) fd.append('date_debut', dateDebut)
    if (dateFin)   fd.append('date_fin', dateFin)
    fd.append('publication', publication)
    if (datePublication) fd.append('date_publication', datePublication)
    if (dateSuppression) fd.append('date_suppression', dateSuppression)
    if (imageFile) fd.append('image', imageFile)
    if (imageRetiree) fd.append('supprimer_image', '1')

    setSending(true)
    setErreur('')
    try {
      await onSave(fd)
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
            {initial ? 'Modifier le projet' : 'Nouveau projet'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Catégorie</label>
              <select value={categorie} onChange={e => setCategorie(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Statut</label>
              <select value={statut} onChange={e => setStatut(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
                {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Image (facultatif)
            </label>
            {imagePreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 mb-2">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); setImageRetiree(true) }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500
                             rounded-lg px-2.5 py-1 text-[12px] font-semibold shadow">
                  Retirer
                </button>
              </div>
            ) : (
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                         outline-none focus:border-capedig-orange resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date de début</label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date de fin</label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Publication sur le site
            </label>
            <select value={publication} onChange={e => setPublication(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
              <option value="publiee">Publié immédiatement</option>
              <option value="brouillon">Brouillon (non visible)</option>
              <option value="programmee">Programmé</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Date de publication {publication === 'programmee' && <span className="text-red-500">*</span>}
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px]
                         font-semibold text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={sending}
              className="btn-shine flex-1 bg-capedig-orange text-white py-3 rounded-xl
                         text-[14px] font-bold disabled:opacity-60
                         hover:bg-capedig-orange-light transition-colors">
              {sending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projets() {
  useAuth('/login-admin', null)

  const [projets, setProjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)   // null | 'new' | projet
  const [erreur, setErreur]   = useState('')

  const charger = () => {
    setLoading(true)
    api.get('projets/index.php', { admin: 1 })
      .then(data => setProjets(Array.isArray(data) ? data : []))
      .catch(e => setErreur(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(charger, [])

  const handleSave = async (fd) => {
    const res = await api.postForm('projets/save.php', fd)
    if (!res.success) throw new Error(res.message || 'Erreur')
    setModal(null)
    charger()
  }

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer le projet "${p.titre}" ?`)) return
    try {
      await api.del(`projets/supprimer.php?id=${p.id}`)
      charger()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />
        <main className="p-8" style={{ animation: 'fadeIn 0.4s ease both' }}>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-[24px] font-bold text-gray-900">Projets & Activités</h1>
              <p className="text-gray-500 text-[13.5px] mt-0.5">
                Ces projets s'affichent sur la page publique « Activités »
              </p>
            </div>
            <button onClick={() => setModal('new')}
              className="btn-shine bg-capedig-orange text-white px-5 py-2.5 rounded-xl
                         text-[13.5px] font-bold hover:bg-capedig-orange-light transition-colors">
              + Nouveau projet
            </button>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3
                            text-red-600 text-[13.5px] mb-5">
              {erreur}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-56 skeleton rounded-2xl" />)}
            </div>
          ) : projets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-capedig-beige-dark p-14 text-center">
              <p className="text-gray-400 text-[14.5px]">
                Aucun projet. Cliquez sur « Nouveau projet » pour en créer un.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projets.map(p => (
                <div key={p.id}
                  className="bg-white rounded-2xl border border-capedig-beige-dark
                             overflow-hidden card-hover">
                  <div className="h-36 bg-gray-100 relative">
                    {p.image ? (
                      <div className="w-full h-full bg-cover bg-center"
                           style={{ backgroundImage: `url('/uploads/${p.image}')` }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1
                                      rounded-full ${STATUT_STYLE[p.statut] || STATUT_STYLE.planifie}`}>
                      {STATUT_LABEL[p.statut] || p.statut}
                    </span>
                    <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1
                                      rounded-full ${PUBLICATION_STYLE[p.publication] || PUBLICATION_STYLE.publiee}`}>
                      {PUBLICATION_LABEL[p.publication] || p.publication}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      {CAT_LABEL[p.categorie] || p.categorie}
                    </p>
                    <h3 className="font-bold text-[14.5px] text-gray-900 leading-tight mb-1.5">
                      {p.titre}
                    </h3>
                    <p className="text-[12.5px] text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(p)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-[12.5px]
                                   font-semibold text-gray-600 hover:bg-gray-50">
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(p)}
                        className="flex-1 py-2 rounded-lg border border-red-100 text-[12.5px]
                                   font-semibold text-red-500 hover:bg-red-50">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <ProjetModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
