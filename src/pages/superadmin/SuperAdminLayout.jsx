import React from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, Pill, UserCircle } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import styles from './SuperAdmin.module.css'

const navItems = [
  { path: '/superadmin', labelKey: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/superadmin/pharmacies', labelKey: 'pharmacies', label: 'Pharmacies', icon: Building2 },
  { path: '/superadmin/medicines', labelKey: 'medicines', label: 'Medicines', icon: Pill },
  { path: '/superadmin/profile', labelKey: 'profile', label: 'My Profile', icon: UserCircle },
]

export default function SuperAdminLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar navItems={navItems} role="superadmin" />
      <main className={styles.main}>
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
