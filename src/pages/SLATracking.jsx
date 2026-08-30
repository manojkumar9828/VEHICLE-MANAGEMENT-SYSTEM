import React, { useEffect, useState } from 'react'
import { getSLAs, getSLAStats } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import StatusBadge from '../components/StatusBadge'
import { Clock, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react'

function SLAStatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <Card style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon size={18} /></div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700 }}>{value}</p>
      </div>
    </Card>
  )
}

function TimeRemaining({ due_time, status }) {
  const now = new Date()
  const due = new Date(due_time)
  const diff = due - now
  const absDiff = Math.abs(diff)
  const hours = Math.floor(absDiff / 3600000)
  const mins = Math.floor((absDiff % 3600000) / 60000)
  const color = status === 'breached' ? 'var(--danger)' : status === 'at_risk' ? 'var(--warning)' : status === 'met' ? 'var(--success)' : 'var(--text)'
  return (
    <span style={{ fontWeight: 600, fontSize: 13, color }}>
      {status === 'met' ? 'Met' : diff < 0 ? `Overdue by ${hours}h ${mins}m` : `${hours}h ${mins}m left`}
    </span>
  )
}

export default function SLATracking() {
  const [slas, setSlas] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = () => Promise.all([getSLAs(), getSLAStats()]).then(([s, st]) => { setSlas(s.data); setStats(st.data); setLoading(false) })
  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv) }, [])

  const filtered = filter ? slas.filter(s => s.status === filter) : slas

  const slaRate = stats && stats.total > 0 ? Math.round(((stats.met || 0) / stats.total) * 100) : 0

  const columns = [
    { key: 'service_type', label: 'Service', render: (v) => <strong>{v}</strong> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'make', label: 'Vehicle', render: (_, r) => `${r.year} ${r.make} ${r.model}` },
    { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
    { key: 'sla_type', label: 'SLA Type' },
    { key: 'target_hours', label: 'Target', render: (v) => `${v}h` },
    { key: 'start_time', label: 'Started', render: (v) => new Date(v).toLocaleString() },
    { key: 'due_time', label: 'Due', render: (v) => new Date(v).toLocaleString() },
    { key: 'due_time', label: 'Time Remaining', render: (v, r) => <TimeRemaining due_time={v} status={r.status} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader title="SLA Tracking" subtitle="Monitor service level agreement compliance in real time" />

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          <SLAStatCard icon={Activity} label="Total SLAs" value={stats.total || 0} color="#2563eb" bg="#eff6ff" />
          <SLAStatCard icon={Clock} label="Active" value={stats.active || 0} color="#2563eb" bg="#eff6ff" />
          <SLAStatCard icon={AlertTriangle} label="At Risk" value={stats.at_risk || 0} color="#d97706" bg="#fefce8" />
          <SLAStatCard icon={XCircle} label="Breached" value={stats.breached || 0} color="#dc2626" bg="#fef2f2" />
          <SLAStatCard icon={CheckCircle} label="Met" value={stats.met || 0} color="#16a34a" bg="#f0fdf4" />
          <Card style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>%</div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>SLA Rate</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: slaRate >= 90 ? 'var(--success)' : slaRate >= 70 ? 'var(--warning)' : 'var(--danger)' }}>{slaRate}%</p>
            </div>
          </Card>
        </div>
      )}

      <Card style={{ marginBottom: 12, padding: '10px 16px', display: 'flex', gap: 8 }}>
        {['', 'active', 'at_risk', 'breached', 'met'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 12, background: filter === s ? 'var(--primary)' : '#f1f5f9', color: filter === s ? '#fff' : 'var(--text)' }}>
            {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </Card>

      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={filtered} emptyMessage="No SLA records found." />}
      </Card>
    </div>
  )
}
