import React, { useEffect, useState } from 'react'
import { getFeedback } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import { Star } from 'lucide-react'

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#cbd5e1'} />)}
    </div>
  )
}

export default function Feedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getFeedback().then(r => { setFeedback(r.data); setLoading(false) }) }, [])

  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : null
  const dist = [5,4,3,2,1].map(r => ({ rating: r, count: feedback.filter(f => f.rating === r).length }))

  const columns = [
    { key: 'customer_name', label: 'Customer', render: (v) => <strong>{v}</strong> },
    { key: 'service_type', label: 'Service' },
    { key: 'make', label: 'Vehicle', render: (_, r) => `${r.make} ${r.model}` },
    { key: 'rating', label: 'Rating', render: (v) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars rating={v} /><span style={{ fontWeight: 600 }}>{v}/5</span></div> },
    { key: 'comments', label: 'Comments', render: (v) => v ? <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div>
      <PageHeader title="Customer Feedback" subtitle={`${feedback.length} reviews collected`} />

      {feedback.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 20 }}>
          <Card style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Average Rating</p>
            <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{avgRating}</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}><Stars rating={Math.round(avgRating)} /></div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{feedback.length} reviews</p>
          </Card>
          <Card style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Rating Distribution</p>
            {dist.map(({ rating, count }) => (
              <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 2, width: 80 }}><Stars rating={rating} /></div>
                <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#f59e0b', borderRadius: 4, width: feedback.length > 0 ? `${(count / feedback.length) * 100}%` : '0%', transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>{count}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={feedback} emptyMessage="No feedback submitted yet." />}
      </Card>
    </div>
  )
}
