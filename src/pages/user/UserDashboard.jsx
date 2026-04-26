import React, { useEffect, useState } from 'react'
import { ClipboardList, Search, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { reservationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './User.module.css'

function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className={styles.statCard} style={{ '--card-color': color, '--card-gradient': gradient || color }}>
      <div className={styles.statIcon} style={{ background: `${color}18` }}>
        <Icon size={22} color={color} />
      </div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function UserDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reservationAPI.getMyReservations()
      .then(res => setReservations(res.data?.reservations || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending = reservations.filter(r => ['pending', 'confirmed'].includes(r.status?.toLowerCase())).length
  const completed = reservations.filter(r => ['success', 'completed'].includes(r.status?.toLowerCase())).length

  const getBadgeCls = (s) => {
    const map = { pending: styles.badgeYellow, confirmed: styles.badgeBlue, success: styles.badgeGreen, completed: styles.badgeGreen, rejected: styles.badgeRed, cancelled: styles.badgeGray }
    return map[s?.toLowerCase()] || styles.badgeGray
  }

  const getStatusLabel = (s) => {
    const map = { pending: t('pending'), confirmed: t('confirmed'), success: t('success'), completed: t('success'), rejected: t('rejected'), cancelled: t('cancelled') }
    return map[s?.toLowerCase()] || s
  }

  return (
    <div className="page-enter">
      {/* Welcome header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeText}>
          <h1>{t('hello')}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p>{t('findMedicines')}</p>
        </div>
        <div className={styles.welcomeDecor}>💊</div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard icon={ClipboardList} label={t('totalReservations')} value={loading ? '—' : reservations.length} color="#0d9488" />
        <StatCard icon={Clock} label={t('activeReservations')} value={loading ? '—' : pending} color="#f59e0b" />
        <StatCard icon={CheckCircle} label={t('completed')} value={loading ? '—' : completed} color="#22c55e" />
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link to="/user/search" style={{ textDecoration: 'none' }}>
          <div className={`${styles.actionCard} ${styles.actionCardTeal}`}>
            <Search size={28} className={styles.actionIcon} />
            <div className={styles.actionTitle}>{t('searchMedicines')}</div>
            <div className={styles.actionSub}>{t('findMedicines')}</div>
            <ArrowRight size={18} className={styles.actionArrow} />
          </div>
        </Link>
        <Link to="/user/reservations" style={{ textDecoration: 'none' }}>
          <div className={`${styles.actionCard} ${styles.actionCardIndigo}`}>
            <ClipboardList size={28} className={styles.actionIcon} />
            <div className={styles.actionTitle}>{t('myReservations')}</div>
            <div className={styles.actionSub}>View & track your medicine orders</div>
            <ArrowRight size={18} className={styles.actionArrow} />
          </div>
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className={styles.recentCard}>
        <div className={styles.recentHeader}>
          <div className={styles.recentTitle}>
            <ClipboardList size={18} color="#0d9488" />
            {t('recentReservations')}
          </div>
          <Link to="/user/reservations" className={styles.seeAllLink}>
            {t('view')} all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingRows}>
            {[1,2,3].map(i => <div key={i} className={styles.shimmerRow} />)}
          </div>
        ) : reservations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>{t('noReservations')}</p>
            <Link to="/user/search">
              <button className={styles.emptyBtn}>
                <Search size={15} /> {t('searchMedicines')}
              </button>
            </Link>
          </div>
        ) : (
          <div className={styles.reservationList}>
            {reservations.slice(0, 5).map((r, i) => (
              <div key={i} className={styles.reservationRow}>
                <div className={styles.reservationInfo}>
                  <div className={styles.reservationMed}>{r.medicineName || r.medicine?.name}</div>
                  <div className={styles.reservationMeta}>
                    🏥 {r.pharmacyName || r.pharmacy?.name}
                    {r.createdAt && <> · {new Date(r.createdAt).toLocaleDateString('en-IN')}</>}
                  </div>
                </div>
                <span className={`${styles.badge} ${getBadgeCls(r.status)}`}>
                  {getStatusLabel(r.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
