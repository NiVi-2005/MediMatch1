import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Pill, User, Building2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../../components/common/LanguageSwitcher'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user', phone: '', address: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  const navigate = useNavigate()

  const roles = [
    { value: 'user', labelKey: 'patient', icon: User, color: '#0d9488' },
    { value: 'admin', labelKey: 'pharmacy', icon: Building2, color: '#f59e0b' },
  ]

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error(t('fillAllFields'))
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone, address: form.address })
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.topBar}><LanguageSwitcher /></div>
        <div className={styles.brandArea}>
          <div className={styles.logo}><Pill size={32} /></div>
          <h1 className={styles.brandName}>{t('appName')}</h1>
          <p className={styles.brandTagline}>Join thousands of patients and pharmacies already on {t('appName')}.</p>
        </div>
        <div className={styles.features}>
          {['Simple & secure registration', 'Instant access after approval', 'Manage medicines & prescriptions', 'Real-time reservation tracking'].map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <div className={styles.featureDot} /><span>{f}</span>
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
            <h2>{t('createAccount')}</h2>
            <p>Join {t('appName')} today</p>
          </div>

          <div className={styles.roleSelector}>
            {roles.map(r => (
              <button key={r.value} type="button"
                className={`${styles.roleBtn} ${form.role === r.value ? styles.roleActive : ''}`}
                style={form.role === r.value ? { borderColor: r.color, color: r.color, background: r.color + '12' } : {}}
                onClick={() => setForm(f => ({ ...f, role: r.value }))}>
                <r.icon size={17} /><span>{t(r.labelKey)}</span>
              </button>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label>{t('fullName')} *</label>
                <input className={styles.input} placeholder="John Doe" value={form.name} onChange={set('name')} />
              </div>
              <div className={styles.field}>
                <label>{t('phone')}</label>
                <input className={styles.input} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className={styles.field}>
              <label>{t('emailAddress')} *</label>
              <input type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            {form.role === 'admin' && (
              <div className={styles.field}>
                <label>{t('address')}</label>
                <input className={styles.input} placeholder="123 Main Street, City" value={form.address} onChange={set('address')} />
              </div>
            )}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label>{t('password')} *</label>
                <div className={styles.inputWrap}>
                  <input type={showPw ? 'text' : 'password'} className={styles.input} placeholder="Min. 6 chars" value={form.password} onChange={set('password')} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(s => !s)}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label>{t('confirmPassword')} *</label>
                <input type="password" className={styles.input} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Creating account...' : t('createAccount')}
            </button>
          </form>

          <p className={styles.switchLink}>
            {t('alreadyHaveAccount')} <Link to="/login">{t('signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
