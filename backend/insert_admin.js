const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const url = 'postgresql://postgres.tdjeynffheaylpdktgvl:nafees_2004%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString: url });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    const email = 'admin@medicore.in';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "phone", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'System Admin', $1, $2, 'ADMIN', '+1234567890', NOW(), NOW())
      ON CONFLICT ("email") 
      DO UPDATE SET "passwordHash" = $2, "role" = 'ADMIN';
    `;
    
    await client.query(query, [email, passwordHash]);
    console.log('Admin user created successfully via direct pg query!');
    
  } catch (err) {
    console.error('Failed to create user:', err);
  } finally {
    await client.end();
  }
}

run();
