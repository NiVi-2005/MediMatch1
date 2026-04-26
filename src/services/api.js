import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const pharmacyAPI = {
  getAll: () => api.get('/pharmacies'),
  getById: (id) => api.get(`/pharmacies/${id}`),
  create: (data) => api.post('/pharmacies', data),
  update: (id, data) => api.put(`/pharmacies/${id}`, data),
  delete: (id) => api.delete(`/pharmacies/${id}`),
}

export const medicineAPI = {
  getAll: (search) => api.get('/medicines', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  // Passes lat/lng for nearby sorting
  searchNearby: (name, location) => api.get('/medicines/search/nearby', { params: { name, ...location } }),
}

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/alerts/low-stock'),
  getHighDemand: () => api.get('/inventory/alerts/high-demand'),
}

export const reservationAPI = {
  getAll: () => api.get('/reservations'),
  getMyReservations: () => api.get('/reservations/my'),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  createWithFile: (formData) => api.post('/reservations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  delete: (id) => api.delete(`/reservations/${id}`),
  uploadPrescription: (id, formData) => api.post(`/reservations/${id}/prescription`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  viewPrescription: (id) => api.get(`/reservations/${id}/prescription`, { responseType: 'blob' }),
}

export default api
