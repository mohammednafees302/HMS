import { prisma } from './prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@medicore.in';
  const password = 'password123';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      name: 'System Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      phone: '+1234567890'
    }
  });

  console.log(`Admin account created/updated: ${user.email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
