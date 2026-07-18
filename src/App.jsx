import { useState } from 'react'
import { Routes, Route, useLocation, NavLink } from 'react-router-dom'
import { useHMS } from './context/HMSContext'
import Sidebar      from './components/Sidebar'
import Header       from './components/Header'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Patients     from './pages/Patients'
import PatientDetails from './pages/PatientDetails'
import Doctors      from './pages/Doctors'
import Appointments from './pages/Appointments'
import Departments  from './pages/Departments'
import Billing      from './pages/Billing'
import Reports      from './pages/Reports'
import Profile      from './pages/Profile'
import Settings     from './pages/Settings'
import {
  LayoutDashboard, Users, CalendarDays, Building2, Receipt,
} from 'lucide-react'

const BOTTOM_NAV = [
  { to:'/',             icon: LayoutDashboard, label:'Home'      },
  { to:'/patients',     icon: Users,           label:'Patients'  },
  { to:'/appointments', icon: CalendarDays,    label:'Appts'     },
  { to:'/departments',  icon: Building2,       label:'Depts'     },
  { to:'/billing',      icon: Receipt,         label:'Billing'   },
]

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen]             = useState(false)
  const { isAuthenticated } = useHMS()
  const location = useLocation()

  // Show login if not authenticated
  if (!isAuthenticated) return <Login />

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onMobileMenuOpen={() => setMobileOpen(true)}
          onSidebarToggle={() => setSidebarCollapsed(c => !c)}
          pathname={location.pathname}
        />

        <main className="page-body">
          <Routes>
            <Route path="/"             element={<Dashboard    />} />
            <Route path="/patients"     element={<Patients     />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/doctors"      element={<Doctors      />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/departments"  element={<Departments  />} />
            <Route path="/billing"      element={<Billing      />} />
            <Route path="/reports"      element={<Reports      />} />
            <Route path="/profile"      element={<Profile      />} />
            <Route path="/settings"     element={<Settings     />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={`mobile-nav-item${active ? ' active' : ''}`}
              id={`mobile-nav-${label.toLowerCase()}`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
