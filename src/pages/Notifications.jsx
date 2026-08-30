import React, { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Btn from '../components/Btn'
import { Bell, CheckCheck, BellOff } from 'lucide-react'

const TYPE_ICONS = {
  request_submitted: { icon: '📋', color: '#2563eb', bg: '#eff6ff' },
  estimate_ready: { icon: '💰', color: '#d97706', bg: '#fefce8' },
  service_completed: { icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
  default: { icon: '🔔', color: '#7c3aed', bg: '#faf5ff' }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => getNotifications().then(r => { setNotifications(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
  }

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.is_read).map(n => markNotificationRead(n.id)))
    load()
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notifications`}
        action={unread > 0 && <Btn variant="secondary" onClick={markAllRead}><CheckCheck size={14} /> Mark All Read</Btn>}
      />
      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <BellOff size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => {
              const style = TYPE_ICONS[n.type] || TYPE_ICONS.default
              return (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                  borderBottom: '1px solid var(--border)', background: n.is_read ? '#fff' : '#fafeff',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {n.customer_name} · {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                          <Btn size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark Read</Btn>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
