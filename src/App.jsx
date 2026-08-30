import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Vehicles from './pages/Vehicles'
import ServiceRequests from './pages/ServiceRequests'
import ServiceRequestDetail from './pages/ServiceRequestDetail'
import Technicians from './pages/Technicians'
import Inspections from './pages/Inspections'
import Estimates from './pages/Estimates'
import SLATracking from './pages/SLATracking'
import Notifications from './pages/Notifications'
import Feedback from './pages/Feedback'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="estimates" element={<Estimates />} />
          <Route path="sla-tracking" element={<SLATracking />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
