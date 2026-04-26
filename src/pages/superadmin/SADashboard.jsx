import React, { useEffect, useState } from 'react'
import { Building2, Pill, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { pharmacyAPI, medicineAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './SuperAdmin.module.css'

function KPICard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={styles.kpiCard}>
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

export default function SADashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({ pharmacies: 0, medicines: 0, active: 0 })
  const [recentPharmacies, setRecentPharmacies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([pharmacyAPI.getAll(), medicineAPI.getAll()])
      .then(([ph, med]) => {
        const pharmacies = ph.data?.pharmacies || ph.data || []
        const medicines = med.data?.medicines || med.data || []
        const active = pharmacies.filter(p => p.status === 'active').length
        setStats({ pharmacies: pharmacies.length, medicines: medicines.length, active })
        setRecentPharmacies(pharmacies.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">
      <div className={styles.dashHero}>
        <div>
          <h1>{t('hello')}, {user?.name || 'Admin'} 👋</h1>
          <p>Here's an overview of your MedConnect network</p>
        </div>
        <div className={styles.dashHeroIcon}>🌐</div>
      </div>

      <div className={styles.kpiGrid}>
        <KPICard icon={Building2} label={t('totalPharmacies')} value={loading ? '—' : stats.pharmacies} color="#6366f1" />
        <KPICard icon={Pill} label={t('totalMedicines')} value={loading ? '—' : stats.medicines} color="#0d9488" />
        <KPICard icon={Users} label={t('activePharmacies')} value={loading ? '—' : stats.active} color="#f59e0b" />
        <KPICard icon={TrendingUp} label="Platform Status" value="Active" color="#22c55e" sub="All systems normal" />
      </div>

      <div className={styles.panelCard}>
        <div className={styles.panelTitle}>
          <Building2 size={18} color="#6366f1" /> Recently Added Pharmacies
        </div>
        {loading ? (
          <div className={styles.shimmer} />
        ) : recentPharmacies.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No pharmacies yet. Add your first one!</p>
        ) : (
          recentPharmacies.map((p, i) => (
            <div key={i} className={styles.pharmacyRow}>
              <div className={styles.pharmacyRowLeft}>
                <div className={styles.pharmacyAvatar} style={{ background: '#6366f118' }}>
                  <Building2 size={16} color="#6366f1" />
                </div>
                <div>
                  <div className={styles.pharmacyRowName}>{p.name}</div>
                  <div className={styles.pharmacyRowAddr}>{p.city || p.address || '—'}</div>
                </div>
              </div>
              <span className={`${styles.badge} ${p.status === 'active' ? styles.badgeGreen : styles.badgeGray}`}>
                {p.status || 'active'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
