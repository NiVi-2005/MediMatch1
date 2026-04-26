import React, { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage, LANGUAGES } from '../../context/LanguageContext'

export default function LanguageSwitcher({ compact = false }) {
  const { lang, changeLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)',
          borderRadius: 10, padding: compact ? '6px 10px' : '8px 14px',
          color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          transition: 'all 0.15s', backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <Globe size={15} />
        {!compact && <span>{current.flag} {current.nativeLabel}</span>}
        {compact && <span>{current.flag}</span>}
        <span style={{ fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0', minWidth: 160, zIndex: 9999, overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease both',
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 16px', border: 'none', textAlign: 'left',
                background: lang === l.code ? '#f0fdfa' : 'white',
                color: lang === l.code ? '#0d9488' : '#334155',
                fontWeight: lang === l.code ? 800 : 600, fontSize: 14,
                cursor: 'pointer', transition: 'background 0.1s',
                borderBottom: '1px solid #f1f5f9',
              }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'white' }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <div>
                <div style={{ fontSize: 14 }}>{l.nativeLabel}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{l.label}</div>
              </div>
              {lang === l.code && <span style={{ marginLeft: 'auto', color: '#0d9488', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Sidebar variant (dark bg)
export function LanguageSwitcherSidebar() {
  const { lang, changeLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} style={{ position: 'relative', padding: '0 12px', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: '#f0fdfa', border: '1.5px solid #99f6e4',
          borderRadius: 10, padding: '9px 12px',
          color: '#0d9488', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        }}
      >
        <Globe size={15} />
        <span>{current.flag} {current.nativeLabel}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', left: 12, right: 12,
          background: 'white', borderRadius: 12, boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden',
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none', textAlign: 'left',
                background: lang === l.code ? '#f0fdfa' : 'white',
                color: lang === l.code ? '#0d9488' : '#334155',
                fontWeight: lang === l.code ? 800 : 600, fontSize: 13,
                cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span>{l.flag}</span>
              <span>{l.nativeLabel}</span>
              {lang === l.code && <span style={{ marginLeft: 'auto', color: '#0d9488' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
