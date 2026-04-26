import React, { useEffect, useState } from 'react'
import { Package, ClipboardList, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { inventoryAPI, reservationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './Admin.module.css'

function KPICard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={styles.kpiCard} style={{ '--kc': color }}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIcon} style={{ background: color + '18' }}>
          <Icon size={22} color={color} />
        </div>
        <div className={styles.kpiValue} style={{ color }}>{value}</div>
      </div>
      <div className={styles.kpiLabel}>{label}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({ inventory: 0, reservations: 0, lowStock: 0 })
  const [lowStockItems, setLowStockItems] = useState([])
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([inventoryAPI.getAll(), reservationAPI.getAll(), inventoryAPI.getLowStock()])
      .then(([inv, res, low]) => {
        const inventory = inv.value?.data?.inventory || inv.value?.data || []
        const reservations = res.value?.data?.reservations || res.value?.data || []
        const lowStock = low.value?.data?.items || low.value?.data || []
        setStats({ inventory: inventory.length, reservations: reservations.length, lowStock: lowStock.length })
        setLowStockItems(lowStock.slice(0, 5))
        setRecentReservations(reservations.slice(0, 5))
      }).finally(() => setLoading(false))
  }, [])

  const statusBadge = (s) => {
    const map = { pending: styles.badgeYellow, success: styles.badgeGreen, completed: styles.badgeGreen, rejected: styles.badgeRed, cancelled: styles.badgeRed }
    const cls = map[s?.toLowerCase()] || styles.badgeGray
    const label = { pending: t('pending'), confirmed: t('confirmed'), success: t('success'), completed: t('success'), rejected: t('rejected'), cancelled: t('cancelled') }
    return <span className={`${styles.badge} ${cls}`}>{label[s?.toLowerCase()] || s}</span>
  }

  return (
    <div className="page-enter">
      {/* Hero header */}
      <div className={styles.dashHero}>
        <div>
          <h1>{t('pharmacyDashboard')}</h1>
          <p>{t('welcomeBack2')}, <strong>{user?.name || 'Admin'}</strong> — {t('pharmacyOverview')}</p>
        </div>
        <div className={styles.dashHeroIcon}>🏥</div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className={styles.alertBanner}>
          <AlertTriangle size={20} className={styles.alertBannerIcon} />
          <div>
            <div className={styles.alertBannerTitle}>{t('lowStockAlert')}</div>
            <div className={styles.alertBannerList}>
              {lowStockItems.map((i, idx) => (
                <span key={idx} className={styles.alertChip}>
                  {i.medicineName || i.name} — {i.quantity} left
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        <KPICard icon={Package} label={t('totalInventory')} value={loading ? '—' : stats.inventory} color="#f59e0b" />
        <KPICard icon={ClipboardList} label={t('totalReservations')} value={loading ? '—' : stats.reservations} color="#0d9488" />
        <KPICard icon={AlertTriangle} label={t('lowStock')} value={loading ? '—' : stats.lowStock} color="#ef4444" />
        <KPICard icon={TrendingUp} label={t('activeToday')} value="Live" color="#6366f1" sub={t('realtimeData')} />
      </div>

      {/* Two-column panels */}
      <div className={styles.twoPanel}>
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}><AlertTriangle size={16} color="#ef4444" /> {t('lowStockItems')}</div>
          </div>
          {loading ? <div className={styles.shimmer} /> :
            lowStockItems.length === 0
              ? <p className={styles.allGood}>{t('allWellStocked')}</p>
              : lowStockItems.map((i, idx) => (
                <div key={idx} className={styles.panelRow}>
                  <span className={styles.panelRowName}>{i.medicineName || i.name}</span>
                  <span className={`${styles.badge} ${styles.badgeRed}`}>{i.quantity} left</span>
                </div>
              ))
          }
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}><ClipboardList size={16} color="#0d9488" /> {t('recentReservations')}</div>
          </div>
          {loading ? <div className={styles.shimmer} /> :
            recentReservations.length === 0
              ? <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('noRecentReservations')}</p>
              : recentReservations.map((r, idx) => (
                <div key={idx} className={styles.panelRow}>
                  <div>
                    <div className={styles.panelRowName}>{r.medicineName || r.medicine?.name || 'Medicine'}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{r.userName || r.user?.name || 'User'}</div>
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
