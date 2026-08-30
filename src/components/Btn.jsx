import React from 'react'

const VARIANTS = {
  primary:   { background: 'var(--primary)', color: '#fff', border: 'none' },
  secondary: { background: '#f1f5f9', color: 'var(--text)', border: '1px solid var(--border)' },
  success:   { background: 'var(--success)', color: '#fff', border: 'none' },
  danger:    { background: 'var(--danger)', color: '#fff', border: 'none' },
  warning:   { background: 'var(--warning)', color: '#fff', border: 'none' },
  ghost:     { background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' },
}

export default function Btn({ variant = 'primary', size = 'md', children, style = {}, disabled, ...props }) {
  const vs = VARIANTS[variant] || VARIANTS.primary
  const padding = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px'
  const fontSize = size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px'

  return (
    <button
      style={{
        ...vs,
        padding,
        fontSize,
        fontWeight: 500,
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'opacity 0.15s',
        opacity: disabled ? 0.6 : 1,
        whiteSpace: 'nowrap',
        ...style
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
