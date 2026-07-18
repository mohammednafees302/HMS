import { useState, useEffect, useCallback } from 'react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { Plus, Search, IndianRupee, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { billingService } from '../services/billingService'
import { patientService } from '../services/patientService'

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ patientId: '', dueAt: new Date().toISOString().slice(0, 10), amount: '', status: 'PENDING' })
  const [itemInput, setItemInput] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [invRes, patRes] = await Promise.all([
        billingService.getInvoices({ 
          status: filterStatus !== 'All' ? filterStatus : undefined,
          limit: 100 
        }),
        patientService.getAll({ limit: 100 })
      ])
      
      let filtered = invRes.data?.invoices || invRes.data || [];
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(i => 
          i.patient?.name?.toLowerCase().includes(q) || 
          i.invoiceCode?.toLowerCase().includes(q)
        )
      }
      setInvoices(filtered)
      setPatients(patRes.data?.patients || patRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const totalPaid    = invoices.filter(i=>i.status==='PAID').reduce((s,i)=>s+i.amount,0)
  const totalPending = invoices.filter(i=>i.status==='PENDING').reduce((s,i)=>s+i.amount,0)
  const totalOverdue = invoices.filter(i=>i.status==='OVERDUE').reduce((s,i)=>s+i.amount,0)

  const fmtRs = v => '₹' + (v || 0).toLocaleString('en-IN')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patientId || !form.amount) return
    setSaving(true)
    
    try {
      const items = [{
        description: itemInput || 'General Services',
        quantity: 1,
        unitPrice: Number(form.amount),
        total: Number(form.amount)
      }]

      const dueAtDate = new Date(form.dueAt)
      if (isNaN(dueAtDate.getTime())) throw new Error("Invalid Due Date")

      await billingService.createInvoice({
        patientId: form.patientId,
        items,
        dueAt: dueAtDate.toISOString(),
        status: form.status,
      })
      
      setModal(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error generating invoice')
    } finally {
      setSaving(false)
    }
  }

  const markPaid = async (id) => {
    if (window.confirm('Mark this invoice as Paid?')) {
      try {
        await billingService.updateInvoice(id, { status: 'PAID' })
        loadData()
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating invoice')
      }
    }
  }

  if (loading && invoices.length === 0) return <div style={{ padding: 60, textAlign: 'center' }}>Loading invoices...</div>

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Billing</h1>
          <p>{invoices.length} invoices · {invoices.filter(i=>i.status==='PENDING').length} pending</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{
          setForm({ patientId: '', dueAt: new Date().toISOString().slice(0, 10), amount: '', status: 'PENDING' })
          setItemInput('')
          setModal('add')
        }} id="add-invoice-btn">
          <Plus size={16}/> New Invoice
        </button>
      </div>

      {/* Revenue Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'var(--space-4)',marginBottom:'var(--space-6)'}}>
        {[
          {label:'Total Collected',val:fmtRs(totalPaid),icon:CheckCircle,color:'var(--success)',bg:'rgba(16,185,129,0.08)'},
          {label:'Pending',val:fmtRs(totalPending),icon:Clock,color:'var(--warning)',bg:'rgba(245,158,11,0.08)'},
          {label:'Overdue',val:fmtRs(totalOverdue),icon:AlertTriangle,color:'var(--danger)',bg:'rgba(244,63,94,0.08)'},
          {label:'Total Invoices',val:invoices.length,icon:FileText,color:'var(--primary)',bg:'rgba(14,165,233,0.08)'},
        ].map(s=>(
          <div key={s.label} style={{background:'var(--surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'var(--space-5)',display:'flex',alignItems:'center',gap:'var(--space-3)'}}>
            <div style={{width:44,height:44,borderRadius:'var(--radius)',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <s.icon size={20} color={s.color}/>
            </div>
            <div>
              <div style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</div>
              <div style={{fontSize:'1.25rem',fontWeight:800,color:'var(--text-primary)'}}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon"/>
          <input className="search-input" placeholder="Search by patient or invoice ID…" value={search}
            onChange={e=>setSearch(e.target.value)} id="billing-search"/>
        </div>
        <select className="filter-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} id="billing-status-filter">
          <option value="All">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Invoice Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient</th>
                <th>Items</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length===0&&(
                <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No invoices found.</td></tr>
              )}
              {invoices.map(inv=>(
                <tr key={inv.id}>
                  <td>
                    <span style={{fontFamily:'monospace',fontSize:'0.8125rem',color:'var(--primary)',fontWeight:600}}>{inv.invoiceCode}</span>
                  </td>
                  <td style={{fontWeight:600}}>{inv.patient?.name}</td>
                  <td className="table-cell-light" style={{maxWidth:180}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {Array.isArray(inv.items) ? inv.items.map(i => i.description).join(', ') : 'Services'}
                    </div>
                  </td>
                  <td className="table-cell-light">{new Date(inv.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td className="table-cell-light" style={{color:inv.status==='OVERDUE'?'var(--danger)':'inherit'}}>
                    {new Date(inv.dueAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </td>
                  <td style={{fontWeight:700,color:'var(--text-primary)'}}>
                    <span style={{display:'flex',alignItems:'center',gap:2}}>
                      <IndianRupee size={13}/>{inv.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td><Badge status={inv.status.replace('_', ' ')}/></td>
                  <td>
                    {inv.status!=='PAID'&&(
                      <button className="btn btn-sm btn-secondary" onClick={()=>markPaid(inv.id)} id={`mark-paid-${inv.id}`}
                        style={{fontSize:'0.75rem',padding:'5px 10px'}}>
                        Mark Paid
                      </button>
                    )}
                    {inv.status==='PAID'&&<span style={{color:'var(--success)',fontSize:'0.8125rem',fontWeight:600}}>✓ Settled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {modal==='add'&&(
        <Modal title="Generate New Invoice" onClose={()=>setModal(null)} onSubmit={handleSubmit} submitLabel={saving ? "Generating..." : "Generate Invoice"} disabled={saving}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Patient *</label>
              <select className="form-select" required value={form.patientId} onChange={e=>setForm(f=>({...f, patientId: e.target.value}))} id="invoice-patient-select">
                <option value="">Select Patient</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input className="form-input" type="date" required value={form.dueAt} onChange={e=>setForm(f=>({...f, dueAt: e.target.value}))} id="invoice-due-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" required value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value}))} id="invoice-status-select">
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Items (comma-separated)</label>
              <input className="form-input" value={itemInput} onChange={e=>setItemInput(e.target.value)}
                placeholder="Consultation, X-Ray, Medicines" id="invoice-items-input"/>
            </div>
            <div className="form-group full">
              <label className="form-label">Total Amount (₹) *</label>
              <input className="form-input" type="number" required min="0" value={form.amount} onChange={e=>setForm(f=>({...f, amount: e.target.value}))}
                placeholder="Total amount" id="invoice-amount-input"/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
