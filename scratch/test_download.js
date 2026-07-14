const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://www.thestampmaker.com/images/products/trodat-5480.jpg.ashx?width=600&height=600&quality=90&format=webp&scale=canvas';
const dest = path.join(__dirname, 'test_5480.webp');

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed. File size:', fs.statSync(dest).size);
  });
}).on('error', (err) => {
  console.error('Error downloading:', err);
});
