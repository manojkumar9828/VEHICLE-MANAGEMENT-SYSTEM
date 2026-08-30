import React from 'react'

const STATUS_STYLES = {
  // Service request statuses
  submitted:         { bg: '#eff6ff', color: '#2563eb', label: 'Submitted' },
  inspecting:        { bg: '#fefce8', color: '#d97706', label: 'Inspecting' },
  estimate_pending:  { bg: '#fff7ed', color: '#ea580c', label: 'Estimate Pending' },
  estimate_approved: { bg: '#f0fdf4', color: '#16a34a', label: 'Estimate Approved' },
  estimate_rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Estimate Rejected' },
  in_progress:       { bg: '#faf5ff', color: '#7c3aed', label: 'In Progress' },
  completed:         { bg: '#f0fdf4', color: '#15803d', label: 'Completed' },
  cancelled:         { bg: '#f8fafc', color: '#64748b', label: 'Cancelled' },
  // Technician statuses
  available:         { bg: '#f0fdf4', color: '#16a34a', label: 'Available' },
  busy:              { bg: '#fff7ed', color: '#ea580c', label: 'Busy' },
  off_duty:          { bg: '#f8fafc', color: '#64748b', label: 'Off Duty' },
  // SLA statuses
  active:            { bg: '#eff6ff', color: '#2563eb', label: 'Active' },
  at_risk:           { bg: '#fefce8', color: '#d97706', label: 'At Risk' },
  breached:          { bg: '#fef2f2', color: '#dc2626', label: 'Breached' },
  met:               { bg: '#f0fdf4', color: '#16a34a', label: 'Met' },
  // Estimate statuses
  pending:           { bg: '#fefce8', color: '#d97706', label: 'Pending' },
  approved:          { bg: '#f0fdf4', color: '#16a34a', label: 'Approved' },
  rejected:          { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
  // Priority
  low:               { bg: '#f8fafc', color: '#64748b', label: 'Low' },
  normal:            { bg: '#eff6ff', color: '#2563eb', label: 'Normal' },
  high:              { bg: '#fff7ed', color: '#ea580c', label: 'High' },
  urgent:            { bg: '#fef2f2', color: '#dc2626', label: 'Urgent' },
  // Condition
  good:              { bg: '#f0fdf4', color: '#16a34a', label: 'Good' },
  fair:              { bg: '#fefce8', color: '#d97706', label: 'Fair' },
  poor:              { bg: '#fff7ed', color: '#ea580c', label: 'Poor' },
  critical:          { bg: '#fef2f2', color: '#dc2626', label: 'Critical' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || { bg: '#f8fafc', color: '#64748b', label: status }
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '20px',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {style.label}
    </span>
  )
}
