# MedConnect – Pharmacy Management Frontend

A full-featured React Vite frontend for a pharmacy reservation and management system.

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── auth/            # Login & Register
│   ├── superadmin/      # SuperAdmin dashboard (pharmacies, medicines view)
│   ├── admin/           # Admin dashboard (inventory, medicines CRUD, reservations)
│   └── user/            # User dashboard (search, reserve, prescription upload)
├── components/
│   └── common/          # Sidebar, Modal, DataTable, StatCard
├── context/             # AuthContext (JWT, role-based routing)
├── services/            # Axios API service (all endpoints wired)
└── index.css            # Global styles + CSS variables
```

---

## 👥 Roles & Access

| Role | Login | Capabilities |
|------|-------|-------------|
| `superadmin` | superadmin login | Full CRUD on pharmacies, View medicines |
| `admin` | admin login | CRUD inventory & medicines, View/update reservations, View prescriptions |
| `user` | user login | Search medicines, Reserve, Upload prescriptions, Delete own reservations |

---

## 🔌 API Integration

All API calls go to `http://localhost:5000/api`. Change in `src/services/api.js`.

| Feature | Endpoint used |
|---------|--------------|
| Login | `POST /auth/login` |
| Register | `POST /auth/register` |
| Pharmacies | `GET/POST/PUT/DELETE /pharmacies` |
| Medicines | `GET/POST/PUT/DELETE /medicines` |
| Inventory | `GET/POST/PUT/DELETE /inventory` |
| Low Stock | `GET /inventory/alerts/low-stock` |
| Reservations | `GET/POST/PUT/DELETE /reservations` |
| My Reservations | `GET /reservations/my` |
| Update Status | `PUT /reservations/:id/status` |
| Upload Prescription | `POST /reservations/:id/prescription` |
| View Prescription | `GET /reservations/:id/prescription` |
| Nearby search | `GET /medicines/search/nearby` |

---

## 🎨 Design System

- **Colors**: Teal primary (#0d9488) for health trust, Amber for admin actions, Indigo for super-admin
- **Typography**: Merriweather for headings, Nunito for body text (accessible, clear, senior-friendly)
- **Font size**: 14–16px body, never below 13px — readable for all ages
- **Accessibility**: High contrast ratios, large click targets, clear status badges

---

## ✨ Key Features

- ✅ Role-based routing (superadmin / admin / user)
- ✅ JWT auth with localStorage
- ✅ Medicine search with AI suggestions (e.g. "paracetamol → Dolo 650")
- ✅ Prescription upload via drag & drop
- ✅ Nearest pharmacies shown first
- ✅ Prescription-required gate (can't reserve without uploading)
- ✅ Low-stock alerts on admin sidebar & dashboard
- ✅ Reservation status workflow (pending → confirmed → success / rejected)
- ✅ Pharmacy can view prescription only after completion
- ✅ Paginated, searchable data tables
- ✅ Fully responsive (mobile + desktop)
