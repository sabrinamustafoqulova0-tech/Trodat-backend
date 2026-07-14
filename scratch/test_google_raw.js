const https = require('https');
const fs = require('fs');

const url = 'https://www.google.com/search?q=Trodat+Professional+5200+stamp&tbm=isch';

// Use a basic / old user agent
const headers = {
  'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('C:/Users/User/Desktop/Project/react/scratch/google_raw.html', data);
    console.log('Done dumping. Status:', res.statusCode);
  });
});
