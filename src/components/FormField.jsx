import React from 'react'

export default function FormField({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {error && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

export function Input({ style = {}, ...props }) {
  return (
    <input
      style={{
        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
        borderRadius: '6px', fontSize: '14px', outline: 'none',
        transition: 'border-color 0.15s', background: '#fff',
        ...style
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  )
}

export function Select({ children, style = {}, ...props }) {
  return (
    <select
      style={{
        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
        borderRadius: '6px', fontSize: '14px', outline: 'none',
        background: '#fff', cursor: 'pointer', ...style
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ style = {}, ...props }) {
  return (
    <textarea
      style={{
        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
        borderRadius: '6px', fontSize: '14px', outline: 'none',
        resize: 'vertical', minHeight: '80px', ...style
      }}
      onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}
    />
  )
}
