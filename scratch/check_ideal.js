const https = require('https');
const headers = { 'User-Agent': 'Mozilla/5.0' };

https.get('https://trodat-russia.ru/catalog/ideal/', { headers }, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const regex = /href="([^"]+)"/gi;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
      if (match[1].includes('/catalog/ideal/')) {
        links.push(match[1]);
      }
    }
    console.log(Array.from(new Set(links)));
  });
});
