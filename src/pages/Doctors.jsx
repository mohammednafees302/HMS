import { useState, useEffect, useCallback } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { Plus, Search, Pencil, Trash2, Mail, Phone, Clock } from 'lucide-react'
import { doctorService } from '../services/doctorService'
import { departmentService } from '../services/departmentService'
import { userService } from '../services/userService'

const DEPT_COLORS = ['#F43F5E', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6']

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ userId: '', departmentId: '', specialization: '', qualification: '', experience: 0, availability: 'Mon-Fri 9am-5pm', isActive: true })
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [docRes, depRes, userRes] = await Promise.all([
        doctorService.getDoctors({ search, departmentId: filterDept !== 'All' ? filterDept : undefined, isActive: filterStatus !== 'All' ? filterStatus === 'Active' : undefined, limit: 100 }),
        departmentService.getDepartments(),
        userService.getUsers()
      ])
      setDoctors(docRes.data?.doctors || docRes.data || [])
      setDepartments(depRes.data?.departments || depRes.data || [])
      setUsers(userRes.data?.users || userRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filterDept, filterStatus])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const openAdd = () => {
    setForm({ userId: '', departmentId: departments[0]?.id || '', specialization: '', qualification: '', experience: 0, availability: 'Mon-Fri 9am-5pm', isActive: true })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (d) => {
    setSelected(d)
    setForm({
      departmentId: d.departmentId,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      availability: d.availability || '',
      isActive: d.isActive
    })
    setModal('edit')
  }

  const openView = (d) => { setSelected(d); setModal('view') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, experience: Number(form.experience) }
      if (modal === 'add') {
        if (!payload.userId) throw new Error('Please select a user')
        await doctorService.createDoctor(payload)
      } else {
        await doctorService.updateDoctor(selected.id, payload)
      }
      setModal(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving doctor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Remove this doctor from the system?')) {
      try {
        await doctorService.deleteDoctor(id)
        loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting doctor')
      }
    }
  }

  const initials = (name) => name ? name.replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'DR'

  if (loading && doctors.length === 0) return <div style={{ padding: 60, textAlign: 'center' }}>Loading doctors...</div>

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Doctors</h1>
          <p>{doctors.filter(d => d.isActive).length} active of {doctors.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-doctor-btn">
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Search by name or specialization…" value={search}
            onChange={e=>setSearch(e.target.value)} id="doctor-search" />
        </div>
        <select className="filter-select" value={filterDept} onChange={e=>setFilterDept(e.target.value)} id="doctor-dept-filter">
          <option value="All">All Departments</option>
          {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} id="doctor-status-filter">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-5)' }}>
        {doctors.map((d, i) => {
          const color = DEPT_COLORS[i % DEPT_COLORS.length]
          return (
            <div key={d.id} className="card" style={{ padding: 0, overflow:'hidden', cursor:'pointer', transition:'all 0.2s' }}
              onClick={() => openView(d)}>
              <div style={{ height: 6, background: `linear-gradient(90deg, ${color}, #6366F1)` }} />
              <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ display:'flex', alignItems:'center', gap: 14, marginBottom: 16 }}>
                  <div className="avatar" style={{ width:52, height:52, fontSize:'1rem',
                    background:`linear-gradient(135deg,${color},#6366F1)` }}>
                    {initials(d.user?.name)}
                  </div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {d.user?.name}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{d.specialization}</div>
                    <Badge status={d.isActive ? 'Active' : 'On Leave'} />
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8125rem', color:'var(--text-secondary)' }}>
                    <Phone size={13} color={color} />
                    {d.user?.phone || 'N/A'}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8125rem', color:'var(--text-secondary)' }}>
                    <Mail size={13} color={color} />
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.user?.email || 'N/A'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8125rem', color:'var(--text-secondary)' }}>
                    <Clock size={13} color={color} />
                    {d.availability || 'N/A'}
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontWeight:800, fontSize:'1.125rem', color:'var(--text-primary)' }}>{d.experience}yr</div>
                    <div style={{ fontSize:'0.625rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>Experience</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontWeight:700, fontSize:'0.8125rem', color, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.department?.name}</div>
                    <div style={{ fontSize:'0.625rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>Dept</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openEdit(d)} id={`edit-doctor-${d.id}`}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(d.id)} id={`delete-doctor-${d.id}`}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      {(modal==='add'||modal==='edit') && (
        <Modal title={modal==='add'?'Add New Doctor':'Edit Doctor'} onClose={()=>setModal(null)} onSubmit={handleSubmit} submitLabel={saving?'Saving...':'Save Changes'} disabled={saving}>
          <div className="form-grid">
            {modal === 'add' && (
              <div className="form-group full">
                <label className="form-label">Link User Account *</label>
                <select className="form-select" required value={form.userId} onChange={e=>setForm(f=>({ ...f, userId: e.target.value }))}>
                  <option value="">Select a user account...</option>
                  {users.filter(u => u.role !== 'DOCTOR').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" required value={form.departmentId} onChange={e=>setForm(f=>({ ...f, departmentId: e.target.value }))} id="doctor-dept-select">
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input className="form-input" required value={form.specialization} onChange={e=>setForm(f=>({ ...f, specialization: e.target.value }))} placeholder="e.g. Interventional Cardiology" id="doctor-spec-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input className="form-input" type="number" min="0" value={form.experience} onChange={e=>setForm(f=>({ ...f, experience: e.target.value }))} id="doctor-exp-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Qualification *</label>
              <input className="form-input" required value={form.qualification} onChange={e=>setForm(f=>({ ...f, qualification: e.target.value }))} placeholder="e.g. MBBS, MD" id="doctor-qual-input"/>
            </div>
            <div className="form-group full">
              <label className="form-label">Availability</label>
              <input className="form-input" value={form.availability} onChange={e=>setForm(f=>({ ...f, availability: e.target.value }))} placeholder="Mon-Fri 9am-5pm" id="doctor-avail-input"/>
            </div>
            {modal === 'edit' && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.isActive} onChange={e=>setForm(f=>({ ...f, isActive: e.target.value === 'true' }))} id="doctor-status-select">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal==='view' && selected && (
        <Modal title="Doctor Profile" onClose={()=>setModal(null)} size="md">
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
            <div className="avatar" style={{width:72,height:72,fontSize:'1.375rem',background:`linear-gradient(135deg,var(--primary),#6366F1)`}}>
              {initials(selected.user?.name)}
            </div>
            <div>
              <h3 style={{fontSize:'1.25rem',fontWeight:700}}>{selected.user?.name}</h3>
              <p style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>{selected.specialization}</p>
              <p style={{color:'var(--text-muted)',fontSize:'0.8125rem'}}>{selected.department?.name}</p>
              <Badge status={selected.isActive ? 'Active' : 'Inactive'}/>
            </div>
          </div>
          <div className="form-grid">
            {[['Qualification',selected.qualification],['Experience',selected.experience+' years'],
              ['Phone',selected.user?.phone],['Email',selected.user?.email],
              ['Availability',selected.availability]
            ].map(([k,v])=>(
              <div key={k} className="form-group">
                <label className="form-label">{k}</label>
                <div style={{fontWeight:600,color:'var(--text-primary)',padding:'9px 0',fontSize:'0.9rem'}}>{v||'—'}</div>
                <div className="divider" style={{margin:'4px 0 0'}}/>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
