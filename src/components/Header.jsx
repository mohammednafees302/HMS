import { useState, useRef, useEffect } from 'react'
import { Bell, Sun, Moon, Menu, User, Settings, LogOut, UserPlus, Calendar, Receipt, Building2, Trash2, Shield, AlertCircle } from 'lucide-react'
import { useHMS } from '../context/HMSContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

const PAGE_META = {
  '/':             { title: 'Dashboard',    subtitle: "Welcome back! Here's what's happening today." },
  '/patients':     { title: 'Patients',     subtitle: 'Manage patient records and medical history.' },
  '/doctors':      { title: 'Doctors',      subtitle: 'Manage doctor profiles, schedules and specializations.' },
  '/appointments': { title: 'Appointments', subtitle: 'Schedule and track all patient appointments.' },
  '/departments':  { title: 'Departments',  subtitle: 'Overview of hospital departments and occupancy.' },
  '/billing':      { title: 'Billing',      subtitle: 'Manage invoices, payments and financial records.' },
  '/reports':      { title: 'Reports',      subtitle: 'Analytics and monthly performance reports.' },
  '/profile':      { title: 'Profile',      subtitle: 'Your account information and activity.' },
  '/settings':     { title: 'Settings',     subtitle: 'Customize your preferences and system configuration.' },
}

function getRelativeTime(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function getNotificationIcon(entityType) {
  switch (entityType) {
    case 'PATIENT':
      return <User size={16} />
    case 'DOCTOR':
      return <UserPlus size={16} />
    case 'APPOINTMENT':
      return <Calendar size={16} />
    case 'INVOICE':
      return <Receipt size={16} />
    case 'DEPARTMENT':
      return <Building2 size={16} />
    case 'SETTINGS':
      return <Settings size={16} />
    case 'PROFILE':
      return <User size={16} />
    case 'USER':
      return <Shield size={16} />
    default:
      return <Bell size={16} />
  }
}

function getNotificationIconColor(type) {
  switch (type) {
    case 'SUCCESS':
      return 'var(--success)'
    case 'WARNING':
      return 'var(--warning)'
    case 'ERROR':
      return 'var(--danger)'
    case 'INFO':
    default:
      return 'var(--primary)'
  }
}

export default function Header({ onMobileMenuOpen, onSidebarToggle, pathname }) {
  const { 
    theme, 
    toggleTheme, 
    currentUser, 
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotificationItem
  } = useHMS()
  
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  const meta = PAGE_META[pathname] || PAGE_META['/']

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = currentDate.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
  
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '?'

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const checkEntityExists = async (entityType, entityId) => {
    if (!entityId) return true; // Settings/Profile changes don't have separate entity check
    
    let url = '';
    switch (entityType) {
      case 'PATIENT':
        url = `/patients/${entityId}`;
        break;
      case 'DOCTOR':
        url = `/doctors/${entityId}`;
        break;
      case 'APPOINTMENT':
        url = `/appointments/${entityId}`;
        break;
      case 'INVOICE':
        url = `/billing/${entityId}`;
        break;
      case 'DEPARTMENT':
        url = `/departments/${entityId}`;
        break;
      default:
        return true;
    }
    
    try {
      await api.get(url);
      return true;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return false;
      }
      return false;
    }
  }

  const handleNotificationClick = async (notif) => {
    const exists = await checkEntityExists(notif.entityType, notif.entityId);
    if (!exists) {
      alert("This record no longer exists.");
      return;
    }

    await markNotificationRead(notif.id);
    setNotifOpen(false);

    switch (notif.entityType) {
      case 'PATIENT':
        navigate(`/patients/${notif.entityId}`);
        break;
      case 'DOCTOR':
        navigate('/doctors');
        break;
      case 'APPOINTMENT':
        navigate('/appointments');
        break;
      case 'INVOICE':
        navigate('/billing');
        break;
      case 'DEPARTMENT':
        navigate('/departments');
        break;
      case 'SETTINGS':
        navigate('/settings');
        break;
      case 'PROFILE':
      case 'USER':
        navigate('/profile');
        break;
      default:
        break;
    }
  }

  return (
    <header className="header">
      {/* Hamburger: opens mobile overlay on mobile, toggles collapse on desktop */}
      <button
        className="header-toggle"
        onClick={() => {
          if (window.innerWidth <= 768) {
            onMobileMenuOpen()
          } else {
            onSidebarToggle && onSidebarToggle()
          }
        }}
        id="mobile-menu-btn"
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <div className="header-breadcrumb">
        <h2>{meta.title}</h2>
        <p className="header-subtitle">{meta.subtitle}</p>
      </div>

      <div className="header-actions">
        <span className="header-date">{dateStr}</span>

        {/* Notifications Dropdown */}
        <div className="notification-container" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="header-btn" 
            id="header-notification-btn" 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot" id="unread-count-dot" />}
          </button>
          
          {notifOpen && (
            <div className="dropdown-menu" style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              width: '320px',
              zIndex: 100,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    id="mark-all-read-btn"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <div>No notifications</div>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`dropdown-item ${!notif.isRead ? 'unread' : ''}`} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        padding: '12px 16px', 
                        textDecoration: 'none',
                        position: 'relative',
                        background: !notif.isRead ? 'rgba(14, 165, 233, 0.05)' : 'none',
                        borderBottom: '1px solid var(--border-light, var(--border))'
                      }}
                      id={`notification-item-${notif.id}`}
                    >
                      <div 
                        onClick={() => handleNotificationClick(notif)}
                        style={{ 
                          background: `${getNotificationIconColor(notif.type)}15`, 
                          padding: '8px', 
                          borderRadius: '50%', 
                          color: getNotificationIconColor(notif.type),
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {getNotificationIcon(notif.entityType)}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => handleNotificationClick(notif)}>
                        <div style={{ fontWeight: !notif.isRead ? 600 : 500, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {notif.title}
                          {!notif.isRead && (
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', marginLeft: '6px', verticalAlign: 'middle' }} />
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {getRelativeTime(notif.createdAt)}
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificationItem(notif.id);
                        }} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--text-muted)', 
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.7
                        }}
                        title="Delete notification"
                        id={`delete-notif-btn-${notif.id}`}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          id="theme-toggle-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Sun  size={18} className="theme-icon sun"  />
          <Moon size={18} className="theme-icon moon" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="user-menu-container" ref={menuRef} style={{ position: 'relative' }}>
          <div 
            className="user-avatar" 
            style={{ cursor:'pointer' }} 
            id="header-user-avatar" 
            title={currentUser?.name}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {initials}
          </div>
          
          {menuOpen && (
            <div className="dropdown-menu" style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: '200px',
              zIndex: 100,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.role}</div>
              </div>
              <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                <User size={16} /> Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                <Settings size={16} /> Settings
              </Link>
              <button 
                onClick={() => { setMenuOpen(false); logout(); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'left', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
