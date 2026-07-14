const https = require('https');
const headers = { 'User-Agent': 'Mozilla/5.0' };

https.get('https://trodat-russia.ru/types/osnastki-dlya-relefny%D1%81h-pechatey/', { headers }, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const regex = /src="([^"]+)"/gi;
    let match;
    const imgs = [];
    while ((match = regex.exec(html)) !== null) {
      if (match[1].includes('/upload/')) {
        imgs.push(match[1]);
      }
    }
    console.log(imgs);
  });
}).on('error', (e) => console.log('Err:', e.message));
