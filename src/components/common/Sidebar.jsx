import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Pill, LogOut, Menu, X, Bell, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { LanguageSwitcherSidebar } from './LanguageSwitcher'
import toast from 'react-hot-toast'
import styles from './Sidebar.module.css'

export default function Sidebar({ navItems, role, alerts = [] }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success(t('loggedOut'))
    navigate('/login')
  }

  const roleLabels = {
    superadmin: t('superAdmin'),
    admin: t('pharmacy'),
    user: t('patient'),
  }
  const roleLabel = roleLabels[role] || t('patient')

  const SidebarContent = ({ onLinkClick }) => (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarTop}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Pill size={20} />
          </div>
          {!collapsed && <span className={styles.brandText}>{t('appName')}</span>}
        </div>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onLinkClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
          >
            <span className={styles.navIcon}><item.icon size={20} /></span>
            {!collapsed && (
              <span className={styles.navLabel}>
                {t(item.labelKey) || item.label}
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {alerts.length > 0 && !collapsed && (
        <div className={styles.alertsSection}>
          <div className={styles.alertsTitle}><Bell size={14} /> Alerts</div>
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={styles.alertItem}>{a}</div>
          ))}
        </div>
      )}

      {!collapsed && <LanguageSwitcherSidebar />}

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={18} />
        {!collapsed && <span>{t('logout')}</span>}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <div className={styles.mobileBrandIcon}>
            <Pill size={16} />
          </div>
          <span className={styles.mobileBrandText}>{t('appName')}</span>
        </div>
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />}

      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>
        <SidebarContent onLinkClick={() => {}} />
      </div>

      {/* Mobile sidebar drawer */}
      <div className={`${styles.mobileSidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <SidebarContent onLinkClick={() => setMobileOpen(false)} />
      </div>
    </>
  )
}
