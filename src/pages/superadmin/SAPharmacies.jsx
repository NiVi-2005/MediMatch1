import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Building2, MapPin } from 'lucide-react'
import Modal from '../../components/common/Modal'
import { pharmacyAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './SuperAdmin.module.css'

const emptyForm = { name: '', email: '', phone: '', address: '', city: '', licenseNumber: '', status: 'active', lat: '', lng: '', subscriptionDeadline: '' }

export default function SAPharmacies() {
  const { t } = useLanguage()
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const isEdit = !!selected && modalOpen

  const load = () => {
    setLoading(true)
    pharmacyAPI.getAll()
      .then(res => setPharmacies(res.data?.pharmacies || res.data || []))
      .catch(() => toast.error('Failed to load pharmacies'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setSelected(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p) => {
    setSelected(p)
    setForm({
      name: p.name || '', email: p.email || '', phone: p.phone || '',
      address: p.address || '', city: p.city || '', licenseNumber: p.licenseNumber || '',
      status: p.status || 'active',
      subscriptionDeadline: p.subscriptionDeadline ? new Date(p.subscriptionDeadline).toISOString().split('T')[0] : '',
      lat: p.location?.coordinates?.[1] || '',
      lng: p.location?.coordinates?.[0] || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    setSaving(true)
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, licenseNumber: form.licenseNumber,
        status: form.status, subscriptionDeadline: form.subscriptionDeadline,
      }
      if (form.lat && form.lng) {
        payload.location = { type: 'Point', coordinates: [parseFloat(form.lng), parseFloat(form.lat)] }
      }
      if (isEdit) { await pharmacyAPI.update(selected._id || selected.id, payload); toast.success('Pharmacy updated!') }
      else { await pharmacyAPI.create(payload); toast.success('Pharmacy created!') }
      setModalOpen(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await pharmacyAPI.delete(selected._id || selected.id)
      toast.success('Pharmacy deleted')
      setDeleteModal(false); load()
    } catch { toast.error('Delete failed') }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }))
        toast.success('Location detected!')
      },
      () => toast.error('Location access denied')
    )
  }

  const filtered = pharmacies.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderRow}>
        <div>
          <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#0f172a', marginBottom: 4 }}>
            {t('saPharmaciesTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage all registered pharmacies on the network</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          <Plus size={16} /> {t('addPharmacy')}
        </button>
      </div>

      {/* Search */}
      <div className={styles.panelCard}>
        <input
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'Nunito,sans-serif', background: '#f8fafc' }}
          placeholder={`🔍 Search pharmacies...`}
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Pharmacy cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className={styles.shimmer} style={{ height: 80 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <Building2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No pharmacies found. Add your first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p, i) => (
            <div key={i} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ width: 44, height: 44, background: '#eef2ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={20} color="#6366f1" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {p.city && <span><MapPin size={11} style={{ display: 'inline' }} /> {p.city}</span>}
                  {p.phone && <span>📞 {p.phone}</span>}
                  {p.subscriptionDeadline && <span style={{ color: '#d97706', fontWeight: 600 }}>⏳ Deadline: {new Date(p.subscriptionDeadline).toLocaleDateString()}</span>}
                  {p.location?.coordinates?.[0] !== 0 && p.location?.coordinates?.length === 2 && (
                    <span style={{ color: '#0d9488', fontWeight: 700 }}>📍 GPS set</span>
                  )}
                </div>
              </div>
              <span className={`${styles.badge} ${p.status === 'active' ? styles.badgeGreen : styles.badgeGray}`}>
                {p.status === 'active' ? t('active') : t('inactive')}
              </span>
              <div className={styles.actionsBtns}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => { setSelected(p); setViewModal(true) }} title="View"><Eye size={14} /></button>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button>
                <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => { setSelected(p); setDeleteModal(true) }} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Pharmacy' : t('addPharmacy')} size="lg">
        <form onSubmit={handleSave}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t('name')} *</label>
              <input className={styles.input} placeholder="Apollo Pharmacy" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.field}>
              <label>{t('phone')} *</label>
              <input className={styles.input} placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
            </div>
            <div className={styles.field}>
              <label>{t('email')}</label>
              <input type="email" className={styles.input} placeholder="pharmacy@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className={styles.field}>
              <label>{t('city')}</label>
              <input className={styles.input} placeholder="Chennai" value={form.city} onChange={set('city')} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label>{t('address')}</label>
              <input className={styles.input} placeholder="123 Main Street" value={form.address} onChange={set('address')} />
            </div>
            <div className={styles.field}>
              <label>{t('licenseNumber')}</label>
              <input className={styles.input} placeholder="LIC-XXXXX" value={form.licenseNumber} onChange={set('licenseNumber')} />
            </div>
            <div className={styles.field}>
              <label>{t('status')}</label>
              <select className={styles.select} value={form.status} onChange={set('status')}>
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Deadline (Subscription Date)</label>
              <input type="date" className={styles.input} value={form.subscriptionDeadline} onChange={set('subscriptionDeadline')} />
            </div>
          </div>

          {/* GPS location fields */}
          <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: 12, padding: '14px 16px', marginTop: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#0d9488', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} /> GPS Location (for nearby pharmacy feature)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className={styles.field}>
                <label>Latitude</label>
                <input className={styles.input} placeholder="e.g. 13.0827" type="number" step="any" value={form.lat} onChange={set('lat')} />
              </div>
              <div className={styles.field}>
                <label>Longitude</label>
                <input className={styles.input} placeholder="e.g. 80.2707" type="number" step="any" value={form.lng} onChange={set('lng')} />
              </div>
            </div>
            <button type="button" onClick={detectLocation}
              style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <MapPin size={13} /> Use my current location
            </button>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setModalOpen(false)}>{t('cancel')}</button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Pharmacy Details" size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: t('name'), value: selected.name },
              { label: t('phone'), value: selected.phone },
              { label: t('email'), value: selected.email || '—' },
              { label: t('city'), value: selected.city || '—' },
              { label: t('address'), value: selected.address || '—' },
              { label: t('licenseNumber'), value: selected.licenseNumber || '—' },
              { label: t('status'), value: selected.status },
              { label: 'Coordinates', value: selected.location?.coordinates ? `${selected.location.coordinates[1]}, ${selected.location.coordinates[0]}` : 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Pharmacy" size="sm">
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>
          Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
        </p>
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setDeleteModal(false)}>{t('cancel')}</button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>{t('delete')}</button>
        </div>
      </Modal>
    </div>
  )
}
