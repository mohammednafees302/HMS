import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Building2, UserCircle2 } from 'lucide-react'
import { departmentService } from '../services/departmentService'
import Modal from '../components/Modal'

const DEPT_COLORS = ['#F43F5E', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6']

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', totalBeds: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await departmentService.getDepartments()
      setDepartments(res.data?.departments || res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalBeds = departments.reduce((s, d) => s + (d.totalBeds || 0), 0)
  const totalDoctors = departments.reduce((s, d) => s + (d._count?.doctors || 0), 0)
  // For now, occupied beds isn't fully tracked per department without a Bed model. We'll simulate it based on appointments or just set it to 0 for the real data until beds are properly implemented.
  const totalOccupied = 0

  const openAdd = () => {
    setForm({ name: '', description: '', totalBeds: 0 })
    setSelected(null)
    setModal('add')
  }

  const openEdit = (d) => {
    setSelected(d)
    setForm({ name: d.name, description: d.description || '', totalBeds: d.totalBeds })
    setModal('edit')
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, totalBeds: Number(form.totalBeds) }
      if (modal === 'add') await departmentService.createDepartment(payload)
      else await departmentService.updateDepartment(selected.id, payload)
      setModal(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving department')
    } finally {
      setSaving(false)
    }
  }

  const del = async (d) => {
    if (window.confirm(`Delete department ${d.name}?`)) {
      try {
        await departmentService.deleteDepartment(d.id)
        load()
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting department')
      }
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>Loading departments...</div>

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title">
          <h1>Departments</h1>
          <p>{departments.length} departments · {totalBeds} total beds</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-dept-btn">
          <Plus size={16} style={{ marginRight: 6 }} /> Add Department
        </button>
      </div>

      {/* Summary Strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'var(--space-4)',marginBottom:'var(--space-6)'}}>
        {[
          {label:'Total Departments',val:departments.length,color:'#0EA5E9'},
          {label:'Total Beds',val:totalBeds,color:'#6366F1'},
          {label:'Total Doctors',val:totalDoctors,color:'#F59E0B'},
        ].map(s=>(
          <div key={s.label} style={{
            background:'var(--surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',
            padding:'var(--space-4) var(--space-5)',textAlign:'center'
          }}>
            <div style={{fontSize:'1.75rem',fontWeight:800,color:s.color}}>{s.val}</div>
            <div style={{fontSize:'0.6875rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',fontWeight:600,marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Department Cards */}
      <div className="grid-3" style={{marginBottom:'var(--space-6)'}}>
        {departments.map((dept, idx) => {
          const color = DEPT_COLORS[idx % DEPT_COLORS.length]
          return (
            <div key={dept.id} className="dept-card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(dept)}><Pencil size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(dept)}><Trash2 size={14} /></button>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'var(--space-4)'}}>
                <div className="dept-icon-wrap" style={{background: `${color}15`, color}}>
                  <Building2 size={24} />
                </div>
              </div>
              <div className="dept-name">{dept.name}</div>
              <div className="dept-head" style={{ marginBottom: 12 }}>{dept.description || 'No description'}</div>
              <div className="dept-stats">
                <div className="dept-stat-item">
                  <div className="dept-stat-val" style={{color}}>{dept._count?.doctors || 0}</div>
                  <div className="dept-stat-lbl">Doctors</div>
                </div>
                <div className="dept-stat-item">
                  <div className="dept-stat-val">{dept.totalBeds}</div>
                  <div className="dept-stat-lbl">Total Beds</div>
                </div>
                <div className="dept-stat-item">
                  <div className="dept-stat-val">{dept._count?.appointments || 0}</div>
                  <div className="dept-stat-lbl">Appointments</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)} onSubmit={save} submitLabel={saving ? 'Saving...' : 'Save'} disabled={saving}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Department Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cardiology" id="dept-name-input" />
            </div>
            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Department focus..." id="dept-desc-input" />
            </div>
            <div className="form-group full">
              <label className="form-label">Total Beds</label>
              <input className="form-input" type="number" min="0" value={form.totalBeds} onChange={e => setForm(f => ({ ...f, totalBeds: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
