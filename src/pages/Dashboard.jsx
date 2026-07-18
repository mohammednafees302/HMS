import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../services/dashboardService'
import { chartData as fallbackChartData } from '../data/mockData'
import Badge from '../components/Badge'
import {
  Users, UserCheck, CalendarDays, Bed, TrendingUp, TrendingDown,
  AlertCircle, Clock, RefreshCw, Wifi, WifiOff,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import { Link } from 'react-router-dom'

// ---- Sub-components ----

function StatCard({ label, value, sub, icon: Icon, variant, trend, trendVal }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className={`stat-icon ${variant}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {trend !== undefined && (
          <div className={`stat-change ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trendVal)}% from last month
          </div>
        )}
        {sub && <div className="stat-change neutral">{sub}</div>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'white'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const RevTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'white'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#10B981' }}>₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

// ---- Main Dashboard ----

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await dashboardService.getStats()
      if (res.success) {
        setData(res.data)
        setLastUpdated(new Date())
      } else {
        setError(res.message || 'Failed to load dashboard data')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Auto-refresh every 60 seconds (silent, no loading spinner)
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 60_000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  // ---- Derived values ----
  const stats          = data?.stats          ?? {}
  const charts         = data?.charts         ?? {}
  const recentPatients = data?.recentPatients ?? []
  const todayAppts     = data?.todayAppointments ?? []

  const admissionsChart  = charts.admissions      ?? fallbackChartData.admissions
  const deptChart        = charts.deptDistribution ?? fallbackChartData.deptDistribution
  const revenueChart     = charts.monthlyRevenue   ?? fallbackChartData.monthlyRevenue

  const bedOccupancy = stats.totalBeds
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
    : 65

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const initials = (name) => name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ height: 20, width: 200, background: 'var(--border)', borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 14, width: 140, background: 'var(--border)', borderRadius: 6 }} />
          </div>
        </div>
        <div className="stat-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 100 }}>
              <div style={{ width: '100%', height: 80, background: 'var(--border)', borderRadius: 8, opacity: 0.5 }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading real-time data…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade">

      {/* Live status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        marginBottom: 16, gap: 8
      }}>
        {error ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--danger)', background: 'rgba(244,63,94,0.08)', padding: '4px 10px', borderRadius: 99 }}>
            <WifiOff size={13} /> Live data unavailable — showing last known
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--success)', background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: 99 }}>
            <Wifi size={13} /> Live · updated {lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
        <button
          onClick={() => fetchDashboard(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--primary)', background: 'rgba(14,165,233,0.08)', border: 'none', padding: '4px 10px', borderRadius: 99, cursor: 'pointer' }}
          id="dashboard-refresh-btn"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="Total Patients"    value={stats.totalPatients   ?? 0} icon={Users}       variant="primary" trend={1}  trendVal={8.2} />
        <StatCard label="Active Doctors"    value={`${stats.activeDoctors ?? 0}/${stats.totalDoctors ?? 0}`} icon={UserCheck}   variant="success" trend={1}  trendVal={3.1} />
        <StatCard label="Today's Appts"     value={stats.todayAppointments ?? 0} icon={CalendarDays} variant="warning" sub={`${stats.scheduledToday ?? 0} scheduled`} />
        <StatCard label="Beds Available"    value={(stats.totalBeds ?? 0) - (stats.occupiedBeds ?? 0)} icon={Bed} variant="info" sub={`${bedOccupancy}% occupancy`} />
        <StatCard label="Critical Patients" value={stats.criticalPatients ?? 0} icon={AlertCircle} variant="danger"  sub="Requires attention" />
      </div>

      {/* Charts Row */}
      <div className="chart-row">
        {/* Admissions Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Patient Admissions</div>
              <div className="card-subtitle">Monthly admission trend ({new Date().getFullYear()})</div>
            </div>
            <span className="badge scheduled">This Year</span>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={admissionsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0EA5E9" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="patients" name="Patients" fill="url(#barGrad)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Department Distribution</div>
              <div className="card-subtitle">Patient share by dept</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={deptChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {deptChart.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Monthly Revenue</div>
            <div className="card-subtitle">Billing collections ({new Date().getFullYear()})</div>
          </div>
          <span className="badge paid">
            ₹{((stats.totalRevenue ?? 0) / 1000).toFixed(0)}K collected
          </span>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<RevTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5}
                fill="url(#revGrad)" dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Appointments</div>
              <div className="card-subtitle">{todayStr}</div>
            </div>
            <Link to="/appointments" className="btn btn-ghost btn-sm" id="view-all-appts-btn">
              View All
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No appointments scheduled for today
                    </td>
                  </tr>
                ) : (
                  todayAppts.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.patient}</td>
                      <td className="table-cell-light">{a.doctor}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="var(--text-muted)" /> {a.time}
                        </span>
                      </td>
                      <td><Badge status={a.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Patients</div>
              <div className="card-subtitle">Latest admitted</div>
            </div>
            <Link to="/patients" className="btn btn-ghost btn-sm" id="view-all-patients-btn">
              View All
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No patients found
                    </td>
                  </tr>
                ) : (
                  recentPatients.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.6rem' }}>
                            {initials(p.name)}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="table-cell-light">{p.department || '—'}</td>
                      <td className="table-cell-light">{p.roomNumber || '—'}</td>
                      <td>
                        <Badge status={p.status.charAt(0) + p.status.slice(1).toLowerCase()} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
