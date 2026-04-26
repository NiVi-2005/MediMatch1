import React, { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle, RefreshCw, ClipboardList, Calendar, User } from 'lucide-react'
import Modal from '../../components/common/Modal'
import { reservationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

const STATUS_OPTIONS = [
  { value: 'pending', labelKey: 'pending', color: '#d97706', bg: '#fef3c7' },
  { value: 'confirmed', labelKey: 'confirmed', color: '#2563eb', bg: '#dbeafe' },
  { value: 'success', labelKey: 'success', color: '#16a34a', bg: '#dcfce7' },
  { value: 'rejected', labelKey: 'rejected', color: '#dc2626', bg: '#fee2e2' },
  { value: 'cancelled', labelKey: 'cancelled', color: '#64748b', bg: '#f1f5f9' },
]

export default function AdminReservations() {
  const { t } = useLanguage()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewModal, setViewModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [prescriptionUrl, setPrescriptionUrl] = useState(null)
  const [prescLoading, setPrescLoading] = useState(false)

  const load = () => {
    setLoading(true)
    reservationAPI.getAll()
      .then(res => setReservations(res.data?.reservations || res.data || []))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openView = async (r) => {
    setSelected(r); setPrescriptionUrl(null); setViewModal(true)
    if (r.hasPrescription || r.prescriptionFile) {
      setPrescLoading(true)
      try {
        const res = await reservationAPI.viewPrescription(r._id || r.id)
        setPrescriptionUrl(URL.createObjectURL(new Blob([res.data])))
      } catch {}
      finally { setPrescLoading(false) }
    }
  }

  const openStatus = (r) => { setSelected(r); setNewStatus(r.status || 'pending'); setStatusModal(true) }

  const handleUpdateStatus = async () => {
    setUpdating(true)
    try {
      await reservationAPI.updateStatus(selected._id || selected.id, newStatus)
      toast.success('Status updated!')
      setStatusModal(false); load()
    } catch { toast.error('Update failed') }
    finally { setUpdating(false) }
  }

  const getBadgeCls = (s) => {
    const map = { pending: styles.badgeYellow, confirmed: styles.badgeBlue, success: styles.badgeGreen, completed: styles.badgeGreen, rejected: styles.badgeRed, cancelled: styles.badgeGray }
    return map[s?.toLowerCase()] || styles.badgeGray
  }
  const getStatusLabel = (s) => {
    const map = { pending: t('pending'), confirmed: t('confirmed'), success: t('success'), completed: t('success'), rejected: t('rejected'), cancelled: t('cancelled') }
    return map[s?.toLowerCase()] || s
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status?.toLowerCase() === filter)

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', labelKey: 'pending' },
    { value: 'confirmed', labelKey: 'confirmed' },
    { value: 'success', labelKey: 'success' },
    { value: 'rejected', labelKey: 'rejected' },
  ]

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderRow}>
        <div>
          <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#0f172a', marginBottom: 4 }}>
            {t('adminReservationsTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Review and update patient medicine reservation requests</p>
        </div>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: '7px 16px', borderRadius: 10, border: '1.5px solid',
              borderColor: filter === f.value ? '#0284c7' : '#e2e8f0',
              background: filter === f.value ? '#0284c7' : 'white',
              color: filter === f.value ? 'white' : '#64748b',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
            }}>
            {f.labelKey ? t(f.labelKey) : f.label}
            {f.value === 'all' && <> ({reservations.length})</>}
          </button>
        ))}
      </div>

      {/* Reservations */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 14, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No reservations found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((r, i) => (
            <div key={i} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(2,132,199,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{r.medicineName || r.medicine?.name || 'Medicine'}</div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span><User size={11} style={{ display: 'inline', marginRight: 3 }} />{r.userName || r.user?.name || 'Patient'}</span>
                    {r.createdAt && <span><Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>}
                    <span>📦 Qty: {r.quantity || 1}</span>
                  </div>
                </div>
                <span className={`${styles.badge} ${getBadgeCls(r.status)}`}>{getStatusLabel(r.status)}</span>
              </div>
              {r.notes && <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10, background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>💬 {r.notes}</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => openView(r)}>
                  <Eye size={13} /> {t('view')}
                </button>
                <button className={`${styles.btn} ${styles.btnTeal} ${styles.btnSm}`} onClick={() => openStatus(r)}>
                  <CheckCircle size={13} /> {t('updateStatus')}
                </button>
                {r.status === 'pending' && (
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                    onClick={async () => {
                      try { await reservationAPI.updateStatus(r._id || r.id, 'rejected'); toast.success('Rejected'); load() }
                      catch { toast.error('Failed') }
                    }}>
                    <XCircle size={13} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Reservation Details" size="md">
        {selected && (
          <div>
            {[
              { label: 'Medicine', value: selected.medicineName || selected.medicine?.name },
              { label: 'Patient', value: selected.userName || selected.user?.name },
              { label: 'Quantity', value: selected.quantity },
              { label: 'Status', value: getStatusLabel(selected.status) },
              { label: 'Date', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—' },
              { label: 'Notes', value: selected.notes || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            {prescLoading && <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>Loading prescription...</p>}
            {prescriptionUrl && (
              <div style={{ marginTop: 16 }}>
                <img src={prescriptionUrl} alt="Prescription" style={{ width: '100%', borderRadius: 12, border: '1px solid #e2e8f0' }} onError={() => {}} />
                <a href={prescriptionUrl} download="prescription" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 10, display: 'inline-flex', textDecoration: 'none' }}>
                  Download Prescription
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title={t('updateStatus')} size="sm">
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>New Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setNewStatus(s.value)}
                style={{
                  padding: '11px 16px', borderRadius: 10, border: `2px solid ${newStatus === s.value ? s.color : '#e2e8f0'}`,
                  background: newStatus === s.value ? s.bg : 'white',
                  color: newStatus === s.value ? s.color : '#64748b',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}>
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStatusModal(false)}>{t('cancel')}</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleUpdateStatus} disabled={updating}>
            {updating ? 'Updating...' : t('update')}
          </button>
        </div>
      </Modal>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}
