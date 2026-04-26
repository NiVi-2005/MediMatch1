import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import NotificationBell from './NotificationBell'

export default function TopBar({ title, alerts = [] }) {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const now = new Date()
  const locale = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN'
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })

  const roleGrad = {
    superadmin: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    admin: 'linear-gradient(135deg,#f59e0b,#d97706)',
    user: 'linear-gradient(135deg,#0d9488,#0f766e)',
  }[user?.role] || 'linear-gradient(135deg,#0d9488,#0f766e)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid #f1f5f9', marginBottom: 28,
    }}>
      <div style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        📅 {dateStr}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NotificationBell alerts={alerts} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 12px', background: '#f8fafc',
          borderRadius: 12, border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: roleGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ display: 'none' }} className="topbar-name">
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
