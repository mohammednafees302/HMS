import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, CalendarDays,
  Building2, Receipt, BarChart3, Activity, ChevronLeft, Menu,
  Settings, UserCircle, LogOut,
} from 'lucide-react'
import { useHMS } from '../context/HMSContext'

const navItems = [
  { section: 'Main' },
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { section: 'Clinical' },
  { to: '/patients',     icon: Users,           label: 'Patients'     },
  { to: '/doctors',      icon: UserCheck,       label: 'Doctors'      },
  { to: '/appointments', icon: CalendarDays,    label: 'Appointments' },
  { section: 'Management' },
  { to: '/departments',  icon: Building2,       label: 'Departments'  },
  { to: '/billing',      icon: Receipt,         label: 'Billing'      },
  { to: '/reports',      icon: BarChart3,       label: 'Reports'      },
  { section: 'Account' },
  { to: '/profile',      icon: UserCircle,      label: 'Profile'      },
  { to: '/settings',     icon: Settings,        label: 'Settings'     },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location  = useLocation()
  const { logout, currentUser } = useHMS()

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`mobile-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Activity size={22} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h1>MediCore</h1>
            <span>HMS Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>
            }
            const Icon = item.icon
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item${isActive ? ' active' : ''}`}
                data-tooltip={collapsed ? item.label : undefined}
                onClick={onMobileClose}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={onToggle}
            id="sidebar-collapse-btn"
            style={{ width:'100%', border:'none', background:'none', cursor:'pointer', marginBottom:8 }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <Menu size={20} className="nav-icon" />
              : <ChevronLeft size={20} className="nav-icon" />
            }
            <span className="nav-label" style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.8rem' }}>
              Collapse
            </span>
          </button>

          <div className="sidebar-user" id="sidebar-user-block">
            <div 
              className="user-profile-link" 
              onClick={() => { onMobileClose && onMobileClose(); document.getElementById('nav-profile')?.click(); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
              title="View Profile"
            >
              <div className="user-avatar">
                {currentUser.name ? currentUser.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '?'}
              </div>
              <div className="user-info">
                <div className="user-name">{currentUser.name}</div>
                <div className="user-role">{currentUser.role}</div>
              </div>
            </div>
            <LogOut 
              size={18} 
              className="logout-icon" 
              onClick={logout} 
              title="Sign Out"
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
