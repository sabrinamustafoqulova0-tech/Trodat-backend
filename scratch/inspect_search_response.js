const https = require('https');
const fs = require('fs');

const query = 'Trodat Mobile Printy 9413 stamp';
const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('C:/Users/User/Desktop/Project/react/scratch/ddg_debug.html', data);
    console.log('Status:', res.statusCode);
    console.log('HTML Length:', data.length);
    console.log('Contains bot/limit:', data.toLowerCase().includes('limit') || data.toLowerCase().includes('block') || data.toLowerCase().includes('robot') || data.toLowerCase().includes('captcha'));
  });
});
