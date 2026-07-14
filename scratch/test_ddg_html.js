const https = require('https');
const fs = require('fs');

const url = 'https://html.duckduckgo.com/html/?q=Trodat+Professional+5200+stamp';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('C:/Users/User/Desktop/Project/react/scratch/ddg_raw.html', data);
    console.log('Done dumping. Status:', res.statusCode);
    
    // Extract results
    const regex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    const snippets = [];
    while ((match = regex.exec(data)) !== null) {
      snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
    }
    console.log('Snippets:', snippets.slice(0, 5));
  });
});
