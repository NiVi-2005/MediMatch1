import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, Pill, ClipboardList, UserCircle } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import { inventoryAPI } from '../../services/api'
import styles from './Admin.module.css'

export default function AdminLayout() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    inventoryAPI.getLowStock()
      .then(res => {
        const items = res.data?.items || res.data || []
        setAlerts(items.slice(0, 5).map(i => `Low stock: ${i.medicineName || i.name} (${i.quantity} left)`))
      })
      .catch(() => {})
  }, [])

  const navItems = [
    { path: '/admin', labelKey: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/inventory', labelKey: 'inventory', label: 'Inventory', icon: Package },
    { path: '/admin/medicines', labelKey: 'medicines', label: 'Medicines', icon: Pill },
    { path: '/admin/reservations', labelKey: 'reservations', label: 'Reservations', icon: ClipboardList },
    { path: '/admin/profile', labelKey: 'profile', label: 'My Profile', icon: UserCircle },
  ]

  return (
    <div className={styles.layout}>
      <Sidebar navItems={navItems} role="admin" alerts={alerts} />
      <main className={styles.main}>
        <TopBar alerts={alerts} />
        <Outlet />
      </main>
    </div>
  )
}
