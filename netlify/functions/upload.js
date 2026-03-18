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
  const { fileName, fileData } = body;
  const token = process.env.DROPBOX_TOKEN;

  const fileBuffer = Buffer.from(fileData, 'base64');

  const dropboxArg = JSON.stringify({
    path: `/OTTO WERKS/z(TEST) Project Management - Eli Only/WERKS Photo Intake/${fileName}`,
    mode: 'add',
    autorename: true,
    mute: false
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'content.dropboxapi.com',
      path: '/2/files/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': dropboxArg,
        'Content-Length': fileBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode === 200 ? 200 : 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: data
        });
      });
    });

    req.on('error', (e) => {
      resolve({ 
        statusCode: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: e.message 
      });
    });

    req.write(fileBuffer);
    req.end();
  });
};
