import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Trash2, Upload, Eye, X, CheckCircle, RefreshCw, Calendar, Building2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Modal from '../../components/common/Modal'
import { reservationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './User.module.css'

export default function UserReservations() {
  const { t } = useLanguage()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteModal, setDeleteModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [prescFile, setPrescFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    reservationAPI.getMyReservations()
      .then(res => setReservations(res.data?.reservations || res.data || []))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status?.toLowerCase() === filter)

  const getBadgeCls = (s) => {
    const map = { pending: styles.badgeYellow, confirmed: styles.badgeBlue, success: styles.badgeGreen, completed: styles.badgeGreen, rejected: styles.badgeRed, cancelled: styles.badgeGray }
    return map[s?.toLowerCase()] || styles.badgeGray
  }
  const getStatusLabel = (s) => {
    const map = { pending: t('pending'), confirmed: t('confirmed'), success: t('success'), completed: t('success'), rejected: t('rejected'), cancelled: t('cancelled') }
    return map[s?.toLowerCase()] || s
  }

  const handleDelete = async () => {
    try {
      await reservationAPI.delete(selected._id || selected.id)
      toast.success('Reservation deleted')
      setDeleteModal(false); load()
    } catch { toast.error('Delete failed') }
  }

  const onDrop = useCallback(files => { if (files[0]) setPrescFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1
  })

  const handleUploadPrescription = async () => {
    if (!prescFile) return toast.error('Please select a file')
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('prescription', prescFile)
      await reservationAPI.uploadPrescription(selected._id || selected.id, fd)
      toast.success('Prescription uploaded!')
      setUploadModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', labelKey: 'pending' },
    { value: 'confirmed', labelKey: 'confirmed' },
    { value: 'success', labelKey: 'success' },
    { value: 'rejected', labelKey: 'rejected' },
  ]

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,24px)', color: '#0f172a', marginBottom: 6 }}>
          {t('myReservationsTitle')}
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track and manage all your medicine reservations</p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filtersRow}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}>
            {f.labelKey ? t(f.labelKey) : f.label}
            {f.value === 'all' && <> ({reservations.length})</>}
          </button>
        ))}
        <button className={styles.filterBtn} onClick={load} style={{ marginLeft: 'auto' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className={styles.shimmerRow} style={{ height: 100 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p>{t('noReservationsYet')}</p>
        </div>
      ) : (
        filtered.map((r, i) => (
          <div key={i} className={styles.resCard}>
            <div className={styles.resCardHeader}>
              <div>
                <div className={styles.resMedName}>{r.medicineName || r.medicine?.name || 'Medicine'}</div>
                <div className={styles.resPharmacy}><Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />{r.pharmacyName || r.pharmacy?.name || '—'}</div>
              </div>
              <span className={`${styles.badge} ${getBadgeCls(r.status)}`}>{getStatusLabel(r.status)}</span>
            </div>
            <div className={styles.resCardMeta}>
              <span>📦 Qty: {r.quantity || 1}</span>
              {r.createdAt && <span><Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>}
              {r.notes && <span>💬 {r.notes}</span>}
            </div>
            <div className={styles.resCardActions}>
              <button className={styles.resActionBtn} style={{ background: '#f0fdfa', color: '#0d9488' }}
                onClick={() => { setSelected(r); setViewModal(true) }}>
                <Eye size={14} /> {t('view')}
              </button>
              {!r.prescriptionUrl && r.status === 'pending' && (
                <button className={styles.resActionBtn} style={{ background: '#fef3c7', color: '#d97706' }}
                  onClick={() => { setSelected(r); setPrescFile(null); setUploadModal(true) }}>
                  <Upload size={14} /> {t('uploadPrescription')}
                </button>
              )}
              {r.status === 'pending' && (
                <button className={styles.resActionBtn} style={{ background: '#fee2e2', color: '#dc2626' }}
                  onClick={() => { setSelected(r); setDeleteModal(true) }}>
                  <Trash2 size={14} /> {t('cancel')}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Reservation Details" size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Medicine', value: selected.medicineName || selected.medicine?.name },
              { label: 'Pharmacy', value: selected.pharmacyName || selected.pharmacy?.name },
              { label: 'Quantity', value: selected.quantity },
              { label: 'Status', value: getStatusLabel(selected.status) },
              { label: 'Date', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—' },
              { label: 'Notes', value: selected.notes || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 14 }}>{value}</span>
              </div>
            ))}
            {selected.prescriptionUrl && (
              <button className="btn btnPrimary" style={{ marginTop: 8 }}
                onClick={async () => {
                  try {
                    const res = await reservationAPI.viewPrescription(selected._id || selected.id)
                    const url = URL.createObjectURL(res.data)
                    window.open(url, '_blank')
                  } catch { toast.error('Failed to view prescription') }
                }}>
                <Eye size={15} /> {t('viewPrescription')}
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Upload Prescription Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title={t('uploadPrescription')} size="sm">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzoneActive' : ''}`}>
          <input {...getInputProps()} />
          <Upload size={28} className="dropzoneIcon" />
          <div className="dropzoneText">{isDragActive ? 'Drop here...' : t('dragDrop')}</div>
          <div className="dropzoneSub">{t('fileSupport')}</div>
          {prescFile && (
            <div className="dropzonePreview">
              <CheckCircle size={13} style={{ marginRight: 6 }} /> {prescFile.name}
            </div>
          )}
        </div>
        <div className="formActions">
          <button className="btn btnGhost" onClick={() => setUploadModal(false)}>{t('cancel')}</button>
          <button className="btn btnPrimary" onClick={handleUploadPrescription} disabled={!prescFile || uploading}>
            {uploading ? 'Uploading...' : t('save')}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title={t('cancelReservation')} size="sm">
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>{t('confirmCancel')}</p>
        <div className="formActions">
          <button className="btn btnGhost" onClick={() => setDeleteModal(false)}>{t('no')}</button>
          <button className="btn btnDanger" onClick={handleDelete}>{t('yes')}, {t('cancel')}</button>
        </div>
      </Modal>
    </div>
  )
}
