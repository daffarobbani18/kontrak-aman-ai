const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@52.184.85.27:5433/kontrakaman'
});

async function main() {
  await client.connect();
  const res = await client.query(`UPDATE "users" SET email_verified = true WHERE email = 'd.robbani18@gmail.com'`);
  console.log('User verified!', res.rowCount);
  await client.end();
}

main().catch(console.error);
