// =====================================================
// HMS Mock Data — Rich Sample Dataset
// =====================================================

export const patients = [
  { id: 'P001', name: 'Aisha Patel',      age: 34, gender: 'Female', blood: 'A+',  phone: '+91-98765-43210', dept: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'Active',     admitted: '2026-07-01', diagnosis: 'Hypertension', room: '201' },
  { id: 'P002', name: 'Mohammed Al-Rashid',age:58, gender: 'Male',   blood: 'O+',  phone: '+91-87654-32109', dept: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'Critical',   admitted: '2026-07-03', diagnosis: 'Stroke',      room: 'ICU-1' },
  { id: 'P003', name: 'Sneha Nair',        age: 27, gender: 'Female', blood: 'B-',  phone: '+91-76543-21098', dept: 'Orthopedics',  doctor: 'Dr. Arjun Menon',   status: 'Active',     admitted: '2026-07-05', diagnosis: 'Fracture',    room: '305' },
  { id: 'P004', name: 'Ravi Krishnan',     age: 45, gender: 'Male',   blood: 'AB+', phone: '+91-65432-10987', dept: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'Discharged', admitted: '2026-06-28', diagnosis: 'Angina',      room: '—' },
  { id: 'P005', name: 'Fatima Begum',      age: 62, gender: 'Female', blood: 'O-',  phone: '+91-54321-09876', dept: 'Pediatrics',   doctor: 'Dr. Meena Iyer',    status: 'Active',     admitted: '2026-07-06', diagnosis: 'Diabetes',    room: '112' },
  { id: 'P006', name: 'Samuel Thomas',     age: 31, gender: 'Male',   blood: 'B+',  phone: '+91-43210-98765', dept: 'Dermatology',  doctor: 'Dr. Kavita Rao',    status: 'Active',     admitted: '2026-07-07', diagnosis: 'Psoriasis',   room: '405' },
  { id: 'P007', name: 'Lakshmi Devi',      age: 72, gender: 'Female', blood: 'A-',  phone: '+91-32109-87654', dept: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'Active',     admitted: '2026-07-04', diagnosis: "Parkinson's", room: '207' },
  { id: 'P008', name: 'Kiran Reddy',       age: 19, gender: 'Male',   blood: 'O+',  phone: '+91-21098-76543', dept: 'Orthopedics',  doctor: 'Dr. Arjun Menon',   status: 'Discharged', admitted: '2026-06-25', diagnosis: 'Sports Injury',room: '—' },
  { id: 'P009', name: 'Ananya Gupta',      age: 8,  gender: 'Female', blood: 'A+',  phone: '+91-10987-65432', dept: 'Pediatrics',   doctor: 'Dr. Meena Iyer',    status: 'Active',     admitted: '2026-07-08', diagnosis: 'Pneumonia',   room: '115' },
  { id: 'P010', name: 'Suresh Babu',       age: 53, gender: 'Male',   blood: 'B+',  phone: '+91-90876-54321', dept: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'Critical',   admitted: '2026-07-07', diagnosis: 'Heart Failure',room:'ICU-2' },
  { id: 'P011', name: 'Preethi Srinivasan',age: 38, gender: 'Female', blood: 'AB-', phone: '+91-80765-43210', dept: 'Dermatology',  doctor: 'Dr. Kavita Rao',    status: 'Active',     admitted: '2026-07-09', diagnosis: 'Eczema',      room: '408' },
  { id: 'P012', name: 'Vijay Anand',       age: 66, gender: 'Male',   blood: 'O+',  phone: '+91-70654-32109', dept: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'Active',     admitted: '2026-07-02', diagnosis: 'Epilepsy',    room: '210' },
]

export const doctors = [
  { id: 'D001', name: 'Dr. Rajesh Kumar',   dept: 'Cardiology',   specialization: 'Interventional Cardiology', experience: 18, phone: '+91-98111-22333', email: 'rajesh.kumar@hms.in',  patients: 42, status: 'Active',    availability: 'Mon-Fri 9am-5pm', qualification: 'MBBS, MD, DM Cardiology' },
  { id: 'D002', name: 'Dr. Priya Sharma',   dept: 'Neurology',    specialization: 'Clinical Neurology',         experience: 14, phone: '+91-98222-33444', email: 'priya.sharma@hms.in',  patients: 31, status: 'Active',    availability: 'Mon-Sat 10am-6pm', qualification: 'MBBS, MD, DM Neurology' },
  { id: 'D003', name: 'Dr. Arjun Menon',    dept: 'Orthopedics',  specialization: 'Joint Replacement',          experience: 22, phone: '+91-98333-44555', email: 'arjun.menon@hms.in',   patients: 28, status: 'Active',    availability: 'Mon-Thu 8am-4pm',  qualification: 'MBBS, MS Ortho' },
  { id: 'D004', name: 'Dr. Meena Iyer',     dept: 'Pediatrics',   specialization: 'Neonatology',                experience: 11, phone: '+91-98444-55666', email: 'meena.iyer@hms.in',    patients: 56, status: 'Active',    availability: 'Tue-Sat 9am-5pm',  qualification: 'MBBS, MD Pediatrics' },
  { id: 'D005', name: 'Dr. Kavita Rao',     dept: 'Dermatology',  specialization: 'Cosmetic Dermatology',       experience: 9,  phone: '+91-98555-66777', email: 'kavita.rao@hms.in',    patients: 34, status: 'Active',    availability: 'Mon-Fri 11am-7pm', qualification: 'MBBS, MD Dermatology' },
  { id: 'D006', name: 'Dr. Sanjay Patel',   dept: 'General Surgery',specialization:'Laparoscopic Surgery',      experience: 17, phone: '+91-98666-77888', email: 'sanjay.patel@hms.in',  patients: 19, status: 'On Leave', availability: 'Mon-Fri 9am-3pm',  qualification: 'MBBS, MS Surgery' },
  { id: 'D007', name: 'Dr. Rekha Joshi',    dept: 'Obstetrics',   specialization: 'High Risk Pregnancy',        experience: 15, phone: '+91-98777-88999', email: 'rekha.joshi@hms.in',   patients: 23, status: 'Active',    availability: 'Mon-Sat 8am-2pm',  qualification: 'MBBS, MS OBG' },
  { id: 'D008', name: 'Dr. Arun Pillai',    dept: 'Oncology',     specialization: 'Medical Oncology',           experience: 20, phone: '+91-98888-99000', email: 'arun.pillai@hms.in',   patients: 15, status: 'Active',    availability: 'Tue-Fri 10am-4pm', qualification: 'MBBS, MD, DM Oncology' },
]

export const appointments = [
  { id: 'A001', patient: 'Aisha Patel',       doctor: 'Dr. Rajesh Kumar', dept: 'Cardiology',   date: '2026-07-09', time: '09:00', status: 'Scheduled', type: 'Follow-up',   room: '201' },
  { id: 'A002', patient: 'Mohammed Al-Rashid',doctor: 'Dr. Priya Sharma', dept: 'Neurology',    date: '2026-07-09', time: '10:30', status: 'Completed', type: 'Emergency',   room: 'ICU-1' },
  { id: 'A003', patient: 'Sneha Nair',         doctor: 'Dr. Arjun Menon',  dept: 'Orthopedics',  date: '2026-07-09', time: '11:00', status: 'Scheduled', type: 'Consultation',room: '305' },
  { id: 'A004', patient: 'Fatima Begum',       doctor: 'Dr. Meena Iyer',   dept: 'Pediatrics',   date: '2026-07-09', time: '14:00', status: 'Scheduled', type: 'Check-up',    room: '112' },
  { id: 'A005', patient: 'Samuel Thomas',      doctor: 'Dr. Kavita Rao',   dept: 'Dermatology',  date: '2026-07-09', time: '15:30', status: 'Cancelled', type: 'Consultation',room: '405' },
  { id: 'A006', patient: 'Suresh Babu',        doctor: 'Dr. Rajesh Kumar', dept: 'Cardiology',   date: '2026-07-10', time: '09:30', status: 'Scheduled', type: 'Emergency',   room: 'ICU-2' },
  { id: 'A007', patient: 'Ananya Gupta',       doctor: 'Dr. Meena Iyer',   dept: 'Pediatrics',   date: '2026-07-10', time: '10:00', status: 'Scheduled', type: 'Follow-up',   room: '115' },
  { id: 'A008', patient: 'Lakshmi Devi',       doctor: 'Dr. Priya Sharma', dept: 'Neurology',    date: '2026-07-10', time: '11:30', status: 'Scheduled', type: 'Check-up',    room: '207' },
  { id: 'A009', patient: 'Kiran Reddy',        doctor: 'Dr. Arjun Menon',  dept: 'Orthopedics',  date: '2026-07-08', time: '09:00', status: 'Completed', type: 'Follow-up',   room: '305' },
  { id: 'A010', patient: 'Preethi Srinivasan', doctor: 'Dr. Kavita Rao',   dept: 'Dermatology',  date: '2026-07-09', time: '16:00', status: 'Scheduled', type: 'New Patient', room: '408' },
  { id: 'A011', patient: 'Vijay Anand',        doctor: 'Dr. Priya Sharma', dept: 'Neurology',    date: '2026-07-11', time: '10:00', status: 'Scheduled', type: 'Follow-up',   room: '210' },
  { id: 'A012', patient: 'Ravi Krishnan',      doctor: 'Dr. Rajesh Kumar', dept: 'Cardiology',   date: '2026-07-11', time: '14:30', status: 'Scheduled', type: 'Follow-up',   room: '201' },
]

export const departments = [
  { id: 'DEP01', name: 'Cardiology',     head: 'Dr. Rajesh Kumar', doctors: 3, beds: 20, occupied: 15, icon: '🫀', color: '#F43F5E', bg: 'rgba(244,63,94,0.08)' },
  { id: 'DEP02', name: 'Neurology',      head: 'Dr. Priya Sharma', doctors: 2, beds: 18, occupied: 10, icon: '🧠', color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
  { id: 'DEP03', name: 'Orthopedics',    head: 'Dr. Arjun Menon',  doctors: 4, beds: 25, occupied: 18, icon: '🦴', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
  { id: 'DEP04', name: 'Pediatrics',     head: 'Dr. Meena Iyer',   doctors: 3, beds: 30, occupied: 20, icon: '👶', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { id: 'DEP05', name: 'Dermatology',    head: 'Dr. Kavita Rao',   doctors: 2, beds: 12, occupied: 6,  icon: '🩺', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { id: 'DEP06', name: 'General Surgery',head: 'Dr. Sanjay Patel', doctors: 5, beds: 22, occupied: 14, icon: '🔪', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  { id: 'DEP07', name: 'Obstetrics',     head: 'Dr. Rekha Joshi',  doctors: 3, beds: 16, occupied: 9,  icon: '🤰', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
  { id: 'DEP08', name: 'Oncology',       head: 'Dr. Arun Pillai',  doctors: 2, beds: 14, occupied: 10, icon: '🎗️', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
]

export const invoices = [
  { id: 'INV-001', patient: 'Aisha Patel',        date: '2026-07-01', due: '2026-07-15', items: ['Consultation','ECG','Medicines'],          amount: 4500,  status: 'Paid' },
  { id: 'INV-002', patient: 'Mohammed Al-Rashid', date: '2026-07-03', due: '2026-07-17', items: ['Emergency','MRI','ICU Stay (3d)'],          amount: 52000, status: 'Pending' },
  { id: 'INV-003', patient: 'Sneha Nair',         date: '2026-07-05', due: '2026-07-19', items: ['Surgery','X-Ray','Room (2d)'],              amount: 28000, status: 'Pending' },
  { id: 'INV-004', patient: 'Ravi Krishnan',      date: '2026-06-28', due: '2026-07-05', items: ['Consultation','Stress Test','Medicines'],   amount: 8200,  status: 'Paid' },
  { id: 'INV-005', patient: 'Fatima Begum',       date: '2026-07-06', due: '2026-07-20', items: ['Consultation','Blood Work','Insulin'],      amount: 3800,  status: 'Paid' },
  { id: 'INV-006', patient: 'Samuel Thomas',      date: '2026-07-07', due: '2026-07-14', items: ['Consultation','Skin Biopsy','Medicines'],   amount: 6500,  status: 'Pending' },
  { id: 'INV-007', patient: 'Kiran Reddy',        date: '2026-06-25', due: '2026-06-30', items: ['Physiotherapy','X-Ray','Room (1d)'],        amount: 9400,  status: 'Overdue' },
  { id: 'INV-008', patient: 'Suresh Babu',        date: '2026-07-07', due: '2026-07-21', items: ['Emergency','Echo','ICU Stay (2d)'],         amount: 38000, status: 'Pending' },
  { id: 'INV-009', patient: 'Ananya Gupta',       date: '2026-07-08', due: '2026-07-22', items: ['Admission','Chest X-Ray','Antibiotics'],    amount: 5200,  status: 'Pending' },
  { id: 'INV-010', patient: 'Preethi Srinivasan', date: '2026-07-09', due: '2026-07-23', items: ['Consultation','Patch Test','Cream'],        amount: 2900,  status: 'Paid' },
]

export const chartData = {
  admissions: [
    { month: 'Jan', patients: 68 },
    { month: 'Feb', patients: 72 },
    { month: 'Mar', patients: 85 },
    { month: 'Apr', patients: 78 },
    { month: 'May', patients: 91 },
    { month: 'Jun', patients: 88 },
    { month: 'Jul', patients: 95 },
  ],
  deptDistribution: [
    { name: 'Cardiology',   value: 22, color: '#F43F5E' },
    { name: 'Neurology',    value: 15, color: '#6366F1' },
    { name: 'Orthopedics',  value: 20, color: '#0EA5E9' },
    { name: 'Pediatrics',   value: 18, color: '#10B981' },
    { name: 'Dermatology',  value: 10, color: '#F59E0B' },
    { name: 'Others',       value: 15, color: '#94A3B8' },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 420000 },
    { month: 'Feb', revenue: 390000 },
    { month: 'Mar', revenue: 510000 },
    { month: 'Apr', revenue: 480000 },
    { month: 'May', revenue: 560000 },
    { month: 'Jun', revenue: 530000 },
    { month: 'Jul', revenue: 580000 },
  ],
}
