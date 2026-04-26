import React from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Search, ClipboardList, UserCircle } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import styles from './User.module.css'

const navItems = [
  { path: '/user', labelKey: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/user/search', labelKey: 'searchMedicines', label: 'Search Medicines', icon: Search },
  { path: '/user/reservations', labelKey: 'myReservations', label: 'My Reservations', icon: ClipboardList },
  { path: '/user/profile', labelKey: 'profile', label: 'My Profile', icon: UserCircle },
]

export default function UserLayout() {
  return (
    <div className="layout">
      <Sidebar navItems={navItems} role="user" />
      <main className="main">
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
