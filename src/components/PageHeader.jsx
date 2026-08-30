import React from 'react'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: '24px', gap: '16px', flexWrap: 'wrap'
    }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
