import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger', // 'danger' | 'primary'
  loading = false,
}) {
  const confirmStyle = confirmVariant === 'danger'
    ? { background: '#ef4444', color: '#fff' }
    : { background: '#0d9488', color: '#fff' }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: confirmVariant === 'danger' ? '#fee2e2' : '#f0fdfa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: confirmVariant === 'danger' ? '#dc2626' : '#0d9488',
        }}>
          <AlertTriangle size={20} />
        </div>
        <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, margin: 0, paddingTop: 4 }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#475569', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{ padding: '9px 20px', borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, ...confirmStyle }}
        >
          {loading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
