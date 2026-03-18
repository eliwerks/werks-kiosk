const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const body = JSON.parse(event.body);
  const { jobRef } = body;
  const token = process.env.DROPBOX_TOKEN;

  const requestBody = JSON.stringify({
    title: jobRef,
    destination: `/Werks Photo Intake/${jobRef}`,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.dropboxapi.com',
      path: '/2/file_requests/create',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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
            body: JSON.stringify({ url: parsed.url })
          });
        } else {
          resolve({
            statusCode: 500,
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
