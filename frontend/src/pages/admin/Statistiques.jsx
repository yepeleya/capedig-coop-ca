import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'
import { api } from '../../services/api'

const REGION_COLORS = ['#3D2314', '#D4641A', '#2D6A4F', '#A0856A', '#EDE5DB', '#9CA3AF']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-[12px] font-bold text-gray-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: p.color }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  )
}

export default function Statistiques() {
  useAuth('/login-admin', null)

  const [stats, setStats] = useState(null)
  const [inscriptions, setInscriptions] = useState([])
  const [sections, setSections] = useState([])
  const [annoncesStats, setAnnoncesStats] = useState([])
  const [activite, setActivite] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('admin/stats.php'),
      api.get('admin/inscriptions_mensuelles.php'),
      api.get('admin/stats_sections.php'),
      api.get('admin/stats_annonces.php'),
      api.get('admin/activite_recente.php'),
    ])
      .then(([s, insc, sec, ann, act]) => {
        setStats(s)
        setInscriptions(Array.isArray(insc) ? insc : [])
        setSections(Array.isArray(sec) ? sec : [])
        setAnnoncesStats(Array.isArray(ann) ? ann : [])
        setActivite(Array.isArray(act) ? act : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          <div className="mb-6" style={{ animation: 'fadeUp 0.5s ease both' }}>
            <h1 className="font-display text-[26px] font-bold text-gray-900">Statistiques</h1>
            <p className="text-gray-500 text-[14px] mt-1">
              Indicateurs clés de l'activité de la coopérative
            </p>
          </div>

          {loading && <p className="text-gray-400 text-[13.5px]">Chargement des statistiques...</p>}

          {!loading && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <p className="text-[28px] font-bold text-gray-900 font-display">
                    {stats?.total_producteurs ?? 0}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1">Total producteurs</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <p className="text-[28px] font-bold text-gray-900 font-display">
                    {stats?.en_attente ?? 0}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1">Comptes en attente</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <p className="text-[28px] font-bold text-gray-900 font-display">
                    {stats?.annonces_publiees ?? 0}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1">Annonces publiées</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <p className="text-[28px] font-bold text-gray-900 font-display">
                    {stats?.messages_non_lus ?? 0}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1">Messages non lus</p>
                </div>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-4">
                    Inscriptions des 6 derniers mois
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={inscriptions}>
                      <defs>
                        <linearGradient id="gradInsc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4641A" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#D4641A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" name="inscriptions" stroke="#D4641A"
                            strokeWidth={2.5} fill="url(#gradInsc)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-4">
                    Producteurs actifs par section
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={sections} dataKey="value" nameKey="name"
                           innerRadius={55} outerRadius={80} paddingAngle={3}>
                        {sections.map((entry, i) => (
                          <Cell key={entry.name} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {sections.map((r, i) => (
                      <div key={r.name} className="flex items-center justify-between text-[12.5px]">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span className="w-2.5 h-2.5 rounded-full"
                                style={{ background: REGION_COLORS[i % REGION_COLORS.length] }} />
                          {r.name}
                        </span>
                        <span className="font-semibold text-gray-800">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-4">
                    Annonces publiées par mois
                  </h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={annoncesStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="annonces" name="annonces" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-4">Activité récente</h3>
                  <ul className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto">
                    {activite.length === 0 && (
                      <li className="py-3 text-[13.5px] text-gray-400">Aucune activité récente.</li>
                    )}
                    {activite.map((a, i) => (
                      <li key={i} className="py-3 flex items-center justify-between gap-3">
                        <span className="text-[13.5px] text-gray-700">{a.icon} {a.text}</span>
                        <span className="text-[12px] text-gray-400 flex-shrink-0">{a.temps}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
