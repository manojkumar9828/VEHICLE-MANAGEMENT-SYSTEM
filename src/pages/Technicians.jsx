import React, { useEffect, useState } from 'react'
import { getTechnicians, createTechnician, updateTechnician } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import StatusBadge from '../components/StatusBadge'
import FormField, { Input, Select } from '../components/FormField'
import { Plus, Edit2, Wrench } from 'lucide-react'

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Electric', 'Hybrid', 'Motorcycle']
const SPECIALIZATIONS = ['Engine & Transmission', 'Electrical Systems', 'Brakes & Suspension', 'Body & Paint', 'AC & Heating', 'Tires & Wheels', 'General Maintenance', 'Diagnostic']
const EMPTY = { name: '', email: '', phone: '', specialization: '', vehicle_types: [], status: 'available' }

export default function Technicians() {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => getTechnicians().then(r => { setTechnicians(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true) }
  const openEdit = (t) => { setForm({ name: t.name, email: t.email, phone: t.phone, specialization: t.specialization, vehicle_types: t.vehicle_types, status: t.status }); setEditing(t); setError(''); setModal(true) }

  const toggleVehicleType = (type) => {
    setForm(f => ({ ...f, vehicle_types: f.vehicle_types.includes(type) ? f.vehicle_types.filter(t => t !== type) : [...f.vehicle_types, type] }))
  }

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.specialization) { setError('All required fields must be filled.'); return }
    setSaving(true); setError('')
    try {
      if (editing) await updateTechnician(editing.id, form)
      else await createTechnician(form)
      setModal(false); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    setSaving(false)
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <strong>{v}</strong> },
    { key: 'specialization', label: 'Specialization' },
    { key: 'vehicle_types', label: 'Vehicle Types', render: (v) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(Array.isArray(v) ? v : []).map(t => <span key={t} style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>{t}</span>)}
      </div>
    )},
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'active_jobs', label: 'Active Jobs', render: (v) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{v}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions', label: '', render: (_, row) => (
        <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(row) }}><Edit2 size={13} /></Btn>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Technicians" subtitle={`${technicians.length} technicians`} action={<Btn onClick={openAdd}><Plus size={15} /> Add Technician</Btn>} />
      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={technicians} emptyMessage="No technicians registered yet." />}
      </Card>

      {modal && (
        <Modal title={editing ? 'Edit Technician' : 'Add Technician'} onClose={() => setModal(false)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Full Name" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Mike Johnson" /></FormField>
            <FormField label="Email" required><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="mike@vsms.com" /></FormField>
            <FormField label="Phone" required><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="555-0200" /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="off_duty">Off Duty</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Specialization" required>
            <Select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
              <option value="">Select specialization...</option>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FormField>
          <FormField label="Vehicle Types">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VEHICLE_TYPES.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 10px', borderRadius: 6, border: `1px solid ${form.vehicle_types.includes(type) ? 'var(--primary)' : 'var(--border)'}`, background: form.vehicle_types.includes(type) ? '#eff6ff' : '#fff', fontSize: 13 }}>
                  <input type="checkbox" checked={form.vehicle_types.includes(type)} onChange={() => toggleVehicleType(type)} style={{ cursor: 'pointer' }} />
                  {type}
                </label>
              ))}
            </div>
          </FormField>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Technician'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
