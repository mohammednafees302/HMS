import { useState, useEffect, useCallback } from 'react'
import { useHMS } from '../context/HMSContext'
import {
  Mail, Phone, MapPin, Calendar, Shield, Pencil, Save, X,
  Activity, Users, CalendarDays, Receipt, Clock,
} from 'lucide-react'
import { userService } from '../services/userService'

export default function Profile() {
  const { logout } = useHMS()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userService.getProfile()
      const data = res.data || res;
      setProfile(data)
      setForm({ name: data.user.name, phone: data.user.phone || '' })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    setSaving(true)
    try {
      await userService.updateProfile(form)
      await loadProfile()
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({ name: profile.user.name, phone: profile.user.phone || '' })
    }
    setEditing(false)
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (loading || !profile) return <div style={{ padding: 60, textAlign: 'center' }}>Loading profile...</div>

  const { user, doctor, patient } = profile
  const initials = user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="animate-fade">
      {/* Hero Banner */}
      <div className="profile-hero">
        <div className="profile-cover-art">🏥</div>

        <div className="profile-hero-top">
          <div style={{ position:'relative' }}>
            <div className="profile-avatar-large">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            </div>
            {/* Note: file upload handled via separate component/endpoint in real implementation if needed */}
          </div>
          <div className="profile-hero-info">
            <h2>{user.name}</h2>
            <p>{user.role} · {doctor?.department?.name || 'HMS System'}</p>
            <div className="profile-hero-badges">
              <span className="profile-hero-badge">✅ Active</span>
            </div>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', gap:'var(--space-3)', paddingBottom:16, flexShrink:0 }}>
            {editing ? (
              <>
                <button className="btn btn-secondary" onClick={handleCancel} id="cancel-edit-btn" disabled={saving}>
                  <X size={15}/> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} id="save-profile-btn" disabled={saving}>
                  <Save size={15}/> {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </>
            ) : (
              <button className="btn btn-secondary" style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}
                onClick={() => setEditing(true)} id="edit-profile-btn">
                <Pencil size={15}/> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-stats-row">
          {[
            { val: '-', lbl: 'Patients Managed' },
            { val: '-', lbl: 'Doctors Supervised' },
            { val: '-', lbl: 'Today\'s Appts' },
            { val: '-', lbl: 'Pending Bills' },
          ].map(s => (
            <div key={s.lbl} className="profile-stat">
              <div className="profile-stat-val">{s.val}</div>
              <div className="profile-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'var(--space-3) var(--space-5)', color:'var(--success)', fontWeight:600, fontSize:'0.875rem', marginBottom:'var(--space-4)', display:'flex', alignItems:'center', gap:'var(--space-2)', animation:'slideUp 0.2s ease' }}>
          ✓ Profile updated successfully
        </div>
      )}

      <div className="profile-grid">
        {/* Left column - Info */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
          {/* Personal Info */}
          <div className="profile-info-card">
            <div className="card-header">
              <div className="card-title">Personal Information</div>
              {!editing && (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} id="edit-info-btn">
                  <Pencil size={14}/> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ padding:'var(--space-5)' }}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e=>setField('name',e.target.value)} id="profile-name-input"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e=>setField('phone',e.target.value)} id="profile-phone-input"/>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Email (Read Only)</label>
                    <input className="form-input" type="email" value={user.email} disabled id="profile-email-input"/>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-info-list">
                {[
                  { icon: Mail,     label:'Email',    value: user.email },
                  { icon: Phone,    label:'Phone',    value: user.phone || 'Not provided' },
                  { icon: Calendar, label:'Joined',   value: new Date(user.createdAt).toLocaleDateString() },
                  { icon: Shield,   label:'Role',     value: user.role },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="profile-info-item">
                    <div className="profile-info-icon">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="profile-info-label">{label}</div>
                      <div className="profile-info-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Activity */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
          {/* Role Specific Info */}
          {doctor && (
            <div className="profile-info-card">
              <div className="card-header">
                <div className="card-title">Doctor Details</div>
              </div>
              <div className="profile-info-list">
                {[
                  { label:'Department', value: doctor.department?.name },
                  { label:'Specialization', value: doctor.specialization },
                  { label:'Qualification',   value: doctor.qualification },
                  { label:'Experience', value: `${doctor.experience} years` },
                  { label:'Availability', value: doctor.availability },
                ].map(({ label, value }) => (
                  <div key={label} className="profile-info-item">
                    <div>
                      <div className="profile-info-label">{label}</div>
                      <div className="profile-info-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="card" style={{ border:'1px solid rgba(244,63,94,0.2)' }}>
            <div className="card-header">
              <div className="card-title" style={{ color:'var(--danger)' }}>Danger Zone</div>
            </div>
            <div className="card-body">
              <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', marginBottom:'var(--space-4)' }}>
                Signing out will clear your session. You'll need to log in again to access the HMS.
              </p>
              <button className="btn btn-danger" onClick={logout} id="logout-btn">
                Sign Out of HMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
