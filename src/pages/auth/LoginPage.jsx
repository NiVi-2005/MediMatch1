import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Pill, ShieldCheck, Building2, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../../components/common/LanguageSwitcher'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'user' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const roles = [
    { value: 'user', labelKey: 'patient', icon: User, color: '#0d9488' },
    { value: 'admin', labelKey: 'pharmacy', icon: Building2, color: '#f59e0b' },
    { value: 'superadmin', labelKey: 'superAdmin', icon: ShieldCheck, color: '#6366f1' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error(t('fillAllFields'))
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password, role: form.role })
      const { token, user } = res.data
      login(user, token)
      toast.success(`${t('welcomeBack')}, ${user.name || user.email}!`)
      if (user.role === 'superadmin') navigate('/superadmin')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/user')
    } catch (err) {
      toast.error(err.response?.data?.message || t('loginFailed'))
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.topBar}>
          <LanguageSwitcher />
        </div>
        <div className={styles.brandArea}>
          <div className={styles.logo}><Pill size={32} /></div>
          <h1 className={styles.brandName}>{t('appName')}</h1>
          <p className={styles.brandTagline}>{t('tagline')}</p>
        </div>
        <div className={styles.features}>
          {(t('features') || []).map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <div className={styles.featureDot} />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className={styles.leftDecor} />
      </div>

      <div className={styles.authRight}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileLogo}><Pill size={22} /></div>
          <span className={styles.mobileAppName}>{t('appName')}</span>
          <div style={{ marginLeft: 'auto' }}><LanguageSwitcher compact /></div>
        </div>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2>{t('welcomeBack')}</h2>
            <p>{t('signIn')}</p>
          </div>

          <div className={styles.roleSelector}>
            {roles.map(r => (
              <button
                key={r.value} type="button"
                className={`${styles.roleBtn} ${form.role === r.value ? styles.roleActive : ''}`}
                style={form.role === r.value ? { borderColor: r.color, color: r.color, background: r.color + '12' } : {}}
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
              >
                <r.icon size={17} />
                <span>{t(r.labelKey)}</span>
              </button>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>{t('emailAddress')}</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={styles.input} />
            </div>
            <div className={styles.field}>
              <label>{t('password')}</label>
              <div className={styles.inputWrap}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={styles.input} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? t('signingIn') : t('signInBtn')}
            </button>
          </form>

          <p className={styles.switchLink}>
            {t('noAccount')} <Link to="/register">{t('createOne')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
