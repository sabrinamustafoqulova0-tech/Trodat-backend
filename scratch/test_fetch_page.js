const https = require('https');

const url = 'https://www.thestampmaker.com/trodat-printy-4911-self-inking-stamp.aspx';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    // Find all images that contain "/products/"
    const regex = /src="([^"]+?\/products\/[^"]+?)"/gi;
    let match;
    const images = [];
    while ((match = regex.exec(data)) !== null) {
      images.push(match[1]);
    }
    console.log('Found product images:', images);
  });
}).on('error', (err) => {
  console.error(err);
});
