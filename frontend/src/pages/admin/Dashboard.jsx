import { useEffect, useRef, useState } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

const REGION_COLORS = ['#3D2314', '#D4641A', '#EDE5DB', '#A0856A', '#8B5E34']

function tempsEcoule(dateStr) {
  if (!dateStr) return ''
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime())
  const min  = Math.round(diff / 60000)
  if (min < 1)  return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24)   return `il y a ${h} h`
  const j = Math.round(h / 24)
  if (j < 7)    return `il y a ${j} j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-[12px] font-bold text-gray-700">{label}</p>
      <p className="text-[12px] text-capedig-orange font-semibold">
        {payload[0].value} inscriptions
      </p>
    </div>
  )
}

function useCounter(target, trigger) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = null
    const duration = 1200
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [trigger, target])
  return value
}

function StatCard({ label, value, suffix = '', icon, color }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const count = useCounter(value, visible)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-gray-200 p-6
                              card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
             style={{ background: `${color}1A`, color }}>
          {icon}
        </div>
      </div>
      <p className="text-[28px] font-bold text-gray-900 font-display">
        {count}{suffix}
      </p>
      <p className="text-[13px] text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function DashboardAdmin() {
  useAuth('/login-admin', null)
  const { token } = useAuthContext()

  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/stats.php', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [token])

  const inscriptions = stats?.inscriptions || []
  const regions       = stats?.regions || []
  const activites      = stats?.activites || []

  return (
    <div className="min-h-screen bg-capedig-beige">
      <AdminSidebar />
      <div className="ml-[240px]">
        <AdminHeader />

        <main className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8"
               style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h1 className="font-display text-[26px] font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-500 text-[14px] mt-1">
                Vue d'ensemble de l'activité de la coopérative
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2.5 rounded-xl border border-gray-200
                                 text-[13.5px] font-semibold text-gray-600
                                 hover:bg-gray-50 transition-colors">
                Derniers 30 jours
              </button>
              <button className="btn-shine px-4 py-2.5 rounded-xl bg-capedig-orange
                                 text-white text-[13.5px] font-semibold
                                 hover:bg-capedig-orange-light transition-colors">
                + Nouveau Rapport
              </button>
            </div>
          </div>

          {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
                 style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
              <StatCard label="Total Producteurs" value={stats?.total_producteurs || 0} color="#D4641A"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
              <StatCard label="Comptes en attente" value={stats?.en_attente || 0} color="#3D2314"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Annonces publiées" value={stats?.annonces_publiees || 0} color="#2D6A4F"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>} />
              <StatCard label="Messages non lus" value={stats?.messages_non_lus || 0} color="#D4641A"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
            </div>
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
               style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-[15px] text-gray-900 mb-4">
                Évolution des inscriptions
              </h3>
              {loading ? (
                <div className="h-[280px] skeleton rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={inscriptions}>
                    <defs>
                      <linearGradient id="gradInscriptions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4641A" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#D4641A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }}
                           axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }}
                           axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" stroke="#D4641A"
                          strokeWidth={2.5} fill="url(#gradInscriptions)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-[15px] text-gray-900 mb-4">
                Distribution par région
              </h3>
              {loading ? (
                <div className="h-[220px] skeleton rounded-xl" />
              ) : regions.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-[13px]">
                  Aucun producteur enregistré.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={regions} dataKey="value" nameKey="name"
                           innerRadius={55} outerRadius={80} paddingAngle={3}>
                        {regions.map((entry, i) => (
                          <Cell key={entry.name} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {regions.map((r, i) => (
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
                </>
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 card-hover"
               style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
            <h3 className="font-bold text-[15px] text-gray-900 mb-4">
              Activité récente
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-5 skeleton rounded" />)}
              </div>
            ) : activites.length === 0 ? (
              <p className="text-gray-400 text-[13.5px] py-4 text-center">
                Aucune activité récente.
              </p>
            ) : (
            <ul className="divide-y divide-gray-100">
              {activites.map((a, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <span className="text-[13.5px] text-gray-700">{a.texte}</span>
                  <span className="text-[12px] text-gray-400">{tempsEcoule(a.created_at)}</span>
                </li>
              ))}
            </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
