import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, Package, Search } from 'lucide-react'
import Modal from '../../components/common/Modal'
import { inventoryAPI, medicineAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

const emptyForm = { medicineId: '', medicineName: '', quantity: '', unit: 'tablets', price: '', expiryDate: '', threshold: '10', location: '' }

export default function AdminInventory() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([inventoryAPI.getAll(), medicineAPI.getAll()])
      .then(([inv, med]) => {
        setItems(inv.data?.inventory || inv.data || [])
        setMedicines(med.data?.medicines || med.data || [])
      })
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setSelected(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item) => {
    setSelected(item)
    setForm({
      medicineId: item.medicineId || item.medicine?._id || '',
      medicineName: item.medicineName || item.medicine?.name || '',
      quantity: item.quantity || '',
      unit: item.unit || 'tablets',
      price: item.price || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      threshold: item.threshold || '10',
      location: item.location || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.medicineName || !form.quantity) return toast.error('Medicine name and quantity are required')
    setSaving(true)
    try {
      const payload = { ...form, quantity: Number(form.quantity), price: Number(form.price), threshold: Number(form.threshold) }
      if (selected) { await inventoryAPI.update(selected._id || selected.id, payload); toast.success('Inventory updated!') }
      else { await inventoryAPI.create(payload); toast.success('Item added to inventory!') }
      setModalOpen(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await inventoryAPI.delete(selected._id || selected.id)
      toast.success('Item deleted')
      setDeleteModal(false); load()
    } catch { toast.error('Delete failed') }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const filtered = items.filter(item =>
    !search || (item.medicineName || item.medicine?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const isLow = (item) => item.quantity <= (item.threshold || 10)

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderRow}>
        <div>
          <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#0f172a', marginBottom: 4 }}>
            {t('adminInventoryTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage your pharmacy's medicine stock</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          <Plus size={16} /> {t('addInventory')}
        </button>
      </div>

      {/* Search */}
      <div className={styles.sectionCard} style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'Nunito,sans-serif', background: '#f8fafc' }}
            placeholder="Search medicines in inventory..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Inventory items */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 72, borderRadius: 14, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No inventory items found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item, i) => (
            <div key={i} style={{
               border: `1.5px solid ${isLow(item) ? '#fcd34d' : '#e2e8f0'}`,
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              background: isLow(item) ? '#fffbeb' : 'white',
              transition: 'all 0.15s'
            }}>
              <div style={{ width: 42, height: 42, background: isLow(item) ? '#fef3c7' : '#f0fdfa', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isLow(item) ? <AlertTriangle size={20} color="#d97706" /> : <Package size={20} color="#0d9488" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{item.medicineName || item.medicine?.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 3 }}>
                  <span>📦 {item.quantity} {item.unit}</span>
                  {item.price && <span>💰 ₹{item.price}</span>}
                  {item.expiryDate && <span>📅 Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {isLow(item) && (
                  <span className={`${styles.badge} ${styles.badgeYellow}`}>
                    <AlertTriangle size={10} style={{ marginRight: 3 }} /> Low Stock
                  </span>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => openEdit(item)}><Edit2 size={13} /></button>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => { setSelected(item); setDeleteModal(true) }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Inventory Item' : t('addInventory')} size="lg">
        <form onSubmit={handleSave}>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.full}`}>
              <label>{t('medicineName')} *</label>
              <input list="med-list" className={styles.input} placeholder="Type or select medicine" value={form.medicineName}
                onChange={e => {
                  const val = e.target.value
                  const med = medicines.find(m => m.name === val)
                  setForm(f => ({ ...f, medicineName: val, medicineId: med?._id || f.medicineId }))
                }} required />
              <datalist id="med-list">
                {medicines.map(m => <option key={m._id} value={m.name} />)}
              </datalist>
            </div>
            <div className={styles.field}>
              <label>{t('quantity')} *</label>
              <input type="number" className={styles.input} min="0" value={form.quantity} onChange={set('quantity')} required />
            </div>
            <div className={styles.field}>
              <label>{t('unit')}</label>
              <select className={styles.select} value={form.unit} onChange={set('unit')}>
                {['tablets', 'capsules', 'ml', 'mg', 'units', 'strips', 'bottles'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>{t('price')} (₹)</label>
              <input type="number" className={styles.input} min="0" step="0.01" value={form.price} onChange={set('price')} />
            </div>
            <div className={styles.field}>
              <label>{t('expiryDate')}</label>
              <input type="date" className={styles.input} value={form.expiryDate} onChange={set('expiryDate')} />
            </div>
            <div className={styles.field}>
              <label>{t('reorderLevel')}</label>
              <input type="number" className={styles.input} min="0" value={form.threshold} onChange={set('threshold')} />
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

      {/* Delete */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Item" size="sm">
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>
          Are you sure you want to delete <strong>{selected?.medicineName || selected?.medicine?.name}</strong>?
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
