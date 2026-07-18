import { useState, useEffect, useCallback } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { Plus, Search, Pencil, Trash2, Calendar } from 'lucide-react'
import { appointmentService } from '../services/appointmentService'
import { doctorService } from '../services/doctorService'
import { patientService } from '../services/patientService'

const TYPES = ['CONSULTATION','FOLLOW_UP','CHECKUP','EMERGENCY','NEW_PATIENT']
const STATUSES = ['SCHEDULED','COMPLETED','CANCELLED','NO_SHOW']

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDate, setFilterDate] = useState('')
  
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ patientId: '', doctorId: '', type: 'CONSULTATION', status: 'SCHEDULED', scheduledDate: '', scheduledTime: '09:00', reason: '' })
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [appRes, docRes, patRes] = await Promise.all([
        appointmentService.getAppointments({ search, status: filterStatus !== 'All' ? filterStatus : undefined, limit: 100 }),
        doctorService.getDoctors({ limit: 100 }),
        patientService.getAll({ limit: 100 })
      ])
      let apps = appRes.data?.appointments || appRes.data || []
      if (filterDate) {
        apps = apps.filter(a => new Date(a.scheduledAt).toISOString().slice(0, 10) === filterDate)
      }
      setAppointments(apps)
      setDoctors(docRes.data?.doctors || docRes.data || [])
      setPatients(patRes.data?.patients || patRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const openAdd = () => {
    setForm({ patientId: '', doctorId: '', type: 'CONSULTATION', status: 'SCHEDULED', scheduledDate: new Date().toISOString().slice(0, 10), scheduledTime: '09:00', reason: '' })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (a) => {
    setSelected(a)
    const dateObj = new Date(a.scheduledAt)
    const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString()
    
    setForm({
      patientId: a.patientId,
      doctorId: a.doctorId,
      type: a.type,
      status: a.status,
      scheduledDate: localDate.slice(0, 10),
      scheduledTime: localDate.slice(11, 16),
      reason: a.reason || ''
    })
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patientId || !form.doctorId || !form.scheduledDate || !form.scheduledTime) return
    setSaving(true)
    
    try {
      const scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}:00Z`).toISOString()
      const payload = {
        patientId: form.patientId,
        doctorId: form.doctorId,
        type: form.type,
        status: form.status,
        scheduledAt,
        reason: form.reason
      }
      
      if (modal === 'add') {
        await appointmentService.createAppointment(payload)
      } else {
        await appointmentService.updateAppointment(selected.id, payload)
      }
      setModal(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving appointment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id)
        loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting appointment')
      }
    }
  }

  const statusCount = s => appointments.filter(a => a.status === s).length
  const todayCount = appointments.filter(a => new Date(a.scheduledAt).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).length

  if (loading && appointments.length === 0) return <div style={{ padding: 60, textAlign: 'center' }}>Loading appointments...</div>

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Appointments</h1>
          <p>{appointments.length} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-appointment-btn">
          <Plus size={16}/> Book Appointment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stat-grid" style={{marginBottom:'var(--space-5)'}}>
        {[
          {label:'Today',val:todayCount,color:'var(--primary)',bg:'rgba(14,165,233,0.08)'},
          {label:'Scheduled',val:statusCount('SCHEDULED'),color:'var(--primary)',bg:'rgba(14,165,233,0.08)'},
          {label:'Completed',val:statusCount('COMPLETED'),color:'var(--success)',bg:'rgba(16,185,129,0.08)'},
          {label:'Cancelled',val:statusCount('CANCELLED'),color:'var(--danger)',bg:'rgba(244,63,94,0.08)'},
        ].map(s=>(
          <div key={s.label} style={{background:'var(--surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'var(--space-4) var(--space-5)',display:'flex',alignItems:'center',gap:'var(--space-3)'}}>
            <div style={{width:44,height:44,borderRadius:'var(--radius)',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Calendar size={20} color={s.color}/>
            </div>
            <div>
              <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</div>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--text-primary)',lineHeight:1.2}}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon"/>
          <input className="search-input" placeholder="Search patient or doctor…" value={search}
            onChange={e=>setSearch(e.target.value)} id="appointment-search"/>
        </div>
        <input className="filter-select" type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
          style={{cursor:'pointer'}} id="appointment-date-filter"/>
        <select className="filter-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} id="appointment-status-filter">
          <option value="All">All Status</option>
          {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Appointment List */}
      <div className="appt-list">
        {appointments.length === 0 && (
          <div className="empty-state">
            <Calendar size={40}/>
            <h3>No appointments found</h3>
            <p>Try changing your filters or book a new appointment.</p>
          </div>
        )}
        {appointments.map(a => {
          const dateObj = new Date(a.scheduledAt)
          const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString()
          const time = localDate.slice(11, 16)
          const hour = parseInt(time.split(':')[0], 10)
          const ampm = hour >= 12 ? 'PM' : 'AM'
          const displayHour = hour % 12 || 12
          
          return (
            <div key={a.id} className="appt-item">
              <div className="appt-time-badge">
                <div className="time-hr">{displayHour}</div>
                <div className="time-ampm">{ampm}</div>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.9375rem',color:'var(--text-primary)'}}>{a.patient?.name}</div>
                <div style={{fontSize:'0.8125rem',color:'var(--text-muted)',marginTop:2}}>
                  Dr. {a.doctor?.user?.name} · {a.department?.name}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.8125rem',color:'var(--text-secondary)'}}>
                <Calendar size={13}/>
                {new Date(a.scheduledAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:3}}>Type</div>
                <span style={{fontSize:'0.8125rem',fontWeight:600,color:'var(--text-secondary)'}}>{a.type.replace('_', ' ')}</span>
              </div>
              <Badge status={a.status}/>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openEdit(a)} id={`edit-appt-${a.id}`}><Pencil size={14}/></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(a.id)} id={`delete-appt-${a.id}`}><Trash2 size={14}/></button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      {(modal==='add'||modal==='edit') && (
        <Modal
          title={modal==='add'?'Book New Appointment':'Edit Appointment'}
          onClose={()=>setModal(null)}
          onSubmit={handleSubmit}
          submitLabel={saving?'Saving...':'Save Changes'}
          disabled={saving}
        >
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Patient *</label>
              <select className="form-select" required value={form.patientId} onChange={e=>setForm(f=>({...f, patientId: e.target.value}))} id="appt-patient-select" disabled={modal==='edit'}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Doctor *</label>
              <select className="form-select" required value={form.doctorId} onChange={e=>setForm(f=>({...f, doctorId: e.target.value}))} id="appt-doctor-select">
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user?.name} — {d.department?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Appointment Type</label>
              <select className="form-select" required value={form.type} onChange={e=>setForm(f=>({...f, type: e.target.value}))} id="appt-type-select">
                {TYPES.map(t=><option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" required value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value}))} id="appt-status-select">
                {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" required value={form.scheduledDate} onChange={e=>setForm(f=>({...f, scheduledDate: e.target.value}))} id="appt-date-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input className="form-input" type="time" required value={form.scheduledTime} onChange={e=>setForm(f=>({...f, scheduledTime: e.target.value}))} id="appt-time-input"/>
            </div>
            <div className="form-group full">
              <label className="form-label">Reason</label>
              <textarea className="form-input" rows={2} value={form.reason} onChange={e=>setForm(f=>({...f, reason: e.target.value}))} placeholder="Chief complaint..." id="appt-reason-input"/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
