import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { api } from '../utils/api'
import {
  doctors as initialDoctors,
  appointments as initialAppointments,
  invoices as initialInvoices,
} from '../data/mockData'

const HMSContext = createContext(null)

export function HMSProvider({ children }) {
  const [doctors, setDoctors] = useState(initialDoctors)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [invoices, setInvoices] = useState(initialInvoices)

  // ---- Auth ----
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('accessToken')
  })
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // ---- Notifications ----
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get('/notifications')
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || [])
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchNotifications()
    if (isAuthenticated) {
      const interval = setInterval(fetchNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchNotifications])

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.warn('Failed to mark notification as read:', err)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.warn('Failed to mark all as read:', err)
    }
  }

  const deleteNotificationItem = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.warn('Failed to delete notification:', err)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await authService.login(email, password)
      
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      
      setCurrentUser(data.user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed. Please check your credentials.'
      }
    }
  }

  const logout = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await authService.logout()
      }
    } catch (err) {
      console.warn('Backend logout failed or was already invalid', err)
    } finally {
      setIsAuthenticated(false)
      setCurrentUser(null)
      setNotifications([])
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('currentUser')
    }
  }, [isAuthenticated])

  // Listen for 401 token refresh failures from Axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      logout()
    }
    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [logout])

  // ---- Theme ----
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hms_theme') || 'light'
  })
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('hms_accent') || '#0EA5E9'
  })

  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = theme
      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
    
    applyTheme()
    localStorage.setItem('hms_theme', theme)
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme() }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', accent)
    localStorage.setItem('hms_accent', accent)
  }, [accent])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  // ---- Settings ----
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    appointmentReminders: true,
    criticalAlerts: true,
    weeklyReport: false,
    compactView: false,
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
  })

  const updateSetting = (key, value) =>
    setSettings(s => ({ ...s, [key]: value }))

  const saveSettings = async () => {
    try {
      await api.put('/users/me/settings', settings)
      fetchNotifications()
    } catch (err) {
      console.warn('Failed to save settings:', err)
    }
  }

  // ---- Doctors ----
  const addDoctor = (d) => {
    const id = 'D' + String(doctors.length + 1).padStart(3, '0')
    setDoctors(prev => [...prev, { ...d, id, patients: 0, status: d.status || 'Active' }])
  }
  const updateDoctor = (id, data) =>
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)))
  const deleteDoctor = (id) =>
    setDoctors(prev => prev.filter(d => d.id !== id))

  // ---- Appointments ----
  const addAppointment = (a) => {
    const id = 'A' + String(appointments.length + 1).padStart(3, '0')
    setAppointments(prev => [...prev, { ...a, id, status: a.status || 'Scheduled' }])
  }
  const updateAppointment = (id, data) =>
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)))
  const deleteAppointment = (id) =>
    setAppointments(prev => prev.filter(a => a.id !== id))

  // ---- Invoices ----
  const addInvoice = (inv) => {
    const id = 'INV-' + String(invoices.length + 1).padStart(3, '0')
    setInvoices(prev => [...prev, { ...inv, id }])
  }
  const updateInvoice = (id, data) =>
    setInvoices(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)))

  // ---- Temporary Stubs for Unmigrated Modules ----
  const patients = []

  // ---- Stats ----
  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'Active').length,
    criticalPatients: patients.filter(p => p.status === 'Critical').length,
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter(d => d.status === 'Active').length,
    todayAppointments: appointments.filter(a => a.date === '2026-07-09').length,
    scheduledToday: appointments.filter(a => a.date === '2026-07-09' && a.status === 'Scheduled').length,
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    pendingBilling: invoices.filter(i => i.status === 'Pending').length,
    totalBeds: 157,
    occupiedBeds: 102,
  }

  return (
    <HMSContext.Provider value={{
      // auth
      isAuthenticated, login, logout, currentUser,
      // theme & appearance
      theme, setTheme, toggleTheme, accent, setAccent,
      // settings
      settings, updateSetting, saveSettings,
      // notifications
      notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotificationItem,
      // data
      patients,
      doctors, addDoctor, updateDoctor, deleteDoctor,
      appointments, addAppointment, updateAppointment, deleteAppointment,
      invoices, addInvoice, updateInvoice,
      stats,
    }}>
      {children}
    </HMSContext.Provider>
  )
}

export const useHMS = () => {
  const ctx = useContext(HMSContext)
  if (!ctx) throw new Error('useHMS must be used within HMSProvider')
  return ctx
}
