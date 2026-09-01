import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useHMS } from '../context/HMSContext'
import { Activity, Mail, Lock, User, AlertCircle, CheckCircle2, Key } from 'lucide-react'

export default function Register() {
  const { fetchUser } = useHMS()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: Email/Password, 2: OTP
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/request-otp', { email })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register-otp', {
        name, email, password, otp
      })
      
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      
      await fetchUser() // Updates HMSContext with user data
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-centered-root">
      <div className="login-bg-overlay" />
      <div className="login-centered-container">
        
        <div className="login-centered-brand">
          <div className="brand-icon-wrapper">
            <Activity size={32} color="white" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>MediCore</h1>
            <span>Hospital Management System</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="header-icon">
              {step === 1 ? <CheckCircle2 size={24} color="#0EA5E9" /> : <Key size={24} color="#0EA5E9" />}
            </div>
            <h2>{step === 1 ? 'Create an account' : 'Enter Verification Code'}</h2>
            <p>
              {step === 1 
                ? 'Join MediCore to manage your healthcare journey' 
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="lp-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="lp-form">
              <div className="lp-input-group">
                <User size={18} className="lp-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="lp-input-group">
                <Mail size={18} className="lp-icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="lp-input-group">
                <Lock size={18} className="lp-icon" />
                <input
                  type="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="lp-btn-primary" disabled={loading}>
                {loading ? 'Sending Code...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="lp-form">
              <div className="lp-input-group">
                <Key size={18} className="lp-icon" />
                <input
                  type="text"
                  placeholder="6-Digit OTP Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  disabled={loading}
                  required
                  maxLength={6}
                  style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem', paddingLeft: '0' }}
                />
              </div>

              <button type="submit" className="lp-btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Complete'}
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="lp-footer">
              <p>Already have an account? <Link to="/login">Sign in instead</Link></p>
            </div>
          )}
          {step === 2 && (
            <div className="lp-footer">
              <p>Didn't receive it? <button onClick={() => setStep(1)} style={{background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer'}}>Go back</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
