import React, { useEffect, useState } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Btn from '../components/Btn'
import FormField, { Input } from '../components/FormField'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'

const EMPTY = { name: '', email: '', phone: '', address: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => getCustomers().then(r => { setCustomers(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('add') }
  const openEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address }); setEditing(c); setError(''); setModal('edit') }

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) { setError('Name, email, and phone are required.'); return }
    setSaving(true); setError('')
    try {
      if (editing) await updateCustomer(editing.id, form)
      else await createCustomer(form)
      setModal(null); load()
    } catch (e) { setError(e.response?.data?.error || 'Failed to save') }
    setSaving(false)
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete customer "${c.name}"? This cannot be undone.`)) return
    await deleteCustomer(c.id); load()
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <strong>{v}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address', render: (v) => v || '—' },
    { key: 'vehicle_count', label: 'Vehicles', render: (v) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{v}</span> },
    { key: 'created_at', label: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
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
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered customers`}
        action={<Btn onClick={openAdd}><Plus size={15} /> Add Customer</Btn>}
      />
      <Card>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          : <Table columns={columns} data={customers} emptyMessage="No customers yet. Add your first customer." />}
      </Card>

      {modal && (
        <Modal title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setModal(null)}>
          <FormField label="Full Name" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" /></FormField>
          <FormField label="Email" required><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@email.com" /></FormField>
          <FormField label="Phone" required><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="555-0100" /></FormField>
          <FormField label="Address"><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" /></FormField>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
