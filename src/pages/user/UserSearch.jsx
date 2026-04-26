import React, { useState, useCallback, useEffect } from 'react'
import { Search, Pill, Upload, MapPin, AlertCircle, Sparkles, X, CheckCircle, Building2, Navigation } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Modal from '../../components/common/Modal'
import { medicineAPI, reservationAPI } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import styles from './User.module.css'

const AI_SUGGESTIONS = {
  paracetamol: ['Dolo 650', 'Calpol 500', 'Crocin 650', 'Combiflam'],
  ibuprofen: ['Brufen 400', 'Advil', 'Nurofen'],
  amoxicillin: ['Augmentin 625', 'Amoxil 500'],
  cetirizine: ['Zyrtec', 'Allegra 120', 'Alerid'],
  omeprazole: ['Omez 20', 'Pan 40', 'Pantoprazole'],
  metformin: ['Glucophage 500', 'Glycomet 850'],
  atorvastatin: ['Lipitor', 'Atorva 10', 'Storvas'],
}

function getSuggestions(query) {
  if (!query || query.length < 3) return []
  const q = query.toLowerCase()
  for (const [key, suggestions] of Object.entries(AI_SUGGESTIONS)) {
    if (key.includes(q) || q.includes(key)) return suggestions
  }
  return []
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function UserSearch() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [medicines, setMedicines] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedMed, setSelectedMed] = useState(null)
  const [pharmacies, setPharmacies] = useState([])
  const [loadingPharmacies, setLoadingPharmacies] = useState(false)
  const [reserveModal, setReserveModal] = useState(false)
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [prescFile, setPrescFile] = useState(null)
  const [reserving, setReserving] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const aiSuggestions = getSuggestions(query)

  const onDrop = useCallback(files => { if (files[0]) setPrescFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1
  })

  // Re-sort pharmacies dynamically when location is fetched
  useEffect(() => {
    if (userLocation && pharmacies.length > 0) {
      setPharmacies(prev => sortByDistance(prev, userLocation))
    }
  }, [userLocation])

  const getLocation = () => {
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
        toast.success('Location detected! Showing nearest pharmacies first.')
      },
      () => {
        toast.error(t('locationDenied') || 'Location access denied')
        setLocationLoading(false)
      },
      { timeout: 8000 }
    )
  }

  const sortByDistance = (pharmaciesList, location) => {
    if (!location) return pharmaciesList
    return [...pharmaciesList].map(ph => {
      const coords = ph.location?.coordinates
      if (coords && coords[0] !== 0 && coords[1] !== 0) {
        const dist = calcDistance(location.lat, location.lng, coords[1], coords[0])
        return { ...ph, distanceKm: Math.round(dist * 10) / 10 }
      }
      return ph
    }).sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }

  const handleSearch = async (q = query) => {
    if (!q.trim()) return toast.error('Please enter a medicine name')
    setSearching(true); setSearched(false); setMedicines([]); setSelectedMed(null); setPharmacies([])
    try {
      const res = await medicineAPI.getAll(q)
      setMedicines(res.data?.medicines || res.data || [])
      setSearched(true)
    } catch { toast.error(t('searchFailed')) }
    finally { setSearching(false) }
  }

  const handleSelectMedicine = async (med) => {
    setSelectedMed(med); setLoadingPharmacies(true); setPharmacies([])
    try {
      const params = userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : {}
      const res = await medicineAPI.searchNearby(med.name, params)
      const list = res.data?.pharmacies || res.data || []
      setPharmacies(sortByDistance(list, userLocation))
    } catch { setPharmacies([]) }
    finally { setLoadingPharmacies(false) }
  }

  const openReserve = (pharmacy) => {
    if (selectedMed?.requiresPrescription && !prescFile) {
      toast.error('This medicine requires a prescription. Please upload one first.')
      return
    }
    setSelectedPharmacy(pharmacy); setQuantity(1); setNotes(''); setReserveModal(true)
  }

  const handleReserve = async () => {
    setReserving(true)
    try {
      const formData = new FormData()
      formData.append('medicineId', selectedMed._id || selectedMed.id)
      formData.append('medicineName', selectedMed.name)
      formData.append('pharmacyId', selectedPharmacy._id || selectedPharmacy.id)
      formData.append('pharmacyName', selectedPharmacy.name)
      formData.append('quantity', quantity)
      formData.append('notes', notes)
      if (prescFile) formData.append('prescription', prescFile)
      await reservationAPI.createWithFile(formData)
      toast.success(t('reservationSuccess'))
      setReserveModal(false); setSelectedMed(null); setPharmacies([]); setPrescFile(null)
    } catch (err) {
      toast.error(err.response?.data?.message || t('reservationFailed'))
    } finally { setReserving(false) }
  }

  return (
    <div className="page-enter">
      <div className={styles.pageHeaderInner}>
        <div>
          <h1>{t('searchMedicinesTitle')}</h1>
          <p>{t('searchSubtitle')}</p>
        </div>
        {!userLocation ? (
          <button className={styles.locationBtn} onClick={getLocation} disabled={locationLoading}>
            <Navigation size={15} />
            {locationLoading ? t('gettingLocation') : t('useMyLocation')}
          </button>
        ) : (
          <div className={styles.locationActive}>
            <MapPin size={14} /> Location active
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="bigSearch" style={{ marginTop: 20 }}>
        <input className="bigSearchInput"
          placeholder="Step 2: Enter medicine name to find nearby pharmacies..."
          value={query}
          onChange={e => {
            const val = e.target.value;
            setQuery(val);
            if (val.trim().length > 0) {
              handleSearch(val);
            } else {
              setMedicines([]);
              setSearched(false);
              setSelectedMed(null);
            }
          }}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btnPrimary" onClick={() => handleSearch()} disabled={searching} style={{ padding: '0 24px', fontSize: 15 }}>
          {searching
            ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            : <Search size={18} />}
          {searching ? t('searching') : t('search')}
        </button>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="aiBox">
          <div className="aiBoxTitle"><Sparkles size={14} /> {t('aiSuggestion')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {aiSuggestions.map(s => (
              <button key={s} className="aiSuggestion" onClick={() => { setQuery(s); handleSearch(s) }}>
                <Pill size={12} /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Upload */}
      <div className="sectionCard" style={{ marginBottom: 22 }}>
        <div className="sectionTitle"><Upload size={18} style={{ color: '#0d9488' }} /> {t('uploadPrescription')} (Step 1)</div>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>Please securely upload your medical prescription here. Once uploaded, you can search for your medicine below to complete the reservation.</p>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzoneActive' : ''}`}>
          <input {...getInputProps()} />
          <Upload size={30} className="dropzoneIcon" />
          <div className="dropzoneText">{isDragActive ? 'Drop here...' : 'Click or drag your prescription file here'}</div>
          <div className="dropzoneSub">Supports JPG, PNG, PDF up to 5MB</div>
          {prescFile && (
            <div className="dropzonePreview">
              <CheckCircle size={14} style={{ marginRight: 6 }} /> {prescFile.name}
              <button onClick={e => { e.stopPropagation(); setPrescFile(null) }}
                style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: 8, cursor: 'pointer', fontSize: 13 }}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && medicines.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <Search size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>{t('noMedicinesFound')} "<strong>{query}</strong>". {t('tryDifferent')}</p>
        </div>
      )}

      {medicines.length > 0 && !selectedMed && (
        <>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 14 }}>
            {t('found')} {medicines.length} {medicines.length !== 1 ? t('medicines2') : t('medicine')} {t('tapToSeePharmacies')}
          </div>
          <div className="medicinesGrid">
            {medicines.map((med, i) => (
              <div key={i} className="medicineCard" onClick={() => handleSelectMedicine(med)}>
                <div className="medicineCardIcon"><Pill size={22} /></div>
                <div className="medicineCardName">{med.name}</div>
                <div className="medicineCardGeneric">{med.genericName || med.category || ''}</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span className={`badge ${med.requiresPrescription ? 'badgeOrange' : 'badgeGreen'}`}>
                    {med.requiresPrescription ? t('prescriptionNeededBadge') : t('overTheCounter')}
                  </span>
                  {med.category && <span className="badge badgeBlue">{med.category}</span>}
                </div>
                {med.requiresPrescription && !prescFile && (
                  <div className="prescNeeded"><AlertCircle size={13} /> {t('prescriptionNeeded')}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pharmacy List */}
      {selectedMed && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '14px 16px', background: '#f0fdfa', borderRadius: 14, border: '1.5px solid #99f6e4' }}>
            <Pill size={22} style={{ color: '#0d9488', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{selectedMed.name}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{selectedMed.genericName} · {selectedMed.requiresPrescription ? '📋 Rx' : 'OTC'}</div>
            </div>
            <button className="btn btnGhost btnSm" onClick={() => { setSelectedMed(null); setPharmacies([]) }}>
              <X size={14} /> Clear
            </button>
          </div>

          {selectedMed.requiresPrescription && !prescFile && (
            <div style={{ background: '#fff7ed', border: '1.5px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>{t('prescriptionRequired')}</div>
                <div style={{ color: '#78350f', fontSize: 13 }}>{t('prescriptionRequiredMsg')}</div>
              </div>
            </div>
          )}

          <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} style={{ color: '#0d9488' }} />
            {userLocation ? 'Nearest Pharmacies' : 'Available Pharmacies'}
          </div>

          {loadingPharmacies ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              {t('loadingPharmacies')}
            </div>
          ) : pharmacies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <Building2 size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No pharmacies have this medicine right now.</p>
            </div>
          ) : (
            <div className="pharmacyList">
              {pharmacies.map((ph, i) => (
                <div key={i} className="pharmacyItem">
                  <div className="pharmacyInfo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div className="pharmacyName">{ph.name}</div>
                      {i === 0 && userLocation && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{t('nearest')}</span>}
                    </div>
                    <div className="pharmacyAddr"><MapPin size={11} style={{ marginRight: 4, flexShrink: 0 }} />{ph.address || ph.city || 'Local pharmacy'}</div>
                    {ph.phone && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>📞 {ph.phone}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {ph.price && <div className="pharmacyPrice">₹{ph.price}</div>}
                    {ph.distanceKm != null && (
                      <div className="pharmacyDistance">📍 {ph.distanceKm} {t('kmAway')}</div>
                    )}
                    <button className="btn btnPrimary btnSm" style={{ marginTop: 8 }}
                      onClick={() => openReserve(ph)}
                      disabled={selectedMed.requiresPrescription && !prescFile}>
                      {t('reserve')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reserve Modal */}
      <Modal open={reserveModal} onClose={() => setReserveModal(false)} title={t('confirmReservation')} size="md">
        {selectedMed && selectedPharmacy && (
          <div>
            <div style={{ background: '#f0fdfa', borderRadius: 12, padding: 16, marginBottom: 18, display: 'flex', gap: 12 }}>
              <Pill size={24} style={{ color: '#0d9488', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{selectedMed.name}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>at {selectedPharmacy.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label>{t('quantity')}</label>
                <input type="number" className="input" min={1} max={100} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>{t('notesToPharmacy')}</label>
                <textarea className="textarea" placeholder={t('specialInstructions')} value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </div>
              {prescFile && (
                <div style={{ background: '#f0fdfa', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <CheckCircle size={16} style={{ color: '#0d9488' }} />
                  <span style={{ fontWeight: 700, color: '#0d9488' }}>{t('prescriptionAttached')} {prescFile.name}</span>
                </div>
              )}
            </div>
            <div className="formActions">
              <button className="btn btnGhost" onClick={() => setReserveModal(false)}>{t('cancel')}</button>
              <button className="btn btnPrimary" onClick={handleReserve} disabled={reserving}>
                {reserving ? t('reserving') : t('confirmReservationBtn')}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
