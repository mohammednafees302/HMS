import { useState } from 'react'
import { useHMS } from '../context/HMSContext'
import {
  Activity, Mail, Lock, Eye, EyeOff, AlertCircle,
  Shield, CheckCircle2, ChevronRight
} from 'lucide-react'

export default function Login() {
  const { login } = useHMS()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter both email and password.'); return }
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (!result.success) { setError(result.error || 'Invalid credentials. Please try again.'); setLoading(false) }
  }

  return (
    <div className="login-centered-root">
      {/* Background Overlay */}
      <div className="login-bg-overlay" />

      {/* Main Content Container */}
      <div className="login-centered-container">
        
        {/* Top Brand Logo */}
        <div className="login-centered-brand">
          <div className="brand-icon-wrapper">
            <Activity size={32} color="white" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>MediCore</h1>
            <span>Hospital Management System</span>
          </div>
        </div>

        {/* The Card */}
        <div className="login-card">
          <div className="login-card-header">
            <div className="header-icon">
              <CheckCircle2 size={24} color="#0EA5E9" />
            </div>
            <h2>Sign in to your account</h2>
            <p>Access your dashboard and manage hospital operations</p>
          </div>

          {error && (
            <div className="lp-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="lp-form" noValidate>
            {/* Email */}
            <div className="lp-field">
              <div className="lp-input-wrap">
                <Mail size={18} className="lp-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="lp-input centered-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-input-wrap">
                <Lock size={18} className="lp-input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="lp-input centered-input lp-input--pr"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="forgot-password-row">
                <button type="button" className="lp-forgot">Forgot password?</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              className="lp-submit centered-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="lp-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={18} />
                </>
              )}
            </button>
            
            <div className="social-divider">
              <span>or</span>
            </div>

            <div className="social-login-row">
              <button type="button" className="social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="social-icon">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Continue with Google
              </button>
              <button type="button" className="social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="social-icon">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div className="login-card-footer">
             <Shield size={14} color="#64748B"/>
             <span>Secure • Reliable • Trusted by 200+ Healthcare Professionals</span>
          </div>
        </div>

        <p className="login-centered-footer">
          © 2026 MediCore HMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
