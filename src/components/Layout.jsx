import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, ClipboardList, Wrench,
  Search, FileText, DollarSign, Clock, Bell, Star,
  Menu, X, ChevronRight, Gauge
} from 'lucide-react'
import './Layout.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/vehicles', label: 'Vehicles', icon: Car },
  { path: '/service-requests', label: 'Service Requests', icon: ClipboardList },
  { path: '/technicians', label: 'Technicians', icon: Wrench },
  { path: '/inspections', label: 'Inspections', icon: Search },
  { path: '/estimates', label: 'Estimates', icon: DollarSign },
  { path: '/sla-tracking', label: 'SLA Tracking', icon: Clock },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/feedback', label: 'Feedback', icon: Star },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const currentPage = navItems.find(n => location.pathname.startsWith(n.path))

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Gauge size={22} /></div>
          {sidebarOpen && <span className="brand-text">VSMS</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-root">VSMS</span>
              {currentPage && (
                <>
                  <ChevronRight size={14} className="breadcrumb-sep" />
                  <span className="breadcrumb-current">{currentPage.label}</span>
                </>
              )}
            </div>
          </div>
          <div className="header-right">
            <div className="header-badge">
              <Gauge size={16} />
              <span>Vehicle Service Management</span>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
