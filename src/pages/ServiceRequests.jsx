import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServiceRequests, getCustomers, getVehicles, createServiceRequest } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import StatusBadge from '../components/StatusBadge'
import FormField, { Input, Select, Textarea } from '../components/FormField'
import { Plus, Filter } from 'lucide-react'

const SERVICE_TYPES = ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'Transmission Service', 'Electrical Repair', 'AC Service', 'Suspension Repair', 'Body Work', 'General Inspection', 'Warranty Repair', 'Other']
const EMPTY = { customer_id: '', vehicle_id: '', service_type: '', description: '', priority: 'normal', scheduled_date: '' }

export default function ServiceRequests() {
  const [requests, setRequests] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()

  const load = () => Promise.all([getServiceRequests({ status: statusFilter || undefined }), getCustomers(), getVehicles()])
    .then(([sr, c, v]) => { setRequests(sr.data); setCustomers(c.data); setVehicles(v.data); setLoading(false) })
  useEffect(() => { load() }, [statusFilter])

  const filteredVehicles = form.customer_id ? vehicles.filter(v => v.customer_id === form.customer_id) : vehicles

  const handleSave = async () => {
    if (!form.customer_id || !form.vehicle_id || !form.service_type || !form.description) { setError('All required fields must be filled.'); return }
    setSaving(true); setError('')
    try {
      await createServiceRequest(form)
      setModal(false); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to create') }
    setSaving(false)
  }

  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{v.slice(0, 8)}...</span> },
    { key: 'service_type', label: 'Service', render: (v) => <strong>{v}</strong> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'make', label: 'Vehicle', render: (_, r) => `${r.year} ${r.make} ${r.model}` },
    { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'technician_name', label: 'Technician', render: (v) => v || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span> },
    { key: 'created_at', label: 'Submitted', render: (v) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div>
      <PageHeader
        title="Service Requests"
        subtitle={`${requests.length} requests`}
        action={<Btn onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}><Plus size={15} /> New Request</Btn>}
      />

      <Card style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <Filter size={15} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Filter:</span>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="inspecting">Inspecting</option>
          <option value="estimate_pending">Estimate Pending</option>
          <option value="estimate_approved">Estimate Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Card>

      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={requests} emptyMessage="No service requests found." onRowClick={(r) => navigate(`/service-requests/${r.id}`)} />}
      </Card>

      {modal && (
        <Modal title="New Service Request" onClose={() => setModal(false)} size="lg">
          <FormField label="Customer" required>
            <Select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value, vehicle_id: '' })}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Vehicle" required>
            <Select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} disabled={!form.customer_id}>
              <option value="">Select vehicle...</option>
              {filteredVehicles.map(v => <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.license_plate})</option>)}
            </Select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Service Type" required>
              <Select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}>
                <option value="">Select type...</option>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low (72h SLA)</option>
                <option value="normal">Normal (48h SLA)</option>
                <option value="high">High (24h SLA)</option>
                <option value="urgent">Urgent (8h SLA)</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Scheduled Date">
            <Input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
          </FormField>
          <FormField label="Description" required>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue or service needed..." rows={3} />
          </FormField>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
