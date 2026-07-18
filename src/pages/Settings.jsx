import { useState } from 'react'
import { useHMS } from '../context/HMSContext'
import {
  Palette, Bell, Globe, Shield, Building2, Sun, Moon, Monitor,
  Check, Save,
} from 'lucide-react'

const NAV = [
  { id: 'appearance', icon: Palette,  label: 'Appearance' },
  { id: 'notifications', icon: Bell,  label: 'Notifications' },
  { id: 'regional', icon: Globe,      label: 'Regional' },
  { id: 'security', icon: Shield,     label: 'Security' },
  { id: 'hospital', icon: Building2,  label: 'Hospital Info' },
]

const ACCENTS = [
  { color: '#0EA5E9', name: 'Sky Blue' },
  { color: '#6366F1', name: 'Indigo' },
  { color: '#10B981', name: 'Emerald' },
  { color: '#F59E0B', name: 'Amber' },
  { color: '#F43F5E', name: 'Rose' },
  { color: '#8B5CF6', name: 'Violet' },
  { color: '#06B6D4', name: 'Cyan' },
  { color: '#EC4899', name: 'Pink' },
]

function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

function ToggleRow({ title, desc, checked, onChange, id }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} id={id} />
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme, accent, setAccent, settings, updateSetting, saveSettings } = useHMS()
  const [active, setActive] = useState('appearance')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await saveSettings()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">
          <h1>Settings</h1>
          <p>Manage preferences, notifications, and hospital configuration</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn">
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="settings-grid">
        {/* Settings Sidebar Nav */}
        <div className="settings-sidebar">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`settings-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
              id={`settings-nav-${id}`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">

          {/* ---- APPEARANCE ---- */}
          {active === 'appearance' && (
            <>
              <div className="settings-section">
                <div className="settings-section-header">
                  <Palette size={20} color="var(--primary)" />
                  <div>
                    <h3>Theme</h3>
                    <p>Choose light or dark mode for the interface</p>
                  </div>
                </div>
                <div className="settings-body">
                  <div className="theme-options">
                    {/* Light */}
                    <div
                      className={`theme-option ${theme === 'light' ? 'selected' : ''}`}
                      onClick={() => setTheme('light')}
                      id="theme-light-option"
                    >
                      <div className="theme-preview">
                        <div className="theme-preview-sidebar" style={{ background: '#0F172A' }} />
                        <div className="theme-preview-content" style={{ background: '#F1F5F9' }} />
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <Sun size={14} />
                        <span className="theme-option-label">Light Mode</span>
                        {theme === 'light' && <Check size={14} color="var(--primary)" />}
                      </div>
                    </div>
                    {/* Dark */}
                    <div
                      className={`theme-option ${theme === 'dark' ? 'selected' : ''}`}
                      onClick={() => setTheme('dark')}
                      id="theme-dark-option"
                    >
                      <div className="theme-preview">
                        <div className="theme-preview-sidebar" style={{ background: '#0F172A' }} />
                        <div className="theme-preview-content" style={{ background: '#0A0F1E' }} />
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <Moon size={14} />
                        <span className="theme-option-label">Dark Mode</span>
                        {theme === 'dark' && <Check size={14} color="var(--primary)" />}
                      </div>
                    </div>
                    {/* System */}
                    <div 
                      className={`theme-option ${theme === 'system' ? 'selected' : ''}`} 
                      onClick={() => setTheme('system')}
                      id="theme-system-option"
                    >
                      <div className="theme-preview">
                        <div className="theme-preview-sidebar" style={{ background: '#0F172A' }} />
                        <div className="theme-preview-content" style={{ background:'linear-gradient(to right,#F1F5F9 50%,#0A0F1E 50%)' }} />
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <Monitor size={14} />
                        <span className="theme-option-label">System</span>
                        {theme === 'system' && <Check size={14} color="var(--primary)" />}
                      </div>
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Accent Color */}
                  <div>
                    <div style={{ fontWeight:700, marginBottom:'var(--space-3)', color:'var(--text-primary)' }}>Accent Color</div>
                    <div className="accent-options">
                      {ACCENTS.map(a => (
                        <div
                          key={a.color}
                          className={`accent-dot ${accent === a.color ? 'selected' : ''}`}
                          style={{ background: a.color, color: a.color }}
                          onClick={() => setAccent(a.color)}
                          data-tooltip={a.name}
                          id={`accent-${a.name.toLowerCase().replace(' ','-')}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Compact View */}
                  <ToggleRow
                    title="Compact View"
                    desc="Reduce spacing for higher information density"
                    checked={settings.compactView}
                    onChange={v => updateSetting('compactView', v)}
                    id="toggle-compact"
                  />
                </div>
              </div>
            </>
          )}

          {/* ---- NOTIFICATIONS ---- */}
          {active === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Bell size={20} color="var(--primary)" />
                <div>
                  <h3>Notification Preferences</h3>
                  <p>Control which alerts and updates you receive</p>
                </div>
              </div>
              <div className="settings-body">
                <ToggleRow title="Push Notifications" desc="Receive in-app real-time notifications" checked={settings.notifications} onChange={v=>updateSetting('notifications',v)} id="toggle-notif" />
                <ToggleRow title="Email Alerts" desc="Get important alerts via email" checked={settings.emailAlerts} onChange={v=>updateSetting('emailAlerts',v)} id="toggle-email" />
                <ToggleRow title="SMS Alerts" desc="Receive critical updates via SMS" checked={settings.smsAlerts} onChange={v=>updateSetting('smsAlerts',v)} id="toggle-sms" />
                <ToggleRow title="Appointment Reminders" desc="Notify staff 30 mins before appointments" checked={settings.appointmentReminders} onChange={v=>updateSetting('appointmentReminders',v)} id="toggle-appt-reminder" />
                <ToggleRow title="Critical Patient Alerts" desc="Instant alerts for critical patient status changes" checked={settings.criticalAlerts} onChange={v=>updateSetting('criticalAlerts',v)} id="toggle-critical" />
                <ToggleRow title="Weekly Summary Report" desc="Receive weekly performance report every Monday" checked={settings.weeklyReport} onChange={v=>updateSetting('weeklyReport',v)} id="toggle-weekly" />
              </div>
            </div>
          )}

          {/* ---- REGIONAL ---- */}
          {active === 'regional' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Globe size={20} color="var(--primary)" />
                <div>
                  <h3>Regional Settings</h3>
                  <p>Language, date, and timezone preferences</p>
                </div>
              </div>
              <div className="settings-body">
                {[
                  { label:'Language', key:'language', opts:['English','Hindi','Tamil','Telugu','Kannada','Marathi'] },
                  { label:'Date Format', key:'dateFormat', opts:['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'] },
                  { label:'Timezone', key:'timezone', opts:['Asia/Kolkata','Asia/Dubai','UTC','America/New_York','Europe/London'] },
                ].map(({ label, key, opts }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <select
                      className="form-select"
                      value={settings[key]}
                      onChange={e => updateSetting(key, e.target.value)}
                      id={`setting-${key}`}
                    >
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- SECURITY ---- */}
          {active === 'security' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Shield size={20} color="var(--primary)" />
                <div>
                  <h3>Security Settings</h3>
                  <p>Manage your password and account security</p>
                </div>
              </div>
              <div className="settings-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" placeholder="Enter current password" id="current-password-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" placeholder="New password" id="new-password-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-input" type="password" placeholder="Confirm new password" id="confirm-password-input" />
                  </div>
                </div>
                <div className="divider" />
                <div style={{ padding:'var(--space-4)', background:'rgba(14,165,233,0.05)', borderRadius:'var(--radius)', border:'1px solid rgba(14,165,233,0.15)' }}>
                  <div style={{ fontWeight:700, marginBottom:8, color:'var(--text-primary)', fontSize:'0.9rem' }}>🔒 Two-Factor Authentication</div>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginBottom:12 }}>Add an extra layer of security to your account.</p>
                  <button className="btn btn-primary btn-sm" id="enable-2fa-btn">Enable 2FA</button>
                </div>
                <div style={{ padding:'var(--space-4)', background:'rgba(244,63,94,0.05)', borderRadius:'var(--radius)', border:'1px solid rgba(244,63,94,0.15)' }}>
                  <div style={{ fontWeight:700, marginBottom:8, color:'var(--danger)', fontSize:'0.9rem' }}>⚠️ Active Sessions</div>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginBottom:12 }}>You are currently logged in from 1 device.</p>
                  <button className="btn btn-danger btn-sm" id="logout-all-btn">Logout All Devices</button>
                </div>
              </div>
            </div>
          )}

          {/* ---- HOSPITAL INFO ---- */}
          {active === 'hospital' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Building2 size={20} color="var(--primary)" />
                <div>
                  <h3>Hospital Information</h3>
                  <p>Basic details about your healthcare facility</p>
                </div>
              </div>
              <div className="settings-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Hospital Name</label>
                    <input className="form-input" defaultValue="MediCore General Hospital" id="hospital-name-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input className="form-input" defaultValue="KA-HOS-2019-00142" id="hospital-reg-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" id="hospital-type-select">
                      <option>General Hospital</option>
                      <option>Specialty Hospital</option>
                      <option>Teaching Hospital</option>
                      <option>Clinic</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" defaultValue="#42, MG Road, Bengaluru, Karnataka 560001" id="hospital-address-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" defaultValue="+91-80-4000-1234" id="hospital-phone-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" defaultValue="info@medicore.in" id="hospital-email-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Beds</label>
                    <input className="form-input" type="number" defaultValue="157" id="hospital-beds-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Founded Year</label>
                    <input className="form-input" type="number" defaultValue="2008" id="hospital-founded-input" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
