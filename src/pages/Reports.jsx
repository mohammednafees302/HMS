import { useState, useEffect, useCallback } from 'react'
import { chartData } from '../data/mockData'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from 'recharts'
import { reportService } from '../services/reportService'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#0F172A', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'white' }}>
      <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color}}>{p.name}: {typeof p.value==='number'&&p.value>10000?'₹'+p.value.toLocaleString('en-IN'):p.value}</p>
      ))}
    </div>
  )
}

const satisfactionData = [
  { month:'Jan', score:4.1 },
  { month:'Feb', score:4.3 },
  { month:'Mar', score:4.2 },
  { month:'Apr', score:4.5 },
  { month:'May', score:4.4 },
  { month:'Jun', score:4.6 },
  { month:'Jul', score:4.7 },
]

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const res = await reportService.getReports()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  if (loading || !data) return <div style={{ padding: 60, textAlign: 'center' }}>Loading reports...</div>

  const { metrics, staffData, appointments } = data

  const displayMetrics = [
    { label:'Total Patients',  val: metrics.totalPatients,                         color:'var(--primary)' },
    { label:'Total Appointments', val: metrics.totalAppointments,                  color:'var(--accent)' },
    { label:'Total Revenue',   val:'₹'+metrics.totalRevenue.toLocaleString('en-IN'), color:'var(--success)' },
    { label:'Collection Rate', val:`${metrics.collectionRate}%`,                     color:'var(--warning)' },
    { label:'Avg Satisfaction',val:`${metrics.avgSatisfaction} / 5`,                 color:'var(--info)' },
    { label:'Bed Occupancy',   val:`${metrics.bedOccupancy}%`,                       color:'var(--danger)' },
  ]

  // Get distinct departments from appointments
  const depts = [...new Set(appointments.map(a => a.department?.name).filter(Boolean))]

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Hospital performance overview — Year to Date</p>
        </div>
        <button className="btn btn-secondary" id="export-report-btn">Export Report</button>
      </div>

      {/* KPI Strip */}
      <div className="card" style={{ marginBottom:'var(--space-5)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', padding:'var(--space-2) 0' }}>
          {displayMetrics.map(m=>(
            <div key={m.label} className="report-metric">
              <div className="report-metric-val" style={{ color:m.color }}>{m.val}</div>
              <div className="report-metric-lbl">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom:'var(--space-5)' }}>
        {/* Revenue */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Revenue</div>
          </div>
          <div className="card-body" style={{ paddingTop:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.monthlyRevenue} margin={{top:10,right:10,left:-10,bottom:0}}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}} tickFormatter={v=>`₹${v/1000}K`}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#revG)" dot={{r:3,fill:'#10B981'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Admissions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Patient Admissions</div>
          </div>
          <div className="card-body" style={{ paddingTop:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.admissions} margin={{top:10,right:10,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="admG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="patients" name="Admissions" fill="url(#admG)" radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom:'var(--space-5)' }}>
        {/* Staff per Dept */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Staff by Department</div>
          </div>
          <div className="card-body" style={{ paddingTop:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={staffData} margin={{top:10,right:10,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#94A3B8'}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="doctors" name="Doctors" fill="#0EA5E9" radius={[4,4,0,0]} barSize={12}/>
                <Bar dataKey="nurses"  name="Nurses"  fill="#6366F1" radius={[4,4,0,0]} barSize={12}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Satisfaction */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Patient Satisfaction Score</div>
          </div>
          <div className="card-body" style={{ paddingTop:0 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={satisfactionData} margin={{top:10,right:10,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <YAxis domain={[3.5,5]} axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#94A3B8'}}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Line type="monotone" dataKey="score" name="Score (/5)" stroke="#F59E0B" strokeWidth={2.5}
                  dot={{r:5,fill:'#F59E0B',stroke:'white',strokeWidth:2}} activeDot={{r:7}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Appointment Summary Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Appointment Status Summary</div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Department</th><th>Scheduled</th><th>Completed</th><th>Cancelled</th><th>Total</th><th>Completion Rate</th></tr>
            </thead>
            <tbody>
              {depts.map(dept=>{
                const dAppts = appointments.filter(a=>a.department?.name===dept)
                const sched = dAppts.filter(a=>a.status==='SCHEDULED').length
                const comp = dAppts.filter(a=>a.status==='COMPLETED').length
                const canc = dAppts.filter(a=>a.status==='CANCELLED').length
                const total = dAppts.length
                const rate = total>0?Math.round(comp/total*100):0
                return (
                  <tr key={dept}>
                    <td style={{fontWeight:600}}>{dept}</td>
                    <td style={{color:'var(--primary)',fontWeight:600}}>{sched}</td>
                    <td style={{color:'var(--success)',fontWeight:600}}>{comp}</td>
                    <td style={{color:'var(--danger)',fontWeight:600}}>{canc}</td>
                    <td style={{fontWeight:700}}>{total}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{flex:1,height:6,background:'var(--border)',borderRadius:99,minWidth:60}}>
                          <div style={{height:'100%',width:`${rate}%`,background:'linear-gradient(90deg,var(--success),#34D399)',borderRadius:99}}/>
                        </div>
                        <span style={{fontWeight:700,fontSize:'0.8125rem',color:'var(--success)',minWidth:34}}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
