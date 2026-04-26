import React, { useEffect, useState } from 'react'
import { Eye, Pill, Search } from 'lucide-react'
import Modal from '../../components/common/Modal'
import { medicineAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './SuperAdmin.module.css'

export default function SAMedicines() {
  const { t } = useLanguage()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModal, setViewModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const load = (q = '') => {
    setLoading(true)
    medicineAPI.getAll(q)
      .then(res => setMedicines(res.data?.medicines || res.data || []))
      .catch(() => toast.error('Failed to load medicines'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = medicines.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderRow}>
        <div>
          <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#0f172a', marginBottom: 4 }}>
            {t('saMedicinesTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>All medicines registered in the system ({medicines.length} total)</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.panelCard} style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'Nunito,sans-serif', background: '#f8fafc' }}
            placeholder="Search by name, generic name, or category..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={styles.shimmer} style={{ height: 110 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <Pill size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No medicines found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 14 }}>
          {filtered.map((med, i) => (
            <div key={i}
              style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              onClick={() => { setSelected(med); setViewModal(true) }}
            >
              <div style={{ width: 42, height: 42, background: '#eef2ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Pill size={20} color="#6366f1" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{med.name}</div>
              {med.genericName && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{med.genericName}</div>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {med.category && <span className={`${styles.badge} ${styles.badgeBlue}`}>{med.category}</span>}
                <span className={`${styles.badge} ${med.requiresPrescription ? styles.badgeOrange : styles.badgeGreen}`}>
                  {med.requiresPrescription ? '📋 Rx' : '✓ OTC'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Medicine Details" size="md">
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: '#eef2ff', borderRadius: 14, marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
                <Pill size={26} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{selected.name}</div>
                {selected.genericName && <div style={{ color: '#64748b', fontSize: 13 }}>{selected.genericName}</div>}
              </div>
            </div>
            {[
              { label: t('category'), value: selected.category || '—' },
              { label: t('manufacturer'), value: selected.manufacturer || '—' },
              { label: t('dosage'), value: selected.dosage || '—' },
              { label: t('requiresPrescription'), value: selected.requiresPrescription ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 14 }}>{value}</span>
              </div>
            ))}
            {selected.description && (
              <div style={{ marginTop: 14, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#64748b', marginBottom: 6 }}>DESCRIPTION</div>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{selected.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
