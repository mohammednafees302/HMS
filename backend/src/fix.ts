import { prisma } from './config/db';

async function fix() {
  await prisma.user.updateMany({
    where: { email: 'admin@medicore.in' },
    data: { role: 'ADMIN' }
  });
  console.log('Fixed admin role');
  
  try {
    await prisma.user.create({
      data: {
        name: 'New Test User',
        email: 'newuser@hms.test',
        password: 'hashedpassword',
        role: 'PATIENT'
      }
    });
  } catch(e) {}
}

fix().finally(() => prisma.$disconnect());
