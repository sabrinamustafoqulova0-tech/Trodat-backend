const https = require('https');

const urls = [
  'https://www.thestampmaker.com/images/products/trodat-5480.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas',
  'https://www.thestampmaker.com/images/products/trodat-4911.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas',
  'https://www.thestampmaker.com/images/products/trodat-4912.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas',
  'https://www.thestampmaker.com/images/products/trodat-4913.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas',
  'https://www.thestampmaker.com/images/products/trodat-4750.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas',
  'https://www.thestampmaker.com/images/products/trodat-5200.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas'
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
