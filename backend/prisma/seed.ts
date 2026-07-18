import { prisma } from '../src/prisma/client';

const patients = [
  { name: 'Aisha Patel',      age: 34, gender: 'Female', bloodType: 'A+',  phone: '+91-98765-43210', department: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'ACTIVE',     admittedAt: new Date('2026-07-01'), diagnosis: 'Hypertension', roomNumber: '201' },
  { name: 'Mohammed Al-Rashid',age:58, gender: 'Male',   bloodType: 'O+',  phone: '+91-87654-32109', department: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'CRITICAL',   admittedAt: new Date('2026-07-03'), diagnosis: 'Stroke',      roomNumber: 'ICU-1' },
  { name: 'Sneha Nair',        age: 27, gender: 'Female', bloodType: 'B-',  phone: '+91-76543-21098', department: 'Orthopedics',  doctor: 'Dr. Arjun Menon',   status: 'ACTIVE',     admittedAt: new Date('2026-07-05'), diagnosis: 'Fracture',    roomNumber: '305' },
  { name: 'Ravi Krishnan',     age: 45, gender: 'Male',   bloodType: 'AB+', phone: '+91-65432-10987', department: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'DISCHARGED', admittedAt: new Date('2026-06-28'), diagnosis: 'Angina',      roomNumber: '—' },
  { name: 'Fatima Begum',      age: 62, gender: 'Female', bloodType: 'O-',  phone: '+91-54321-09876', department: 'Pediatrics',   doctor: 'Dr. Meena Iyer',    status: 'ACTIVE',     admittedAt: new Date('2026-07-06'), diagnosis: 'Diabetes',    roomNumber: '112' },
  { name: 'Samuel Thomas',     age: 31, gender: 'Male',   bloodType: 'B+',  phone: '+91-43210-98765', department: 'Dermatology',  doctor: 'Dr. Kavita Rao',    status: 'ACTIVE',     admittedAt: new Date('2026-07-07'), diagnosis: 'Psoriasis',   roomNumber: '405' },
  { name: 'Lakshmi Devi',      age: 72, gender: 'Female', bloodType: 'A-',  phone: '+91-32109-87654', department: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'ACTIVE',     admittedAt: new Date('2026-07-04'), diagnosis: "Parkinson's", roomNumber: '207' },
  { name: 'Kiran Reddy',       age: 19, gender: 'Male',   bloodType: 'O+',  phone: '+91-21098-76543', department: 'Orthopedics',  doctor: 'Dr. Arjun Menon',   status: 'DISCHARGED', admittedAt: new Date('2026-06-25'), diagnosis: 'Sports Injury',roomNumber: '—' },
  { name: 'Ananya Gupta',      age: 8,  gender: 'Female', bloodType: 'A+',  phone: '+91-10987-65432', department: 'Pediatrics',   doctor: 'Dr. Meena Iyer',    status: 'ACTIVE',     admittedAt: new Date('2026-07-08'), diagnosis: 'Pneumonia',   roomNumber: '115' },
  { name: 'Suresh Babu',       age: 53, gender: 'Male',   bloodType: 'B+',  phone: '+91-90876-54321', department: 'Cardiology',   doctor: 'Dr. Rajesh Kumar',  status: 'CRITICAL',   admittedAt: new Date('2026-07-07'), diagnosis: 'Heart Failure',roomNumber:'ICU-2' },
  { name: 'Preethi Srinivasan',age: 38, gender: 'Female', bloodType: 'AB-', phone: '+91-80765-43210', department: 'Dermatology',  doctor: 'Dr. Kavita Rao',    status: 'ACTIVE',     admittedAt: new Date('2026-07-09'), diagnosis: 'Eczema',      roomNumber: '408' },
  { name: 'Vijay Anand',       age: 66, gender: 'Male',   bloodType: 'O+',  phone: '+91-70654-32109', department: 'Neurology',    doctor: 'Dr. Priya Sharma',  status: 'ACTIVE',     admittedAt: new Date('2026-07-02'), diagnosis: 'Epilepsy',    roomNumber: '210' },
];

async function main() {
  console.log('Seeding database with patients...');
  
  for (const [index, patient] of patients.entries()) {
    const patientCode = `P${String(index + 1).padStart(3, '0')}`;
    await prisma.patient.upsert({
      where: { patientCode },
      update: {},
      create: {
        ...patient,
        patientCode,
        status: patient.status as any,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
