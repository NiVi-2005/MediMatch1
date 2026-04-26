import React from 'react'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 28,
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: 26, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>
          {title}
        </h1>
        {subtitle && <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
