import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import { api } from '../../services/api'

const SECTIONS = [
  { id: 'profil',      label: 'Gestion du profil' },
  { id: 'securite',    label: 'Sécurité' },
  { id: 'cooperative', label: 'Infos coopérative' },
  { id: 'roles',       label: 'Gestion des admins' },
]

export default function Parametres() {
  useAuth('/login-admin', null)
  const { user, login, token } = useAuthContext()

  const [section, setSection] = useState('profil')
  const [msgSuccess, setMsgSuccess] = useState('')
  const [msgError, setMsgError] = useState('')

  const flash = (setter, text) => { setter(text); setTimeout(() => setter(''), 4000) }

  // ── Profil ──────────────────────────────────────────────
  const [profil, setProfil] = useState({ nom: '', prenom: '', email: '', telephone: '' })
  useEffect(() => {
    api.get('admin/get_profil.php').then(setProfil).catch(() => {})
  }, [])

  const handleSaveProfil = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('admin/update_profil.php', profil)
      flash(setMsgSuccess, 'Profil mis à jour avec succès.')
      login(token, { ...user, nom: profil.nom, prenom: profil.prenom, email: profil.email })
    } catch (err) {
      flash(setMsgError, err.message)
    }
  }

  // ── Sécurité ────────────────────────────────────────────
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmMdp, setConfirmMdp] = useState('')

  const handleSaveSecurite = async (e) => {
    e.preventDefault()
    if (nouveauMdp.length < 8) {
      flash(setMsgError, 'Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (nouveauMdp !== confirmMdp) {
      flash(setMsgError, 'Les mots de passe ne correspondent pas.')
      return
    }
    try {
      await api.post('admin/change_password.php', { nouveau_mdp: nouveauMdp })
      flash(setMsgSuccess, 'Mot de passe mis à jour avec succès.')
      setNouveauMdp(''); setConfirmMdp('')
    } catch (err) {
      flash(setMsgError, err.message)
    }
  }

  // ── Coopérative ─────────────────────────────────────────
  const [coop, setCoop] = useState({ nom: 'CAPEDIG-COOP CA', adresse: '', contact: '', agrement: '', site: '' })
  useEffect(() => {
    api.get('admin/get_coop.php').then(data => setCoop(prev => ({ ...prev, ...data }))).catch(() => {})
  }, [])

  const handleSaveCoop = async (e) => {
    e.preventDefault()
    try {
      await api.post('admin/update_coop.php', coop)
      flash(setMsgSuccess, 'Informations de la coopérative mises à jour avec succès.')
    } catch (err) {
      flash(setMsgError, err.message)
    }
  }

  // ── Rôles / admins ──────────────────────────────────────
  const [admins, setAdmins] = useState([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [nouvelAdmin, setNouvelAdmin] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'admin' })

  const chargerAdmins = () => {
    api.get('admin/list_admins.php').then(data => setAdmins(Array.isArray(data) ? data : [])).catch(() => {})
  }
  useEffect(() => { if (section === 'roles') chargerAdmins() }, [section])

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    try {
      await api.post('admin/create_admin.php', nouvelAdmin)
      flash(setMsgSuccess, 'Administrateur créé avec succès.')
      setShowAddAdmin(false)
      setNouvelAdmin({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'admin' })
      chargerAdmins()
    } catch (err) {
      flash(setMsgError, err.message)
    }
  }

  const handleDeleteAdmin = async (a) => {
    if (!confirm(`Supprimer le compte administrateur de ${a.prenom} ${a.nom} ?`)) return
    try {
      await api.del('admin/supprimer_admin.php', { id: a.id })
      flash(setMsgSuccess, 'Administrateur supprimé.')
      chargerAdmins()
    } catch (err) {
      flash(setMsgError, err.message)
    }
  }

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          <h1 className="font-display text-[26px] font-bold text-gray-900 mb-6"
              style={{ animation: 'fadeUp 0.5s ease both' }}>
            Paramètres
          </h1>

          {msgSuccess && (
            <div className="bg-capedig-vert/10 border border-capedig-vert rounded-xl
                            px-4 py-3 text-capedig-vert text-[13.5px] mb-5">✓ {msgSuccess}</div>
          )}
          {msgError && (
            <div className="bg-red-50 border border-red-300 rounded-xl
                            px-4 py-3 text-red-600 text-[13.5px] mb-5">✗ {msgError}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Colonne gauche */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-capedig-orange mx-auto mb-4
                                flex items-center justify-center text-white font-bold
                                text-[26px]">
                  {profil.nom?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <p className="font-bold text-[15px] text-gray-900">{profil.nom || 'Administrateur'} {profil.prenom}</p>
                <p className="text-[13px] text-gray-400">{user?.role || 'Admin'}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-2">
                {SECTIONS.map(s => (
                  <button key={s.id} onClick={() => setSection(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[13.5px]
                               font-medium transition-colors
                               ${section === s.id
                                 ? 'bg-capedig-orange text-white'
                                 : 'text-gray-600 hover:bg-gray-50'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {section === 'profil' && (
                <form onSubmit={handleSaveProfil} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-2">Gestion du profil</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Nom</label>
                      <input value={profil.nom || ''} onChange={e => setProfil({ ...profil, nom: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Prénom</label>
                      <input value={profil.prenom || ''} onChange={e => setProfil({ ...profil, prenom: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                      <input type="email" value={profil.email || ''} onChange={e => setProfil({ ...profil, email: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Téléphone</label>
                      <input value={profil.telephone || ''} onChange={e => setProfil({ ...profil, telephone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="btn-shine px-5 py-2.5 rounded-xl bg-capedig-orange
                      text-white text-[13.5px] font-semibold hover:bg-capedig-orange-light">
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {section === 'securite' && (
                <form onSubmit={handleSaveSecurite} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-2">Sécurité</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                      <input type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl
                        px-4 py-2.5 text-[13.5px] outline-none focus:border-capedig-orange" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Confirmer</label>
                      <input type="password" value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl
                        px-4 py-2.5 text-[13.5px] outline-none focus:border-capedig-orange" />
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-400">Minimum 8 caractères.</p>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="btn-shine px-5 py-2.5 rounded-xl bg-capedig-orange
                      text-white text-[13.5px] font-semibold hover:bg-capedig-orange-light">
                      Mettre à jour
                    </button>
                  </div>
                </form>
              )}

              {section === 'cooperative' && (
                <form onSubmit={handleSaveCoop} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-2">Informations de la coopérative</h3>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Nom de la coopérative</label>
                    <input value={coop.nom || ''} onChange={e => setCoop({ ...coop, nom: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                 outline-none focus:border-capedig-orange" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Adresse</label>
                    <input value={coop.adresse || ''} onChange={e => setCoop({ ...coop, adresse: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                 outline-none focus:border-capedig-orange" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact</label>
                      <input value={coop.contact || ''} onChange={e => setCoop({ ...coop, contact: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Numéro d'agrément</label>
                      <input value={coop.agrement || ''} onChange={e => setCoop({ ...coop, agrement: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                   outline-none focus:border-capedig-orange" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Site web</label>
                    <input value={coop.site || ''} onChange={e => setCoop({ ...coop, site: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px]
                                 outline-none focus:border-capedig-orange" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="btn-shine px-5 py-2.5 rounded-xl bg-capedig-orange
                      text-white text-[13.5px] font-semibold hover:bg-capedig-orange-light">
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {section === 'roles' && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="font-bold text-[15px] text-gray-900">Comptes administrateurs</h3>
                    <button onClick={() => setShowAddAdmin(true)}
                      className="px-4 py-2 rounded-xl bg-capedig-orange text-white
                                       text-[12.5px] font-semibold hover:bg-capedig-orange-light">
                      + Ajouter
                    </button>
                  </div>

                  {showAddAdmin && (
                    <form onSubmit={handleCreateAdmin} className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input placeholder="Nom" required value={nouvelAdmin.nom}
                        onChange={e => setNouvelAdmin({ ...nouvelAdmin, nom: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
                      <input placeholder="Prénom" value={nouvelAdmin.prenom}
                        onChange={e => setNouvelAdmin({ ...nouvelAdmin, prenom: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
                      <input type="email" placeholder="Email" required value={nouvelAdmin.email}
                        onChange={e => setNouvelAdmin({ ...nouvelAdmin, email: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
                      <input type="password" placeholder="Mot de passe (min. 8 car.)" required value={nouvelAdmin.mot_de_passe}
                        onChange={e => setNouvelAdmin({ ...nouvelAdmin, mot_de_passe: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none" />
                      <select value={nouvelAdmin.role} onChange={e => setNouvelAdmin({ ...nouvelAdmin, role: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] outline-none">
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super admin</option>
                      </select>
                      <div className="flex gap-2 sm:col-span-2 justify-end">
                        <button type="button" onClick={() => setShowAddAdmin(false)}
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600">
                          Annuler
                        </button>
                        <button type="submit"
                          className="px-4 py-2.5 rounded-xl bg-capedig-orange text-white text-[13px] font-semibold">
                          Créer
                        </button>
                      </div>
                    </form>
                  )}

                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-y border-gray-100 text-[12px] font-bold
                                     text-gray-400 uppercase tracking-wide">
                        <th className="px-6 py-3">Nom</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Rôle</th>
                        <th className="px-6 py-3">Statut</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {admins.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-5 text-center text-gray-400 text-[13px]">Aucun autre administrateur.</td></tr>
                      )}
                      {admins.map(a => (
                        <tr key={a.id}>
                          <td className="px-6 py-3.5 text-[13.5px] font-semibold text-gray-800">{a.prenom} {a.nom}</td>
                          <td className="px-6 py-3.5 text-[13.5px] text-gray-600">{a.email}</td>
                          <td className="px-6 py-3.5 text-[13.5px] text-gray-600">
                            {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`text-[11.5px] font-bold px-2.5 py-1 rounded-full
                                            ${a.statut === 'actif' ? 'bg-capedig-vert/10 text-capedig-vert' : 'bg-red-50 text-red-500'}`}>
                              {a.statut === 'actif' ? 'Actif' : 'Suspendu'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button onClick={() => handleDeleteAdmin(a)}
                              className="text-[12.5px] font-semibold text-red-500 hover:underline">
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
