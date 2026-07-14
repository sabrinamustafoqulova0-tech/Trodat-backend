const https = require('https');

const query = 'Trodat Printy 4911 stamp';
const url = `https://duckduckgo.com/d.js?q=${encodeURIComponent(query)}&t=D&l=us-en&s=0&dl=en&ct=US&sp=1&images=1`;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Referer': 'https://duckduckgo.com/'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data sample (first 500 chars):', data.substring(0, 500));
    
    // Parse JSON or extract URLs using regex
    const urls = [];
    const imageRegex = /"image"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = imageRegex.exec(data)) !== null) {
      urls.push(match[1]);
    }
    console.log('Found DDG images:', urls.slice(0, 5));
  });
}).on('error', (err) => {
  console.error(err);
});
