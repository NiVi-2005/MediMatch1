import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, AlertTriangle, Package, ClipboardList } from 'lucide-react'

export default function NotificationBell({ alerts = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (alerts.length === 0) return null

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#fff7ed', border: '1.5px solid #fed7aa',
          borderRadius: 10, width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#d97706', position: 'relative',
          transition: 'background .15s',
        }}
      >
        <Bell size={18} />
        <span style={{
          position: 'absolute', top: -5, right: -5,
          background: '#ef4444', color: 'white',
          fontSize: 10, fontWeight: 800,
          borderRadius: '50%', width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid white',
        }}>
          {alerts.length > 9 ? '9+' : alerts.length}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: '0 10px 40px rgba(0,0,0,.12)',
          width: 300, zIndex: 1000,
          animation: 'slideDown .2s ease',
        }}>
          <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Alerts ({alerts.length})</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 2 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {alerts.map((a, i) => (
              <div key={i} style={{
                padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <AlertTriangle size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
