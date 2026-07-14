const https = require('https');

const urls = [
  'https://www.thestampmaker.com/images/products/trodat-5480.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4911.jpg',
  'https://www.thestampmaker.com/images/products/trodat-9411.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4750.jpg',
  'https://www.thestampmaker.com/images/products/trodat-ideal-seal.jpg',
  'https://www.thestampmaker.com/images/products/trodat-ideal.jpg'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      console.log(`${url} -> status: ${res.statusCode}, content-type: ${res.headers['content-type']}`);
      resolve();
    }).on('error', (err) => {
      console.log(`${url} -> error: ${err.message}`);
      resolve();
    }).end();
  });
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
