import React, { useEffect, useState } from 'react'
import { getVehicles, getCustomers, createVehicle, updateVehicle, deleteVehicle } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import FormField, { Input, Select } from '../components/FormField'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Electric', 'Hybrid', 'Motorcycle', 'Other']
const EMPTY = { customer_id: '', make: '', model: '', year: new Date().getFullYear(), vin: '', license_plate: '', color: '', mileage: 0, vehicle_type: 'Sedan' }

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => Promise.all([getVehicles(), getCustomers()]).then(([v, c]) => { setVehicles(v.data); setCustomers(c.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('form') }
  const openEdit = (v) => {
    setForm({ customer_id: v.customer_id, make: v.make, model: v.model, year: v.year, vin: v.vin, license_plate: v.license_plate, color: v.color, mileage: v.mileage, vehicle_type: v.vehicle_type })
    setEditing(v); setError(''); setModal('form')
  }

  const handleSave = async () => {
    if (!form.customer_id || !form.make || !form.model || !form.vin || !form.license_plate) { setError('All required fields must be filled.'); return }
    setSaving(true); setError('')
    try {
      if (editing) await updateVehicle(editing.id, form)
      else await createVehicle(form)
      setModal(null); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async (v) => {
    if (!confirm(`Delete ${v.year} ${v.make} ${v.model}?`)) return
    await deleteVehicle(v.id); load()
  }

  const columns = [
    { key: 'make', label: 'Vehicle', render: (_, r) => <strong>{r.year} {r.make} {r.model}</strong> },
    { key: 'vehicle_type', label: 'Type', render: (v) => <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{v}</span> },
    { key: 'license_plate', label: 'Plate' },
    { key: 'vin', label: 'VIN', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span> },
    { key: 'customer_name', label: 'Owner' },
    { key: 'mileage', label: 'Mileage', render: (v) => `${v?.toLocaleString()} mi` },
    { key: 'color', label: 'Color', render: (v) => v || '—' },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEdit(row) }}><Edit2 size={13} /></Btn>
          <Btn size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(row) }}><Trash2 size={13} /></Btn>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Vehicles" subtitle={`${vehicles.length} registered vehicles`} action={<Btn onClick={openAdd}><Plus size={15} /> Register Vehicle</Btn>} />
      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={vehicles} emptyMessage="No vehicles registered yet." />}
      </Card>

      {modal === 'form' && (
        <Modal title={editing ? 'Edit Vehicle' : 'Register Vehicle'} onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Owner" required style={{ gridColumn: '1/-1' }}>
              <Select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Make" required><Input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="Toyota" /></FormField>
            <FormField label="Model" required><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Camry" /></FormField>
            <FormField label="Year" required><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} min="1900" max={new Date().getFullYear() + 1} /></FormField>
            <FormField label="Vehicle Type" required>
              <Select value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="VIN" required><Input value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} placeholder="VIN123456789" /></FormField>
            <FormField label="License Plate" required><Input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} placeholder="ABC-1234" /></FormField>
            <FormField label="Color"><Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Silver" /></FormField>
            <FormField label="Mileage"><Input type="number" value={form.mileage} onChange={e => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} min="0" /></FormField>
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Register'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
