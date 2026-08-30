import React, { useEffect, useState } from 'react'
import { getEstimates, getServiceRequests, createEstimate } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import StatusBadge from '../components/StatusBadge'
import FormField, { Input, Select, Textarea } from '../components/FormField'
import { Plus, DollarSign, X } from 'lucide-react'

const EMPTY = { service_request_id: '', labor_cost: '', parts_cost: '', estimated_hours: '', parts_details: [], labor_details: [], notes: '' }

export default function Estimates() {
  const [estimates, setEstimates] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [newPart, setNewPart] = useState({ name: '', cost: '' })
  const [newLabor, setNewLabor] = useState({ description: '', hours: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => Promise.all([
    getEstimates(),
    getServiceRequests({ status: 'estimate_pending' })
  ]).then(([e, sr]) => { setEstimates(e.data); setPendingRequests(sr.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const total = (parseFloat(form.labor_cost) || 0) + (parseFloat(form.parts_cost) || 0)

  const addPart = () => {
    if (!newPart.name || !newPart.cost) return
    setForm(f => ({ ...f, parts_details: [...f.parts_details, { ...newPart, cost: parseFloat(newPart.cost) }] }))
    const newCost = ((parseFloat(form.parts_cost) || 0) + parseFloat(newPart.cost)).toFixed(2)
    setForm(f => ({ ...f, parts_cost: newCost }))
    setNewPart({ name: '', cost: '' })
  }

  const addLabor = () => {
    if (!newLabor.description || !newLabor.hours) return
    const hrs = parseFloat(newLabor.hours)
    const laborCostForHours = (hrs * 75).toFixed(2) // $75/hr default
    setForm(f => ({ ...f, labor_details: [...f.labor_details, { ...newLabor, hours: hrs }] }))
    const newCost = ((parseFloat(form.labor_cost) || 0) + parseFloat(laborCostForHours)).toFixed(2)
    setForm(f => ({ ...f, labor_cost: newCost, estimated_hours: ((parseFloat(f.estimated_hours) || 0) + hrs).toString() }))
    setNewLabor({ description: '', hours: '' })
  }

  const handleSave = async () => {
    if (!form.service_request_id || !form.labor_cost || !form.parts_cost) { setError('Service request, labor cost and parts cost are required.'); return }
    setSaving(true); setError('')
    try {
      await createEstimate({ ...form, labor_cost: parseFloat(form.labor_cost), parts_cost: parseFloat(form.parts_cost), estimated_hours: parseFloat(form.estimated_hours) || 0 })
      setModal(false); setForm(EMPTY); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    setSaving(false)
  }

  const columns = [
    { key: 'service_type', label: 'Service', render: (v) => <strong>{v}</strong> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'make', label: 'Vehicle', render: (_, r) => `${r.year} ${r.make} ${r.model}` },
    { key: 'labor_cost', label: 'Labor', render: (v) => `$${parseFloat(v).toFixed(2)}` },
    { key: 'parts_cost', label: 'Parts', render: (v) => `$${parseFloat(v).toFixed(2)}` },
    { key: 'total_cost', label: 'Total', render: (v) => <strong style={{ color: 'var(--primary)' }}>${parseFloat(v).toFixed(2)}</strong> },
    { key: 'estimated_hours', label: 'Est. Hours', render: (v) => `${v}h` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Created', render: (v) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div>
      <PageHeader
        title="Service Estimates"
        subtitle={`${estimates.length} estimates created`}
        action={<Btn onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}><Plus size={15} /> Create Estimate</Btn>}
      />
      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={estimates} emptyMessage="No estimates created yet." />}
      </Card>

      {modal && (
        <Modal title="Create Service Estimate" onClose={() => setModal(false)} size="xl">
          <FormField label="Service Request" required>
            <Select value={form.service_request_id} onChange={e => setForm({ ...form, service_request_id: e.target.value })}>
              <option value="">Select service request...</option>
              {pendingRequests.map(r => <option key={r.id} value={r.id}>{r.service_type} — {r.customer_name} ({r.year} {r.make} {r.model})</option>)}
            </Select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            {/* Parts */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Parts</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Input value={newPart.name} onChange={e => setNewPart({ ...newPart, name: e.target.value })} placeholder="Part name" style={{ flex: 2 }} />
                <Input type="number" value={newPart.cost} onChange={e => setNewPart({ ...newPart, cost: e.target.value })} placeholder="$" style={{ flex: 1 }} min="0" />
                <Btn variant="secondary" size="sm" onClick={addPart}>Add</Btn>
              </div>
              {form.parts_details.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f8fafc', borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
                  <span>{p.name}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>${parseFloat(p.cost).toFixed(2)}</span>
                    <button onClick={() => setForm(f => ({ ...f, parts_details: f.parts_details.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={12} /></button>
                  </div>
                </div>
              ))}
              <FormField label="Total Parts Cost ($)" required style={{ marginTop: 8 }}>
                <Input type="number" value={form.parts_cost} onChange={e => setForm({ ...form, parts_cost: e.target.value })} min="0" step="0.01" />
              </FormField>
            </div>

            {/* Labor */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Labor ($75/hr default)</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Input value={newLabor.description} onChange={e => setNewLabor({ ...newLabor, description: e.target.value })} placeholder="Labor description" style={{ flex: 2 }} />
                <Input type="number" value={newLabor.hours} onChange={e => setNewLabor({ ...newLabor, hours: e.target.value })} placeholder="hrs" style={{ flex: 1 }} min="0" step="0.5" />
                <Btn variant="secondary" size="sm" onClick={addLabor}>Add</Btn>
              </div>
              {form.labor_details.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f8fafc', borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
                  <span>{l.description}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{l.hours}h</span>
                    <button onClick={() => setForm(f => ({ ...f, labor_details: f.labor_details.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={12} /></button>
                  </div>
                </div>
              ))}
              <FormField label="Total Labor Cost ($)" required style={{ marginTop: 8 }}>
                <Input type="number" value={form.labor_cost} onChange={e => setForm({ ...form, labor_cost: e.target.value })} min="0" step="0.01" />
              </FormField>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Estimated Hours">
              <Input type="number" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} min="0" step="0.5" />
            </FormField>
            <div style={{ display: 'flex', alignItems: 'center', background: '#eff6ff', borderRadius: 8, padding: '12px 16px', marginTop: 22 }}>
              <DollarSign size={18} style={{ color: 'var(--primary)', marginRight: 8 }} />
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Estimate</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <FormField label="Notes">
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes or conditions..." rows={2} />
          </FormField>

          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Create Estimate'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
