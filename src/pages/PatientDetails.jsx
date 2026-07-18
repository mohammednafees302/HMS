import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, FileText, Pill, TestTube, Receipt, CalendarDays, FolderOpen,
  Plus, Pencil, Trash2, Upload, Download, Eye, Loader2, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Printer, RefreshCcw, Activity, Phone, Droplet,
  Building2, Stethoscope, HeartPulse
} from 'lucide-react'
import { patientService } from '../services/patientService'
import { clinicalService } from '../services/clinicalService'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      icon: Activity,     label: 'Overview' },
  { id: 'ehr',           icon: FileText,     label: 'Health Records' },
  { id: 'prescriptions', icon: Pill,         label: 'Prescriptions' },
  { id: 'lab',           icon: TestTube,     label: 'Lab Tests' },
  { id: 'billing',       icon: Receipt,      label: 'Billing' },
  { id: 'appointments',  icon: CalendarDays, label: 'Appointments' },
  { id: 'documents',     icon: FolderOpen,   label: 'Documents' },
]

const LAB_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const LAB_CATEGORIES = ['BLOOD', 'URINE', 'STOOL', 'IMAGING', 'BIOPSY', 'MICROBIOLOGY', 'GENETIC', 'OTHER']
const DOC_CATEGORIES = ['CONSENT_FORM', 'INSURANCE', 'DISCHARGE_SUMMARY', 'REFERRAL_LETTER', 'IMAGING', 'LAB_REPORT', 'PRESCRIPTION', 'OTHER']

const STATUS_COLOR = {
  ACTIVE: '#10B981', CRITICAL: '#F43F5E', DISCHARGED: '#6366F1', DECEASED: '#78716C'
}

const LAB_STATUS_BADGE = {
  PENDING:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Pending',     icon: Clock },
  IN_PROGRESS: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: 'In Progress', icon: Loader2 },
  COMPLETED:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Completed',   icon: CheckCircle },
  CANCELLED:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'Cancelled',   icon: XCircle },
}

// ─────────────────────────────────────────────────────────
// Small reusable helpers
// ─────────────────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      {action}
    </div>
  )
}

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <Icon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>{message}</p>
      {action}
    </div>
  )
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div style={{
      padding: '16px', borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)', display: 'flex', alignItems: 'flex-start', gap: 12
    }}>
      {Icon && <Icon size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</div>
      </div>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
}

// ─────────────────────────────────────────────────────────
// Tab: Overview
// ─────────────────────────────────────────────────────────
function OverviewTab({ patient }) {
  if (!patient) return null
  const color = STATUS_COLOR[patient.status] || '#0EA5E9'
  const recentAppts = patient.appointments || []
  const activeRx    = patient.prescriptions || []
  const recentLabs  = patient.labTests || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats Row */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Visits',       value: patient.medicalRecords?.length ?? 0,  icon: FileText  },
          { label: 'Active Medications', value: activeRx.length,                       icon: Pill      },
          { label: 'Lab Tests',          value: recentLabs.length,                     icon: TestTube  },
          { label: 'Appointments',       value: recentAppts.length,                    icon: CalendarDays },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={22} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Patient Info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InfoCard label="Age"         value={patient.age}       icon={User}       />
            <InfoCard label="Gender"      value={patient.gender}    icon={User}       />
            <InfoCard label="Blood Type"  value={patient.bloodType} icon={Droplet}    />
            <InfoCard label="Phone"       value={patient.phone}     icon={Phone}      />
            <InfoCard label="Department"  value={patient.department} icon={Building2} />
            <InfoCard label="Room"        value={patient.roomNumber} icon={Activity}  />
            <InfoCard label="Admitted"    value={formatDate(patient.admittedAt)} icon={CalendarDays} />
            <InfoCard label="Status"      value={patient.status}    icon={HeartPulse} />
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Recent Appointments</h4>
            {recentAppts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No appointments yet</p>
            ) : recentAppts.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                <span>{a.doctor?.user?.name || 'Dr. Unknown'}</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatDate(a.scheduledAt)}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Pending Lab Tests</h4>
            {recentLabs.filter(l => l.status === 'PENDING' || l.status === 'IN_PROGRESS').length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No pending labs</p>
            ) : recentLabs.filter(l => l.status !== 'COMPLETED' && l.status !== 'CANCELLED').slice(0, 3).map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                <span>{l.testName}</span>
                <LabStatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Lab Status Badge
// ─────────────────────────────────────────────────────────
function LabStatusBadge({ status }) {
  const s = LAB_STATUS_BADGE[status] || LAB_STATUS_BADGE.PENDING
  const Icon = s.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px',
      borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
      color: s.color, background: s.bg,
    }}>
      <Icon size={11} /> {s.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: EHR (Medical Records)
// ─────────────────────────────────────────────────────────
function EHRTab({ patientId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ diagnosis: '', symptoms: '', chiefComplaint: '', treatmentPlan: '', notes: '', followUpDate: '', doctorName: '' })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const d = await clinicalService.getRecords(patientId)
      setRecords(d.data.records)
    } finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ diagnosis: '', symptoms: '', chiefComplaint: '', treatmentPlan: '', notes: '', followUpDate: '', doctorName: '' })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (r) => {
    setSelected(r)
    setForm({ ...r, followUpDate: r.followUpDate ? new Date(r.followUpDate).toISOString().slice(0, 10) : '' })
    setModal('edit')
  }

  const save = async () => {
    if (!form.diagnosis?.trim()) return
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.followUpDate) payload.followUpDate = null
      
      if (modal === 'add') await clinicalService.createRecord(patientId, payload)
      else await clinicalService.updateRecord(patientId, selected.id, payload)
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const del = async (r) => {
    if (window.confirm('Delete this medical record?')) {
      await clinicalService.deleteRecord(patientId, r.id)
      load()
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader2 className="spinner" size={28} style={{ margin: '0 auto 12px' }} /><div style={{ color: 'var(--text-muted)' }}>Loading records...</div></div>

  return (
    <div>
      <SectionHeader title={`Medical Records (${records.length})`} action={
        <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-ehr-btn">
          <Plus size={14} /> New Record
        </button>
      } />

      {records.length === 0 ? (
        <EmptyState icon={FileText} title="No Medical Records" message="Add the first health record for this patient." action={
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Record</button>
        } />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {records.map(r => (
            <div key={r.id} className="card" style={{ padding: 24, borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{r.diagnosis}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Visit: {formatDateTime(r.visitDate)} {r.doctorName && `· ${r.doctorName}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(r)} id={`edit-ehr-${r.id}`}><Pencil size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(r)} id={`delete-ehr-${r.id}`}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {r.chiefComplaint && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Chief Complaint</div><div style={{ fontSize: '0.875rem' }}>{r.chiefComplaint}</div></div>}
                {r.symptoms && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Symptoms</div><div style={{ fontSize: '0.875rem' }}>{r.symptoms}</div></div>}
                {r.treatmentPlan && <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Treatment Plan</div><div style={{ fontSize: '0.875rem' }}>{r.treatmentPlan}</div></div>}
                {r.notes && <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Notes</div><div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.notes}</div></div>}
                {r.followUpDate && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Follow-up</div><div style={{ fontSize: '0.875rem', color: 'var(--warning)', fontWeight: 600 }}>{formatDate(r.followUpDate)}</div></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'New Medical Record' : 'Edit Medical Record'} onClose={() => setModal(null)} onSubmit={save} submitLabel={saving ? 'Saving...' : 'Save Record'} disabled={saving}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Diagnosis *</label>
              <input className="form-input" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Primary diagnosis" id="ehr-diagnosis-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Chief Complaint</label>
              <input className="form-input" value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder="Reason for visit" id="ehr-complaint-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Symptoms</label>
              <input className="form-input" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} placeholder="Observed symptoms" id="ehr-symptoms-input" />
            </div>
            <div className="form-group full">
              <label className="form-label">Treatment Plan</label>
              <textarea className="form-input" rows={3} value={form.treatmentPlan} onChange={e => setForm(f => ({ ...f, treatmentPlan: e.target.value }))} placeholder="Recommended treatment..." id="ehr-treatment-input" />
            </div>
            <div className="form-group full">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes" id="ehr-notes-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input className="form-input" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} placeholder="Attending doctor" id="ehr-doctor-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input className="form-input" type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} id="ehr-followup-input" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: Prescriptions
// ─────────────────────────────────────────────────────────
function PrescriptionsTab({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [meds, setMeds] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const [form, setForm] = useState({ diagnosis: '', notes: '', doctorName: '', status: 'ACTIVE', validUntil: '' })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const d = await clinicalService.getPrescriptions(patientId)
      setPrescriptions(d.data.prescriptions)
    } finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setMeds([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
    setForm({ diagnosis: '', notes: '', doctorName: '', status: 'ACTIVE', validUntil: '' })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (rx) => {
    setSelected(rx)
    setMeds(Array.isArray(rx.medications) ? rx.medications : [])
    setForm({ diagnosis: rx.diagnosis || '', notes: rx.notes || '', doctorName: rx.doctorName || '', status: rx.status, validUntil: rx.validUntil ? new Date(rx.validUntil).toISOString().slice(0, 10) : '' })
    setModal('edit')
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, medications: meds }
      if (!payload.validUntil) payload.validUntil = null
      
      if (modal === 'add') await clinicalService.createPrescription(patientId, payload)
      else await clinicalService.updatePrescription(patientId, selected.id, payload)
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const del = async (rx) => {
    if (window.confirm('Delete this prescription?')) {
      await clinicalService.deletePrescription(patientId, rx.id)
      load()
    }
  }

  const print = (rx) => {
    const w = window.open('', '_blank')
    const medsRows = (Array.isArray(rx.medications) ? rx.medications : []).map(m =>
      `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration}</td><td>${m.instructions || '-'}</td></tr>`
    ).join('')
    w.document.write(`
      <html><head><title>Prescription - ${rx.id}</title>
      <style>body{font-family:Arial;padding:40px;color:#111} h1{color:#0EA5E9} table{width:100%;border-collapse:collapse;margin-top:20px} th,td{border:1px solid #ddd;padding:10px;text-align:left} th{background:#f8fafc}</style>
      </head><body>
      <h1>E-Prescription</h1>
      <p><b>Issued:</b> ${formatDateTime(rx.issuedAt)}</p>
      <p><b>Doctor:</b> ${rx.doctorName || 'N/A'}</p>
      <p><b>Diagnosis:</b> ${rx.diagnosis || 'N/A'}</p>
      <table><thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
      <tbody>${medsRows}</tbody></table>
      ${rx.notes ? `<p style="margin-top:20px"><b>Notes:</b> ${rx.notes}</p>` : ''}
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader2 className="spinner" size={28} style={{ margin: '0 auto 12px' }} /></div>

  return (
    <div>
      <SectionHeader title={`Prescriptions (${prescriptions.length})`} action={
        <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-prescription-btn">
          <Plus size={14} /> New Prescription
        </button>
      } />

      {prescriptions.length === 0 ? (
        <EmptyState icon={Pill} title="No Prescriptions" message="Create a prescription for this patient." action={
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> New Prescription</button>
        } />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Prescription</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                      background: rx.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                      color: rx.status === 'ACTIVE' ? '#10B981' : '#6366F1'
                    }}>{rx.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(rx.issuedAt)} {rx.doctorName && `· ${rx.doctorName}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => print(rx)} title="Print" id={`print-rx-${rx.id}`}><Printer size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(rx)} id={`edit-rx-${rx.id}`}><Pencil size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(rx)} id={`delete-rx-${rx.id}`}><Trash2 size={14} /></button>
                </div>
              </div>

              {rx.diagnosis && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Diagnosis: {rx.diagnosis}</p>}

              <div className="table-container">
                <table className="table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(rx.medications) ? rx.medications : []).map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{m.instructions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rx.notes && <p style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Note: {rx.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'New Prescription' : 'Edit Prescription'} onClose={() => setModal(null)} onSubmit={save} submitLabel={saving ? 'Saving...' : 'Save Prescription'} disabled={saving}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input className="form-input" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} placeholder="Prescribing doctor" id="rx-doctor-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} id="rx-status-select">
                {['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Diagnosis</label>
              <input className="form-input" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Condition being treated" id="rx-diagnosis-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input className="form-input" type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} id="rx-valid-input" />
            </div>

            <div className="form-group full" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Medications</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMeds(m => [...m, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])} id="add-med-btn">
                  <Plus size={13} /> Add Medication
                </button>
              </div>
              {meds.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr auto', gap: 8, marginBottom: 8 }}>
                  <input className="form-input" value={m.name} onChange={e => setMeds(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Drug name" />
                  <input className="form-input" value={m.dosage} onChange={e => setMeds(prev => prev.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x))} placeholder="Dosage" />
                  <input className="form-input" value={m.frequency} onChange={e => setMeds(prev => prev.map((x, j) => j === i ? { ...x, frequency: e.target.value } : x))} placeholder="Frequency" />
                  <input className="form-input" value={m.duration} onChange={e => setMeds(prev => prev.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} placeholder="Duration" />
                  <input className="form-input" value={m.instructions} onChange={e => setMeds(prev => prev.map((x, j) => j === i ? { ...x, instructions: e.target.value } : x))} placeholder="Instructions" />
                  <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setMeds(m => m.filter((_, j) => j !== i))} disabled={meds.length === 1}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="form-group full">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes" id="rx-notes-input" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: Lab Tests
// ─────────────────────────────────────────────────────────
function LabTestsTab({ patientId }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ testName: '', category: 'BLOOD', priority: 'NORMAL', orderedByName: '', result: '', resultNotes: '' })
  const fileRef = useRef()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const d = await clinicalService.getLabTests(patientId)
      setTests(d.data.tests)
    } finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setForm({ testName: '', category: 'BLOOD', priority: 'NORMAL', orderedByName: '', result: '', resultNotes: '' })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (t) => {
    setSelected(t)
    setForm({ testName: t.testName, category: t.category, priority: t.priority, orderedByName: t.orderedByName || '', result: t.result || '', resultNotes: t.resultNotes || '' })
    setModal('edit')
  }

  const save = async () => {
    if (!form.testName?.trim()) return
    setSaving(true)
    try {
      if (modal === 'add') await clinicalService.createLabTest(patientId, form)
      else await clinicalService.updateLabTest(patientId, selected.id, form)
      setModal(null)
      load()
    } finally { setSaving(false) }
  }

  const updateStatus = async (t, status) => {
    await clinicalService.updateLabTest(patientId, t.id, { status })
    load()
  }

  const handleFileUpload = async (t) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      setUploading(true)
      try {
        await clinicalService.uploadLabResult(patientId, t.id, file)
        load()
      } finally { setUploading(false) }
    }
    input.click()
  }

  const del = async (t) => {
    if (window.confirm('Delete this lab test?')) {
      await clinicalService.deleteLabTest(patientId, t.id)
      load()
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader2 className="spinner" size={28} style={{ margin: '0 auto 12px' }} /></div>

  return (
    <div>
      <SectionHeader title={`Lab Tests (${tests.length})`} action={
        <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-lab-btn">
          <Plus size={14} /> Order Test
        </button>
      } />

      {tests.length === 0 ? (
        <EmptyState icon={TestTube} title="No Lab Tests" message="Order a lab test for this patient." action={
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Order Test</button>
        } />
      ) : (
        <div className="table-container card">
          <table className="table">
            <thead>
              <tr>
                <th>Test Name</th><th>Category</th><th>Priority</th><th>Status</th>
                <th>Ordered</th><th>Result</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.testName}</td>
                  <td className="table-cell-light">{t.category}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                      background: t.priority === 'STAT' ? 'rgba(239,68,68,0.1)' : t.priority === 'URGENT' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                      color: t.priority === 'STAT' ? '#EF4444' : t.priority === 'URGENT' ? '#F59E0B' : '#6366F1',
                    }}>{t.priority}</span>
                  </td>
                  <td><LabStatusBadge status={t.status} /></td>
                  <td className="table-cell-light">{formatDate(t.orderedAt)}</td>
                  <td>
                    {t.result ? (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--success)' }}>{t.result.slice(0, 30)}{t.result.length > 30 ? '...' : ''}</span>
                    ) : t.fileUrl ? (
                      <a href={`http://localhost:5000${t.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        <Download size={13} /> View File
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)} title="Edit" id={`edit-lab-${t.id}`}><Pencil size={13} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleFileUpload(t)} title="Upload Result" id={`upload-lab-${t.id}`}><Upload size={13} /></button>
                      {t.status !== 'COMPLETED' && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateStatus(t, 'COMPLETED')} title="Mark Complete" id={`complete-lab-${t.id}`}>
                          <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(t)} id={`delete-lab-${t.id}`}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Order Lab Test' : 'Update Lab Test'} onClose={() => setModal(null)} onSubmit={save} submitLabel={saving ? 'Saving...' : 'Save'} disabled={saving}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Test Name *</label>
              <input className="form-input" value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} placeholder="e.g., Complete Blood Count" id="lab-name-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} id="lab-category-select">
                {LAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} id="lab-priority-select">
                {['NORMAL', 'URGENT', 'STAT'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ordered By</label>
              <input className="form-input" value={form.orderedByName} onChange={e => setForm(f => ({ ...f, orderedByName: e.target.value }))} placeholder="Doctor name" id="lab-orderedby-input" />
            </div>
            {modal === 'edit' && (
              <>
                <div className="form-group full">
                  <label className="form-label">Result</label>
                  <input className="form-input" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} placeholder="Test result summary" id="lab-result-input" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Result Notes</label>
                  <textarea className="form-input" rows={2} value={form.resultNotes} onChange={e => setForm(f => ({ ...f, resultNotes: e.target.value }))} placeholder="Detailed notes" id="lab-notes-input" />
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: Documents
// ─────────────────────────────────────────────────────────
function DocumentsTab({ patientId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [modal, setModal] = useState(false)
  const [docForm, setDocForm] = useState({ title: '', category: 'OTHER', notes: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const d = await clinicalService.getDocuments(patientId)
      setDocuments(d.data.documents)
    } finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const handleUpload = async () => {
    if (!selectedFile || !docForm.title) return
    setUploading(true)
    try {
      await clinicalService.uploadDocument(patientId, selectedFile, docForm)
      setModal(false)
      setSelectedFile(null)
      setDocForm({ title: '', category: 'OTHER', notes: '' })
      load()
    } finally { setUploading(false) }
  }

  const del = async (doc) => {
    if (window.confirm('Delete this document?')) {
      await clinicalService.deleteDocument(patientId, doc.id)
      load()
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const iconForMime = (mime) => {
    if (!mime) return '📄'
    if (mime.startsWith('image/')) return '🖼️'
    if (mime === 'application/pdf') return '📕'
    return '📄'
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader2 className="spinner" size={28} style={{ margin: '0 auto 12px' }} /></div>

  return (
    <div>
      <SectionHeader title={`Documents (${documents.length})`} action={
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)} id="add-doc-btn">
          <Upload size={14} /> Upload Document
        </button>
      } />

      {documents.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No Documents" message="Upload patient documents like consent forms, discharge summaries, and more." action={
          <button className="btn btn-primary" onClick={() => setModal(true)}><Upload size={15} /> Upload Document</button>
        } />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {documents.map(doc => (
            <div key={doc.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: '2rem' }}>{iconForMime(doc.mimeType)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 4, wordBreak: 'break-word' }}>{doc.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{doc.category.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}</div>
                </div>
              </div>
              {doc.notes && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{doc.notes}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} id={`view-doc-${doc.id}`}>
                  <Eye size={13} /> View
                </a>
                <a href={`http://localhost:5000${doc.fileUrl}`} download={doc.fileName} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} id={`download-doc-${doc.id}`}>
                  <Download size={13} /> Download
                </a>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(doc)} id={`delete-doc-${doc.id}`}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Upload Document" onClose={() => setModal(false)} onSubmit={handleUpload} submitLabel={uploading ? 'Uploading...' : 'Upload'} disabled={uploading || !selectedFile || !docForm.title}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">File *</label>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '30px 20px',
                textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)',
                transition: 'border-color 0.2s',
              }}
                onClick={() => document.getElementById('doc-file-input').click()}
              >
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📎</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatSize(selectedFile.size)}</div>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to select file</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>PDF, Images, Word documents up to 20MB</div>
                  </div>
                )}
                <input id="doc-file-input" type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={e => setSelectedFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-group full">
              <label className="form-label">Title *</label>
              <input className="form-input" value={docForm.title} onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" id="doc-title-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={docForm.category} onChange={e => setDocForm(f => ({ ...f, category: e.target.value }))} id="doc-category-select">
                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={docForm.notes} onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" id="doc-notes-input" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: Billing (read from patient summary)
// ─────────────────────────────────────────────────────────
function BillingTab({ invoices = [] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState icon={Receipt} title="No Billing Records" message="No invoices found for this patient." />
    )
  }
  return (
    <div>
      <SectionHeader title={`Invoices (${invoices.length})`} />
      <div className="table-container card">
        <table className="table">
          <thead>
            <tr><th>Invoice #</th><th>Amount</th><th>Paid</th><th>Status</th><th>Issued</th><th>Due</th></tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{inv.invoiceCode}</td>
                <td style={{ fontWeight: 600 }}>₹{Number(inv.amount).toLocaleString()}</td>
                <td style={{ color: 'var(--success)' }}>₹{Number(inv.paidAmount).toLocaleString()}</td>
                <td><Badge status={inv.status.charAt(0) + inv.status.slice(1).toLowerCase()} /></td>
                <td className="table-cell-light">{formatDate(inv.issuedAt)}</td>
                <td className="table-cell-light">{formatDate(inv.dueAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tab: Appointments (read from patient summary)
// ─────────────────────────────────────────────────────────
function AppointmentsTab({ appointments = [] }) {
  if (appointments.length === 0) {
    return (
      <EmptyState icon={CalendarDays} title="No Appointments" message="No appointment history found for this patient." />
    )
  }
  return (
    <div>
      <SectionHeader title={`Appointments (${appointments.length})`} />
      <div className="table-container card">
        <table className="table">
          <thead>
            <tr><th>Doctor</th><th>Type</th><th>Date</th><th>Duration</th><th>Status</th><th>Room</th></tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.doctor?.user?.name || 'Unknown'}</td>
                <td className="table-cell-light">{a.type}</td>
                <td className="table-cell-light">{formatDateTime(a.scheduledAt)}</td>
                <td className="table-cell-light">{a.duration} min</td>
                <td><Badge status={a.status.charAt(0) + a.status.slice(1).toLowerCase()} /></td>
                <td>{a.roomNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main PatientDetails component
// ─────────────────────────────────────────────────────────
export default function PatientDetails() {
  const { id: patientId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await clinicalService.getSummary(patientId)
      setPatient(data.data.patient)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { loadPatient() }, [loadPatient])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
        <Loader2 className="spinner" size={40} style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading patient data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Patients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    )
  }

  if (!patient) return null

  const color = STATUS_COLOR[patient.status] || '#0EA5E9'

  return (
    <div className="animate-fade" id="patient-details-page">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')} style={{ marginBottom: 16 }} id="back-to-patients-btn">
          <ArrowLeft size={16} /> Back to Patients
        </button>

        <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div className="avatar" style={{
            width: 72, height: 72, fontSize: '1.5rem', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, #6366F1)`,
            boxShadow: `0 8px 24px ${color}40`,
          }}>
            {initials(patient.name)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>{patient.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{patient.patientCode}</span>
              <span>·</span>
              <span>{patient.age} yrs · {patient.gender}</span>
              {patient.bloodType && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplet size={13} color="var(--danger)" /> {patient.bloodType}</span></>}
              {patient.department && <><span>·</span><span>{patient.department}</span></>}
            </div>
            <div style={{ marginTop: 10 }}>
              <Badge status={patient.status.charAt(0) + patient.status.slice(1).toLowerCase()} />
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={loadPatient} title="Refresh" style={{ alignSelf: 'flex-start' }} id="refresh-patient-btn">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 28, overflowX: 'auto', gap: 2 }} id="patient-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500, fontSize: '0.875rem',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -2, transition: 'all 0.2s',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div id="patient-tab-content">
        {activeTab === 'overview'      && <OverviewTab patient={patient} />}
        {activeTab === 'ehr'           && <EHRTab patientId={patientId} />}
        {activeTab === 'prescriptions' && <PrescriptionsTab patientId={patientId} />}
        {activeTab === 'lab'           && <LabTestsTab patientId={patientId} />}
        {activeTab === 'billing'       && <BillingTab invoices={patient.invoices} />}
        {activeTab === 'appointments'  && <AppointmentsTab appointments={patient.appointments} />}
        {activeTab === 'documents'     && <DocumentsTab patientId={patientId} />}
      </div>
    </div>
  )
}
