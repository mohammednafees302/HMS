const https = require('https');

const data = JSON.stringify({ email: 'admin@medicore.in', password: 'password123' });

const options = {
  hostname: 'hms-mo7g.onrender.com',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(`STATUS: ${res.statusCode}
BODY: ${body}`));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
