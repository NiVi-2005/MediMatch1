import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 32px', textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 72, height: 72, background: '#f1f5f9', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, color: '#94a3b8',
        }}>
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>{description}</p>}
      {action}
    </div>
  )
}
