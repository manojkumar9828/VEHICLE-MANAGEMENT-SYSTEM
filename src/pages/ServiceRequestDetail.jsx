import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getServiceRequest, updateServiceRequestStatus, getTechnicians, approveEstimate, submitFeedback } from '../api'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import Btn from '../components/Btn'
import Modal from '../components/Modal'
import FormField, { Select, Textarea, Input } from '../components/FormField'
import { ArrowLeft, User, Car, Wrench, FileText, DollarSign, Star, CheckCircle, XCircle } from 'lucide-react'

export default function ServiceRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sr, setSr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [technicians, setTechnicians] = useState([])
  const [modal, setModal] = useState(null)
  const [techId, setTechId] = useState('')
  const [feedback, setFeedback] = useState({ rating: 5, comments: '' })
  const [saving, setSaving] = useState(false)

  const load = () => getServiceRequest(id).then(r => { setSr(r.data); setLoading(false) })
  useEffect(() => { load(); getTechnicians().then(r => setTechnicians(r.data)) }, [id])

  const setStatus = async (status, technicianId) => {
    setSaving(true)
    await updateServiceRequestStatus(id, { status, technician_id: technicianId })
    load(); setSaving(false); setModal(null)
  }

  const handleApprove = async (approved) => {
    setSaving(true)
    await approveEstimate(id, { approved })
    load(); setSaving(false)
  }

  const handleFeedback = async () => {
    setSaving(true)
    await submitFeedback({ service_request_id: id, customer_id: sr.customer_id, ...feedback })
    load(); setSaving(false); setModal(null)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!sr) return <div style={{ padding: 40, textAlign: 'center' }}>Not found.</div>

  const canAssign = sr.status === 'submitted' || sr.status === 'estimate_approved'
  const canInspect = sr.status === 'submitted' || sr.status === 'inspecting'
  const canComplete = sr.status === 'in_progress'
  const showApproval = sr.status === 'estimate_pending' && sr.estimate
  const canFeedback = sr.status === 'completed' && !sr.feedback

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Btn variant="secondary" onClick={() => navigate('/service-requests')}><ArrowLeft size={14} /> Back</Btn>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{sr.service_type}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Request ID: {sr.id}</p>
        </div>
        <StatusBadge status={sr.status} size="md" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Customer & Vehicle */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><User size={15} /> Customer</h3>
          <p style={{ fontWeight: 600 }}>{sr.customer_name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{sr.customer_email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{sr.customer_phone}</p>
        </Card>
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Car size={15} /> Vehicle</h3>
          <p style={{ fontWeight: 600 }}>{sr.year} {sr.make} {sr.model}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Plate: {sr.license_plate} | {sr.vehicle_type}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mileage: {sr.mileage?.toLocaleString()} mi | {sr.color}</p>
        </Card>
      </div>

      {/* Service Details */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={15} /> Service Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority</p><StatusBadge status={sr.priority} /></div>
          <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</p><StatusBadge status={sr.status} /></div>
          <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Technician</p><p style={{ fontWeight: 500, fontSize: 13 }}>{sr.technician_name || 'Unassigned'}</p></div>
          <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submitted</p><p style={{ fontSize: 13 }}>{new Date(sr.created_at).toLocaleString()}</p></div>
          <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>SLA Due</p><p style={{ fontSize: 13 }}>{sr.sla_due_date ? new Date(sr.sla_due_date).toLocaleString() : '—'}</p></div>
          {sr.completed_date && <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed</p><p style={{ fontSize: 13 }}>{new Date(sr.completed_date).toLocaleString()}</p></div>}
        </div>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Description</p>
          <p style={{ fontSize: 14, background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>{sr.description}</p>
        </div>
      </Card>

      {/* Inspection Report */}
      {sr.inspection && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>Inspection Report</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Condition</p><StatusBadge status={sr.inspection.overall_condition} /></div>
          </div>
          <p style={{ fontSize: 13, marginBottom: 8 }}><strong>Notes:</strong> {sr.inspection.inspector_notes}</p>
          {sr.inspection.findings?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Findings:</p>
              <ul style={{ paddingLeft: 20 }}>
                {sr.inspection.findings.map((f, i) => <li key={i} style={{ fontSize: 13, marginBottom: 2 }}>{f}</li>)}
              </ul>
            </div>
          )}
          {sr.inspection.recommended_services?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Recommended Services:</p>
              <ul style={{ paddingLeft: 20 }}>
                {sr.inspection.recommended_services.map((s, i) => <li key={i} style={{ fontSize: 13, marginBottom: 2 }}>{s}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Estimate */}
      {sr.estimate && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={15} /> Service Estimate</h3>
            <StatusBadge status={sr.estimate.status} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Labor Cost</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>${parseFloat(sr.estimate.labor_cost).toFixed(2)}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Parts Cost</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>${parseFloat(sr.estimate.parts_cost).toFixed(2)}</p>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Cost</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>${parseFloat(sr.estimate.total_cost).toFixed(2)}</p>
            </div>
          </div>
          <p style={{ fontSize: 13 }}>Estimated time: <strong>{sr.estimate.estimated_hours} hours</strong></p>
          {sr.estimate.notes && <p style={{ fontSize: 13, marginTop: 4 }}>Notes: {sr.estimate.notes}</p>}
        </Card>
      )}

      {/* Estimate Approval */}
      {showApproval && (
        <Card style={{ padding: 20, marginBottom: 16, border: '2px solid var(--warning)', background: '#fffbeb' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Customer Approval Required</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Total estimate: <strong>${parseFloat(sr.estimate.total_cost).toFixed(2)}</strong>. Customer approval is required to proceed.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="success" onClick={() => handleApprove(true)} disabled={saving}><CheckCircle size={14} /> Approve Estimate</Btn>
            <Btn variant="danger" onClick={() => handleApprove(false)} disabled={saving}><XCircle size={14} /> Reject Estimate</Btn>
          </div>
        </Card>
      )}

      {/* Feedback */}
      {sr.feedback && (
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Star size={15} /> Customer Feedback</h3>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={20} fill={s <= sr.feedback.rating ? '#f59e0b' : 'none'} color={s <= sr.feedback.rating ? '#f59e0b' : '#cbd5e1'} />)}
            <span style={{ marginLeft: 8, fontWeight: 600 }}>{sr.feedback.rating}/5</span>
          </div>
          {sr.feedback.comments && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{sr.feedback.comments}</p>}
        </Card>
      )}

      {/* Actions */}
      <Card style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Actions:</p>
        {canInspect && <Btn variant="secondary" onClick={() => setStatus('inspecting')}>Start Inspection</Btn>}
        {canAssign && (
          <Btn variant="primary" onClick={() => setModal('assign')}><Wrench size={14} /> Assign Technician</Btn>
        )}
        {sr.status === 'estimate_approved' && (
          <Btn variant="primary" onClick={() => setStatus('in_progress')}>Start Service</Btn>
        )}
        {canComplete && <Btn variant="success" onClick={() => setStatus('completed')}><CheckCircle size={14} /> Mark Complete</Btn>}
        {canFeedback && <Btn variant="secondary" onClick={() => setModal('feedback')}><Star size={14} /> Submit Feedback</Btn>}
        {sr.status !== 'cancelled' && sr.status !== 'completed' && (
          <Btn variant="danger" onClick={() => setStatus('cancelled')}>Cancel Request</Btn>
        )}
      </Card>

      {/* Assign Technician Modal */}
      {modal === 'assign' && (
        <Modal title="Assign Technician" onClose={() => setModal(null)}>
          <FormField label="Select Technician">
            <Select value={techId} onChange={e => setTechId(e.target.value)}>
              <option value="">Choose technician...</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialization} ({t.status})</option>)}
            </Select>
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={() => setStatus('in_progress', techId)} disabled={!techId || saving}>Assign & Start</Btn>
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {modal === 'feedback' && (
        <Modal title="Submit Feedback" onClose={() => setModal(null)}>
          <FormField label="Rating">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setFeedback({ ...feedback, rating: s })} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star size={28} fill={s <= feedback.rating ? '#f59e0b' : 'none'} color={s <= feedback.rating ? '#f59e0b' : '#cbd5e1'} />
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Comments">
            <Textarea value={feedback.comments} onChange={e => setFeedback({ ...feedback, comments: e.target.value })} placeholder="Share your experience..." rows={3} />
          </FormField>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={handleFeedback} disabled={saving}>{saving ? 'Submitting...' : 'Submit'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
