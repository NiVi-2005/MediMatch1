import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Lock, Save, Eye, EyeOff, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const { t, lang, changeLang } = useLanguage()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({})
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const roleInfo = {
    superadmin: { label: t('superAdmin'), color: '#6366f1', bg: '#eef2ff', grad: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
    admin: { label: t('pharmacy'), color: '#f59e0b', bg: '#fffbeb', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    user: { label: t('patient'), color: '#0d9488', bg: '#f0fdfa', grad: 'linear-gradient(135deg,#0d9488,#0f766e)' },
  }
  const ri = roleInfo[user?.role] || roleInfo.user

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', form)
      const updatedUser = res.data?.user || { ...user, ...form }
      login(updatedUser, localStorage.getItem('token'))
      toast.success(t('profileUpdated'))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSavingPw(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success(t('passwordUpdated'))
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    finally { setSavingPw(false) }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14, color: '#1e293b', fontFamily: 'Nunito, sans-serif',
    background: '#f8fafc', outline: 'none', transition: 'all .15s', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' }
  const fieldStyle = { display: 'flex', flexDirection: 'column', marginBottom: 16 }

  const TABS = [
    { key: 'profile', label: t('profileInfo'), icon: User },
    { key: 'password', label: t('changePassword'), icon: Lock },
    { key: 'language', label: t('language'), icon: Globe },
  ]

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Profile hero */}
      <div style={{
        background: 'white', borderRadius: 20, border: '1px solid #e2e8f0',
        padding: '24px 28px', marginBottom: 22,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: ri.grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 28, fontWeight: 800, flexShrink: 0,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontFamily: 'Merriweather,serif', fontSize: 22, color: '#0f172a', marginBottom: 6 }}>{user?.name || 'User'}</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: ri.bg, color: ri.color, fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 8 }}>{ri.label}</span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>📧 {user?.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 14, padding: 6, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, transition: 'all 0.15s', minWidth: 100,
              background: tab === tb.key ? ri.color : 'transparent',
              color: tab === tb.key ? 'white' : '#64748b',
              boxShadow: tab === tb.key ? `0 4px 12px ${ri.color}40` : 'none',
            }}>
            <tb.icon size={15} />{tb.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <div style={fieldStyle}>
              <label style={labelStyle}><User size={13} style={{ display: 'inline', marginRight: 6 }} />{t('fullName')}</label>
              <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Full name"
                onFocus={e => e.target.style.borderColor = ri.color}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}><Mail size={13} style={{ display: 'inline', marginRight: 6 }} />{t('emailAddress')}</label>
              <input style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8' }} value={form.email} disabled />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}><Phone size={13} style={{ display: 'inline', marginRight: 6 }} />{t('phone')}</label>
                <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210"
                  onFocus={e => e.target.style.borderColor = ri.color}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}><MapPin size={13} style={{ display: 'inline', marginRight: 6 }} />{t('address')}</label>
                <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="Your address"
                  onFocus={e => e.target.style.borderColor = ri.color}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              style={{ width: '100%', marginTop: 8, padding: '13px', border: 'none', borderRadius: 12, background: ri.grad, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
              <Save size={17} /> {saving ? 'Saving...' : t('updateProfile')}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handleChangePassword}>
            {[
              { key: 'currentPassword', label: t('currentPassword') },
              { key: 'newPassword', label: t('newPassword') },
              { key: 'confirmPassword', label: t('confirmPassword') },
            ].map(field => (
              <div key={field.key} style={fieldStyle}>
                <label style={labelStyle}><Lock size={13} style={{ display: 'inline', marginRight: 6 }} />{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw[field.key] ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 44 }}
                    value={pwForm[field.key]} onChange={setPw(field.key)} placeholder="••••••••"
                    onFocus={e => e.target.style.borderColor = ri.color}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {showPw[field.key] ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={savingPw}
              style={{ width: '100%', marginTop: 8, padding: '13px', border: 'none', borderRadius: 12, background: ri.grad, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Lock size={17} /> {savingPw ? 'Updating...' : t('updatePassword')}
            </button>
          </form>
        )}

        {tab === 'language' && (
          <div>
            <h3 style={{ fontFamily: 'Merriweather,serif', fontSize: 18, color: '#0f172a', marginBottom: 6 }}>{t('language')}</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Choose your preferred language for the app interface</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px', borderRadius: 14, border: `2px solid ${lang === l.code ? ri.color : '#e2e8f0'}`,
                    background: lang === l.code ? ri.bg : 'white', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    boxShadow: lang === l.code ? `0 4px 14px ${ri.color}20` : 'none',
                  }}>
                  <span style={{ fontSize: 32 }}>{l.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: lang === l.code ? ri.color : '#1e293b' }}>{l.nativeLabel}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{l.label}</div>
                  </div>
                  {lang === l.code && (
                    <div style={{ width: 24, height: 24, background: ri.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800 }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@media(max-width:600px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
