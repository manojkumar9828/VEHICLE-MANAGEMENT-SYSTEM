import React, { useEffect, useState } from 'react'
import { getInspections, getServiceRequests, createInspection } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import StatusBadge from '../components/StatusBadge'
import FormField, { Select, Textarea, Input } from '../components/FormField'
import { Plus, X } from 'lucide-react'

const EMPTY = { service_request_id: '', inspector_notes: '', findings: [], overall_condition: 'good', recommended_services: [] }

export default function Inspections() {
  const [inspections, setInspections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [newFinding, setNewFinding] = useState('')
  const [newService, setNewService] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => Promise.all([
    getInspections(),
    getServiceRequests({ status: 'inspecting' })
  ]).then(([i, sr]) => { setInspections(i.data); setPendingRequests(sr.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.service_request_id || !form.inspector_notes || !form.overall_condition) { setError('Required fields missing.'); return }
    setSaving(true); setError('')
    try {
      await createInspection(form)
      setModal(false); setForm(EMPTY); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    setSaving(false)
  }

  const addFinding = () => { if (newFinding.trim()) { setForm(f => ({ ...f, findings: [...f.findings, newFinding.trim()] })); setNewFinding('') } }
  const addService = () => { if (newService.trim()) { setForm(f => ({ ...f, recommended_services: [...f.recommended_services, newService.trim()] })); setNewService('') } }

  const columns = [
    { key: 'service_type', label: 'Service Type', render: (v) => <strong>{v}</strong> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'make', label: 'Vehicle', render: (_, r) => `${r.year} ${r.make} ${r.model}` },
    { key: 'overall_condition', label: 'Condition', render: (v) => <StatusBadge status={v} /> },
    { key: 'inspector_notes', label: 'Notes', render: (v) => <span style={{ maxWidth: 200, overflow: 'hidden', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div>
      <PageHeader
        title="Inspections"
        subtitle={`${inspections.length} inspection reports`}
        action={<Btn onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}><Plus size={15} /> New Inspection</Btn>}
      />
      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={inspections} emptyMessage="No inspection reports yet." />}
      </Card>

      {modal && (
        <Modal title="Create Inspection Report" onClose={() => setModal(false)} size="lg">
          <FormField label="Service Request" required>
            <Select value={form.service_request_id} onChange={e => setForm({ ...form, service_request_id: e.target.value })}>
              <option value="">Select service request to inspect...</option>
              {pendingRequests.map(r => <option key={r.id} value={r.id}>{r.service_type} — {r.customer_name} ({r.year} {r.make} {r.model})</option>)}
            </Select>
            {pendingRequests.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No requests currently in "Inspecting" status. Change a request status to Inspecting first.</p>}
          </FormField>
          <FormField label="Overall Condition" required>
            <Select value={form.overall_condition} onChange={e => setForm({ ...form, overall_condition: e.target.value })}>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="critical">Critical</option>
            </Select>
          </FormField>
          <FormField label="Inspector Notes" required>
            <Textarea value={form.inspector_notes} onChange={e => setForm({ ...form, inspector_notes: e.target.value })} placeholder="General notes about the vehicle's condition..." rows={3} />
          </FormField>
          <FormField label="Findings">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input value={newFinding} onChange={e => setNewFinding(e.target.value)} placeholder="Add finding..." onKeyDown={e => e.key === 'Enter' && addFinding()} />
              <Btn variant="secondary" onClick={addFinding}>Add</Btn>
            </div>
            {form.findings.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#fef9f0', borderRadius: 4, marginBottom: 4, fontSize: 13 }}>
                <span style={{ flex: 1 }}>• {f}</span>
                <button onClick={() => setForm(prev => ({ ...prev, findings: prev.findings.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={13} /></button>
              </div>
            ))}
          </FormField>
          <FormField label="Recommended Services">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input value={newService} onChange={e => setNewService(e.target.value)} placeholder="Add recommended service..." onKeyDown={e => e.key === 'Enter' && addService()} />
              <Btn variant="secondary" onClick={addService}>Add</Btn>
            </div>
            {form.recommended_services.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f0fdf4', borderRadius: 4, marginBottom: 4, fontSize: 13 }}>
                <span style={{ flex: 1 }}>✓ {s}</span>
                <button onClick={() => setForm(prev => ({ ...prev, recommended_services: prev.recommended_services.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={13} /></button>
              </div>
            ))}
          </FormField>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Submit Inspection'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
