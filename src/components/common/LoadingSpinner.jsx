import React from 'react'

export default function LoadingSpinner({ text = 'Loading...', fullPage = false }) {
  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid #e2e8f0',
        borderTopColor: '#0d9488',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ color: '#64748b', fontSize: 15, fontWeight: 600 }}>{text}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', zIndex: 9999,
      }}>
        {inner}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      {inner}
    </div>
  )
}
