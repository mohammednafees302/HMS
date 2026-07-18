export default function Badge({ status }) {
  const map = {
    'Active':     'active',
    'Inactive':   'inactive',
    'Critical':   'critical',
    'Discharged': 'discharged',
    'Pending':    'pending',
    'Scheduled':  'scheduled',
    'Completed':  'completed',
    'Cancelled':  'cancelled',
    'Paid':       'paid',
    'Overdue':    'overdue',
    'On Leave':   'pending',
  }
  const cls = map[status] || 'inactive'
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" style={{
        backgroundColor: 'currentColor',
        opacity: 0.7,
      }} />
      {status}
    </span>
  )
}
