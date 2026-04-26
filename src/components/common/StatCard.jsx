import React from 'react'
import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, label, value, color = '#0d9488', trend, sub }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconBox} style={{ background: color + '18', color }}>
        <Icon size={22} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value ?? '—'}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
      {trend !== undefined && (
        <div className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
