import React from 'react'

const colorMap = {
  green:  { bg: '#dcfce7', color: '#16a34a' },
  red:    { bg: '#fee2e2', color: '#dc2626' },
  yellow: { bg: '#fef3c7', color: '#d97706' },
  blue:   { bg: '#dbeafe', color: '#2563eb' },
  gray:   { bg: '#f1f5f9', color: '#64748b' },
  orange: { bg: '#ffedd5', color: '#ea580c' },
  purple: { bg: '#ede9fe', color: '#7c3aed' },
  teal:   { bg: '#ccfbf1', color: '#0d9488' },
}

export function statusColor(status) {
  const s = status?.toLowerCase()
  if (!s) return 'gray'
  if (['active', 'success', 'completed', 'in stock'].includes(s)) return 'green'
  if (['inactive', 'rejected', 'cancelled', 'failed'].includes(s)) return 'red'
  if (['pending'].includes(s)) return 'yellow'
  if (['confirmed', 'processing'].includes(s)) return 'blue'
  if (['low stock'].includes(s)) return 'orange'
  if (['required'].includes(s)) return 'orange'
  return 'gray'
}

export default function Badge({ label, color = 'gray', icon: Icon }) {
  const c = colorMap[color] || colorMap.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.color,
    }}>
      {Icon && <Icon size={11} />}
      {label}
    </span>
  )
}
