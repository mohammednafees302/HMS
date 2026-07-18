import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { Plus, Search, Pencil, Trash2, User, Phone, Droplet, AlertCircle, Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { patientService } from '../services/patientService'

const EMPTY = {
  name: '', age: '', gender: 'Male', bloodType: 'O+', phone: '',
  department: 'Cardiology', doctor: '', status: 'ACTIVE', admittedAt: new Date().toISOString().slice(0,10),
  diagnosis: '', roomNumber: '',
}

const DEPTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','General Surgery','Obstetrics','Oncology']
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const STATUSES = ['ACTIVE','DISCHARGED','CRITICAL']

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'view'
  const [form, setForm] = useState(EMPTY)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await patientService.getAll({
        search,
        status: filterStatus,
        department: filterDept,
        page,
        limit: 10
      })
      if (data.success) {
        setPatients(data.data.patients)
        setTotal(data.data.meta.total)
        setTotalPages(data.data.meta.totalPages)
      } else {
        setError(data.message || 'Failed to fetch patients')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterDept, page])

  useEffect(() => {
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchPatients()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [fetchPatients])

  const openAdd = () => { setForm(EMPTY); setFormError(''); setModal('add') }
  
  const openEdit = (p) => { 
    setSelected(p)
    setForm({ 
      ...p, 
      admittedAt: p.admittedAt ? new Date(p.admittedAt).toISOString().slice(0,10) : ''
    })
    setFormError('')
    setModal('edit') 
  }
  
  const openView = (p) => navigate(`/patients/${p.id}`)

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Name and Phone are required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        ...form,
        age: parseInt(form.age, 10) || 0
      }
      
      if (modal === 'add') {
        await patientService.create(payload)
      } else {
        await patientService.update(selected.id, payload)
      }
      setModal(null)
      fetchPatients()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save patient. Please check the inputs.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient record?')) {
      try {
        await patientService.delete(id)
        fetchPatients()
      } catch (err) {
        alert('Failed to delete patient: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const initials = (name) => name ? name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : '?'

  const variantByStatus = { ACTIVE:'#10B981', CRITICAL:'#F43F5E', DISCHARGED:'#6366F1' }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Patients</h1>
          <p>{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-patient-btn">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Search & Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by name, ID, or diagnosis…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            id="patient-search"
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} id="patient-status-filter">
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
        <select className="filter-select" value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1) }} id="patient-dept-filter">
          <option value="All">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Error & Loading */}
      {error && (
        <div style={{ padding: 16, background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>ID</th>
                <th>Age / Gender</th>
                <th>Blood</th>
                <th>Department</th>
                <th>Diagnosis</th>
                <th>Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding: '60px', color:'var(--text-muted)' }}>
                  <Loader2 className="spinner" size={24} style={{ margin: '0 auto', marginBottom: 12 }} />
                  Loading patients...
                </td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding: '60px', color:'var(--text-muted)' }}>
                  No patients found. Try adjusting your search or filters.
                </td></tr>
              ) : (
                patients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <div className="avatar" style={{
                          background: `linear-gradient(135deg, ${variantByStatus[p.status] || '#0EA5E9'}, #6366F1)`
                        }}>
                          {initials(p.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--primary)' }}>{p.patientCode}</span></td>
                    <td className="table-cell-light">{p.age} / {p.gender}</td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Droplet size={12} color="var(--danger)" /> {p.bloodType || '—'}
                      </span>
                    </td>
                    <td className="table-cell-light">{p.department || '—'}</td>
                    <td className="table-cell-light">{p.diagnosis || '—'}</td>
                    <td><span style={{ fontWeight:600, fontSize:'0.8125rem' }}>{p.roomNumber || '—'}</span></td>
                    <td><Badge status={p.status.charAt(0) + p.status.slice(1).toLowerCase()} /></td>
                    <td>
                      <div style={{ display:'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openView(p)} data-tooltip="View Details" id={`view-patient-${p.id}`}>
                          <ExternalLink size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} data-tooltip="Edit" id={`edit-patient-${p.id}`}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDelete(p.id)} data-tooltip="Delete" id={`delete-patient-${p.id}`}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Showing page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-ghost btn-sm" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className="btn btn-ghost btn-sm" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Add New Patient' : 'Edit Patient Record'}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitLabel={saving ? 'Saving...' : (modal === 'add' ? 'Add Patient' : 'Save Changes')}
          disabled={saving}
        >
          {formError && (
            <div style={{ padding: 12, background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', borderRadius: 6, marginBottom: 16, fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e=>setField('name',e.target.value)} placeholder="Patient full name" id="patient-name-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" value={form.age} onChange={e=>setField('age',e.target.value)} placeholder="Age" id="patient-age-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e=>setField('gender',e.target.value)} id="patient-gender-select">
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select className="form-select" value={form.bloodType} onChange={e=>setField('bloodType',e.target.value)} id="patient-blood-select">
                {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={form.phone} onChange={e=>setField('phone',e.target.value)} placeholder="+91-XXXXX-XXXXX" id="patient-phone-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e=>setField('department',e.target.value)} id="patient-dept-select">
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <input className="form-input" value={form.doctor} onChange={e=>setField('doctor',e.target.value)} placeholder="Attending doctor" id="patient-doctor-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Room</label>
              <input className="form-input" value={form.roomNumber} onChange={e=>setField('roomNumber',e.target.value)} placeholder="Room No." id="patient-room-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Admitted Date</label>
              <input className="form-input" type="date" value={form.admittedAt} onChange={e=>setField('admittedAt',e.target.value)} id="patient-admitted-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setField('status',e.target.value)} id="patient-status-select">
                {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Diagnosis</label>
              <input className="form-input" value={form.diagnosis} onChange={e=>setField('diagnosis',e.target.value)} placeholder="Primary diagnosis" id="patient-diagnosis-input" />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
