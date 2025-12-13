const https = require('https');
const http = require('http');

// Make a request to the vendor stats endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/vendors/stats',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer invalid-token-for-testing'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Body: ${data}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();