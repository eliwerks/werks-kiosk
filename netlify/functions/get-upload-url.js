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
  const { fileName } = body;
  const token = process.env.DROPBOX_TOKEN;

  const dropboxArg = JSON.stringify({
    path: `/OTTO WERKS/z(TEST) Project Management - Eli Only/WERKS Photo Intake/${fileName}`,
    mode: 'add',
    autorename: true
  });

  const requestBody = JSON.stringify({
    commit_info: {
      path: `/OTTO WERKS/z(TEST) Project Management - Eli Only/WERKS Photo Intake/${fileName}`,
      mode: 'add',
      autorename: true,
      mute: false
    },
    duration: 14400
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.dropboxapi.com',
      path: '/2/files/get_temporary_upload_link',
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
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ uploadUrl: parsed.link })
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
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: e.message
      });
    });

    req.write(requestBody);
    req.end();
  });
};
