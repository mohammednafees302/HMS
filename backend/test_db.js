const { Client } = require('pg');

async function testConnection(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('SUCCESS:', url);
    await client.end();
  } catch (err) {
    console.error('FAILED:', url, err.message);
  }
}

async function run() {
  await testConnection('postgresql://postgres.tdjeynffheaylpdktgvl:nafees_2004%23@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true');
  await testConnection('postgresql://postgres:nafees_2004%23@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true');
  await testConnection('postgresql://postgres.tdjeynffheaylpdktgvl:nafees_2004%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres');
  await testConnection('postgresql://postgres:nafees_2004%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres');
}

run();
