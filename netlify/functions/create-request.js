const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const body = JSON.parse(event.body);
  const { jobRef } = body;
  const token = process.env.DROPBOX_TOKEN;

  const requestBody = JSON.stringify({
    title: jobRef,
    destination: `/OTTO WERKS/z(TEST) Project Management - Eli Only/WERKS Photo Intake/${jobRef}`,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.dropboxapi.com',
      path: '/2/file_requests/create',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Dropbox-API-Select-User': 'dbmid:AABAUu5HZcX1wqkIDscPOq2Rk6YfBJsNWLU',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ url: parsed.url })
          });
        } else {
          resolve({
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: data
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ statusCode: 500, body: e.message });
    });

    req.write(requestBody);
    req.end();
  });
};
