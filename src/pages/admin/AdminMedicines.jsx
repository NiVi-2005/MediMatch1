import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Pill, Search } from 'lucide-react'
import Modal from '../../components/common/Modal'
import { medicineAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

const emptyForm = { name: '', genericName: '', category: '', manufacturer: '', dosage: '', requiresPrescription: false, description: '', sideEffects: '' }

const CATEGORIES = ['Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines', 'Antidiabetics', 'Antihypertensives', 'Vitamins', 'Antipyretics', 'Other']

export default function AdminMedicines() {
  const { t } = useLanguage()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = (q = '') => {
    setLoading(true)
    medicineAPI.getAll(q)
      .then(res => setMedicines(res.data?.medicines || res.data || []))
      .catch(() => toast.error('Failed to load medicines'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setSelected(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (m) => {
    setSelected(m)
    setForm({ name: m.name || '', genericName: m.genericName || '', category: m.category || '', manufacturer: m.manufacturer || '', dosage: m.dosage || '', requiresPrescription: !!m.requiresPrescription, description: m.description || '', sideEffects: m.sideEffects || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Medicine name is required')
    setSaving(true)
    try {
      if (selected) { await medicineAPI.update(selected._id || selected.id, form); toast.success('Medicine updated!') }
      else { await medicineAPI.create(form); toast.success('Medicine added!') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await medicineAPI.delete(selected._id || selected.id)
      toast.success('Medicine deleted')
      setDeleteModal(false); load()
    } catch { toast.error('Delete failed') }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const filtered = medicines.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.genericName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderRow}>
        <div>
          <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#0f172a', marginBottom: 4 }}>
            {t('adminMedicinesTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage medicines available at your pharmacy</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          <Plus size={16} /> {t('addMedicine')}
        </button>
      </div>

      {/* Search */}
      <div className={styles.sectionCard} style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'Nunito,sans-serif', background: '#f8fafc' }}
            placeholder="Search medicines..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 120, borderRadius: 14, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <Pill size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No medicines found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
          {filtered.map((med, i) => (
            <div key={i} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(2,132,199,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, background: '#e0f2fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={20} color="#0284c7" />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => openEdit(med)}><Edit2 size={13} /></button>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => { setSelected(med); setDeleteModal(true) }}><Trash2 size={13} /></button>
                </div>
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

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Medicine' : t('addMedicine')} size="lg">
        <form onSubmit={handleSave}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t('name')} *</label>
              <input className={styles.input} placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.field}>
              <label>{t('genericName')}</label>
              <input className={styles.input} placeholder="e.g. Acetaminophen" value={form.genericName} onChange={set('genericName')} />
            </div>
            <div className={styles.field}>
              <label>{t('category')}</label>
              <select className={styles.select} value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>{t('manufacturer')}</label>
              <input className={styles.input} placeholder="e.g. Sun Pharma" value={form.manufacturer} onChange={set('manufacturer')} />
            </div>
            <div className={styles.field}>
              <label>{t('dosage')}</label>
              <input className={styles.input} placeholder="e.g. 500mg" value={form.dosage} onChange={set('dosage')} />
            </div>
            <div className={styles.field} style={{ justifyContent: 'flex-end' }}>
              <label>{t('requiresPrescription')}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: form.requiresPrescription ? '#e0f2fe' : '#f8fafc' }}>
                <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#0284c7' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: form.requiresPrescription ? '#0369a1' : '#64748b' }}>
                  {form.requiresPrescription ? '📋 Yes, prescription needed' : '✓ No prescription needed'}
                </span>
              </label>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label>Description</label>
              <textarea className={styles.textarea} placeholder="Brief description of the medicine..." value={form.description} onChange={set('description')} rows={2} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setModalOpen(false)}>{t('cancel')}</button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
              {saving ? 'Saving...' : (selected ? t('update') : t('add'))}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Medicine" size="sm">
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>
          Delete <strong>{selected?.name}</strong>? This action cannot be undone.
        </p>
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setDeleteModal(false)}>{t('cancel')}</button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>{t('delete')}</button>
        </div>
      </Modal>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}
