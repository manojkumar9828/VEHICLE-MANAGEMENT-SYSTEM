import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../api'
import StatusBadge from '../components/StatusBadge'
import { Users, Car, Wrench, ClipboardList, Clock, Star, Bell, TrendingUp, ArrowRight } from 'lucide-react'

// Gradient stat card — full colour background
function StatCard({ icon: Icon, label, value, sub, gradient, iconBg }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 14,
      padding: '22px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      position: 'relative',
      overflow: 'hidden',
      color: '#fff'
    }}>
      {/* decorative circle */}
      <div style={{
        position: 'absolute', right: -18, top: -18,
        width: 90, height: 90, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)'
      }} />
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: iconBg || 'rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#fff'
      }}>
        <Icon size={21} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 4, fontWeight: 500, letterSpacing: '0.02em' }}>{label}</p>
        <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: '#fff' }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize: 12, opacity: 0.8, marginTop: 5 }}>{sub}</p>}
      </div>
    </div>
  )
}

// Status row with coloured progress bar
function StatusRow({ status, count, total, colors }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <StatusBadge status={status} />
        <span style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>{count}</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${pct}%`,
          background: colors.bar,
          transition: 'width 0.6s ease'
        }} />
      </div>
    </div>
  )
}

const STAT_CARDS = [
  {
    key: 'customers',
    label: 'Total Customers',
    icon: Users,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'vehicles',
    label: 'Registered Vehicles',
    icon: Car,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    key: 'technicians',
    label: 'Technicians',
    icon: Wrench,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    key: 'requests',
    label: 'Total Requests',
    icon: ClipboardList,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    key: 'sla',
    label: 'SLA Breached',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    key: 'rating',
    label: 'Avg Rating',
    icon: Star,
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  {
    key: 'notifications',
    label: 'Unread Notifications',
    icon: Bell,
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #0fd850 0%, #f9f047 100%)',
  },
]

const STATUS_COLORS = {
  submitted:        { bar: '#3b82f6', text: '#2563eb' },
  inspecting:       { bar: '#f59e0b', text: '#d97706' },
  estimate_pending: { bar: '#f97316', text: '#ea580c' },
  in_progress:      { bar: '#8b5cf6', text: '#7c3aed' },
  completed:        { bar: '#10b981', text: '#059669' },
  cancelled:        { bar: '#94a3b8', text: '#64748b' },
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboardStats()
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading dashboard...</p>
    </div>
  )

  if (!stats) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
      <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Failed to load dashboard.</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Make sure the backend is running on port 5000.</p>
    </div>
  )

  const sr = stats.service_requests || {}
  const totalSR = sr.total || 0

  const cardValues = {
    customers:     stats.customers,
    vehicles:      stats.vehicles,
    technicians:   stats.technicians?.total,
    requests:      totalSR,
    sla:           stats.sla?.breached || 0,
    rating:        stats.avg_rating ? `${stats.avg_rating}/5` : 'N/A',
    notifications: stats.unread_notifications || 0,
    completed:     sr.completed || 0,
  }

  const cardSubs = {
    technicians: `${stats.technicians?.available ?? 0} available`,
    requests:    `${sr.in_progress || 0} in progress`,
    sla:         `${stats.sla?.at_risk || 0} at risk`,
    rating:      'from all reviews',
    completed:   `${sr.submitted || 0} new pending`,
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 28,
        color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -40, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🚗 Vehicle Service Dashboard</h1>
        <p style={{ opacity: 0.8, fontSize: 14 }}>Real-time overview of your service management operations</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={cardValues[card.key]}
            sub={cardSubs[card.key]}
            gradient={card.gradient}
          />
        ))}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Service Request Breakdown */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={17} color="#fff" />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Service Request Breakdown</h2>
          </div>
          {[
            ['submitted', sr.submitted || 0],
            ['inspecting', sr.inspecting || 0],
            ['estimate_pending', sr.estimate_pending || 0],
            ['in_progress', sr.in_progress || 0],
            ['completed', sr.completed || 0],
            ['cancelled', sr.cancelled || 0],
          ].map(([status, count]) => (
            <StatusRow
              key={status}
              status={status}
              count={count}
              total={totalSR}
              colors={STATUS_COLORS[status] || { bar: '#94a3b8', text: '#64748b' }}
            />
          ))}
        </div>

        {/* Recent Requests */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 24,
          border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f093fb,#f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={17} color="#fff" />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Service Requests</h2>
          </div>

          {(stats.recent_requests || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
              <p style={{ fontSize: 13 }}>No service requests yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(stats.recent_requests || []).map((req, i) => {
                const gradients = [
                  'linear-gradient(90deg,#667eea22,#764ba211)',
                  'linear-gradient(90deg,#f093fb22,#f5576c11)',
                  'linear-gradient(90deg,#4facfe22,#00f2fe11)',
                  'linear-gradient(90deg,#43e97b22,#38f9d711)',
                  'linear-gradient(90deg,#f6d36522,#fda08511)',
                ]
                return (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/service-requests/${req.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      background: gradients[i % gradients.length],
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{req.service_type}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                        {req.customer_name} · {req.year} {req.make} {req.model}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusBadge status={req.status} />
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
