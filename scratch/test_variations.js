const https = require('https');

const variations = [
  'https://www.thestampmaker.com/images/products/trodat-4911.jpg',
  'https://www.thestampmaker.com/images/products/trodat-printy-4911.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4911-printy.jpg',
  'https://www.thestampmaker.com/images/products/printy-4911.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4911-self-inking-stamp.jpg',
  'https://www.thestampmaker.com/images/products/4911.jpg',
  'https://www.thestampmaker.com/images/products/4911-trodat.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4911-eco-printy.jpg',
  'https://www.thestampmaker.com/images/products/trodat-4911-eco.jpg',
  'https://www.thestampmaker.com/images/products/trodat-printy-4911-eco.jpg'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      console.log(`${url} -> status: ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.log(`${url} -> error: ${err.message}`);
      resolve();
    }).end();
  });
}

async function run() {
  for (const url of variations) {
    await checkUrl(url);
  }
}

run();
